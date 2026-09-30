import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { decodeJwtPayload, isTokenExpired } from "@/lib/admin/api-client";

export const ADMIN_COOKIE_NAME = "tahouse_admin_session";
export const ADMIN_ACCESS_TOKEN_COOKIE = "tahouse_admin_access_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "tahouse_admin_refresh_token";

export const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "tahouse-super-secret-admin-token-2026";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: string;
}

export function createAdminToken(user: AdminUser): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days in seconds
    iss: "tahouse-fe",
  };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(signingInput)
    .digest("base64url");

  return `${signingInput}.${signature}`;
}

export function verifyAdminToken(token?: string | null): AdminUser | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    const expSeconds = payload.exp
      ? payload.exp > 1e11
        ? Math.floor(payload.exp / 1000)
        : payload.exp
      : undefined;

    if (expSeconds && Date.now() / 1000 > expSeconds) {
      return null;
    }

    // Verify cryptographic signature if issued by frontend session generator
    interface TokenWithIssuer {
      iss?: string;
    }
    const tokenMeta = payload as TokenWithIssuer;

    if (tokenMeta.iss === "tahouse-fe") {
      const signingInput = `${parts[0]}.${parts[1]}`;
      const expectedSignature = crypto
        .createHmac("sha256", ADMIN_SESSION_SECRET)
        .update(signingInput)
        .digest("base64url");

      const sigBuffer = Buffer.from(parts[2]);
      const expBuffer = Buffer.from(expectedSignature);

      if (
        sigBuffer.length !== expBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expBuffer)
      ) {
        return null;
      }
    }

    interface ExtendedPayload {
      id?: string;
      name?: string;
      avatarUrl?: string;
    }
    const ext = payload as ExtendedPayload;

    return {
      id: payload.sub || ext.id || "admin-user",
      username: payload.username || "admin",
      name: payload.fullName || ext.name || payload.username || "Quản trị viên",
      email: payload.email,
      avatarUrl: ext.avatarUrl,
      role: payload.role || "superadmin",
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken && !isTokenExpired(accessToken)) {
    const user = verifyAdminToken(accessToken);
    if (user) return user;
  }

  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionToken) {
    const user = verifyAdminToken(sessionToken);
    if (user) return user;
  }

  // If accessToken expired, check if refresh token is still valid (7 days)
  const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken && !isTokenExpired(refreshToken)) {
    const user = verifyAdminToken(refreshToken);
    if (user) return user;
  }

  return null;
}

export function checkAdminRequestAuth(request: NextRequest): AdminUser | null {
  // 1. Check access token cookie
  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    const user = verifyAdminToken(accessToken);
    if (user) return user;
  }

  // 2. Check refresh token cookie (means user is logged in, token might need refresh)
  const refreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    const user = verifyAdminToken(refreshToken);
    if (user) return user;
  }

  // 3. Check signed frontend session cookie
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionToken) {
    const user = verifyAdminToken(sessionToken);
    if (user) return user;
  }

  // 4. Check Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token);
  }

  return null;
}
