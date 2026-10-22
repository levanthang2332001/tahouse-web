import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetch as undiciFetch } from "undici";
import { getBackendUrl } from "@/lib/backend/config";
import { backendAgent, isRetryableFetchError } from "@/lib/backend/client";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@/lib/admin/auth";

/** Backend failure that keeps the upstream HTTP status, so routes can pass 4xx through instead of guessing */
export class BackendError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

/**
 * JSON error response for admin API routes: backend 4xx (validation, not found, conflict) keep their status,
 * an expired session is 401, anything else (network, 5xx) is a 502 from the backend.
 */
export function adminErrorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error && error.message ? error.message : fallback;
  let status = 502;
  if (error instanceof BackendError && error.status >= 400 && error.status < 500) status = error.status;
  else if (message.startsWith("UNAUTHORIZED")) status = 401;
  return NextResponse.json({ message }, { status });
}

interface BackendApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

interface JwtPayload {
  sub?: string;
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  exp?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1];
    const jsonStr = Buffer.from(base64, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  const expSeconds = payload.exp > 1e11 ? Math.floor(payload.exp / 1000) : payload.exp;
  // If expiring in less than 30 seconds, consider expired
  return Date.now() / 1000 >= expSeconds - 30;
}

/**
 * Perform a token refresh on the backend using the refresh token
 */
export async function refreshAdminAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const base = getBackendUrl();
    const res = await undiciFetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TA House Admin BFF/1.0",
      },
      body: JSON.stringify({ refreshToken }),
      dispatcher: backendAgent,
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as BackendApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>;

    if (body.success && body.data?.accessToken) {
      return body.data;
    }
    return null;
  } catch (error) {
    console.error("[refreshAdminAccessToken] Error:", error);
    return null;
  }
}

/**
 * Get a valid access token. Automatically refreshes if expired.
 */
export async function getValidAdminAccessToken(fallbackToken?: string): Promise<string | null> {
  if (fallbackToken && !isTokenExpired(fallbackToken)) {
    return fallbackToken;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  // Token is expired or missing, try refresh
  if (refreshToken) {
    const tokens = await refreshAdminAccessToken(refreshToken);
    if (tokens) {
      try {
        cookieStore.set({
          name: ADMIN_ACCESS_TOKEN_COOKIE,
          value: tokens.accessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });
        cookieStore.set({
          name: ADMIN_REFRESH_TOKEN_COOKIE,
          value: tokens.refreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });
      } catch {
        // Can fail if called in Server Component where cookies are read-only
      }
      return tokens.accessToken;
    }
  }

  if (fallbackToken) {
    return fallbackToken;
  }

  return null;
}

/**
 * Authenticated fetch to backend for admin endpoints
 */
export async function adminBackendFetch<T>(
  path: string,
  init?: RequestInit,
  explicitToken?: string,
): Promise<T> {
  let token = await getValidAdminAccessToken(explicitToken);

  if (!token) {
    throw new BackendError(401, "UNAUTHORIZED: Phiên làm việc đã hết hạn hoặc chưa đăng nhập");
  }

  const base = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  const rawHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "TA House Admin BFF/1.0",
  };

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((v, k) => {
        rawHeaders[k] = v;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([k, v]) => {
        rawHeaders[k] = v;
      });
    } else {
      Object.assign(rawHeaders, init.headers);
    }
  }

  if (!rawHeaders["Content-Type"] && init?.body && typeof init.body === "string") {
    rawHeaders["Content-Type"] = "application/json";
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= 1; attempt += 1) {
    try {
      let res = await undiciFetch(url, {
        method: init?.method,
        headers: rawHeaders,
        body: init?.body as string | undefined,
        dispatcher: backendAgent,
      });

      // Handle 401: try refreshing once if access token might have been invalidated
      if (res.status === 401) {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
        if (refreshToken) {
          const refreshed = await refreshAdminAccessToken(refreshToken);
          if (refreshed) {
            token = refreshed.accessToken;
            rawHeaders["Authorization"] = `Bearer ${token}`;
            try {
              cookieStore.set({
                name: ADMIN_ACCESS_TOKEN_COOKIE,
                value: refreshed.accessToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
              });
              cookieStore.set({
                name: ADMIN_REFRESH_TOKEN_COOKIE,
                value: refreshed.refreshToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
              });
            } catch {
              // Can fail if called in Server Component where cookies are read-only
            }
            res = await undiciFetch(url, {
              method: init?.method,
              headers: rawHeaders,
              body: init?.body as string | undefined,
              dispatcher: backendAgent,
            });
          }
        }
      }

      if (!res.ok) {
        let errorMsg = `Lỗi từ hệ thống backend (${res.status})`;
        try {
          const errorJson = (await res.json()) as { message?: string | string[] };
          if (errorJson?.message) {
            errorMsg = Array.isArray(errorJson.message)
              ? errorJson.message.join(", ")
              : typeof errorJson.message === "string"
              ? errorJson.message
              : JSON.stringify(errorJson.message);
          }
        } catch {
          // fallback
        }
        throw new BackendError(res.status, errorMsg);
      }

      const json = (await res.json()) as BackendApiResponse<T>;
      return json.data;
    } catch (error) {
      lastError = error;
      // The backend answered: retrying would not change the result and could repeat a write
      if (attempt >= 1 || error instanceof BackendError || !isRetryableFetchError(error)) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Backend request failed: ${normalizedPath}`);
}
