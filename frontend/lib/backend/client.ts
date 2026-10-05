import { Agent, fetch as undiciFetch } from "undici";
import { getBackendUrl } from "@/lib/backend/config";

type ApiEnvelope<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
};

/**
 * Bug root cause:
 * Next.js/Node `fetch` uses undici with a default **connect** timeout of 10s.
 * Opening BE in the browser works (longer timeout / already warm), but the
 * server-side BFF call fails with ConnectTimeoutError → FE returns 502.
 * AbortController alone does NOT raise undici's connect timeout.
 */
const BACKEND_TIMEOUT_MS = 60_000;
const BACKEND_RETRIES = 1;

const backendAgent = new Agent({
  connectTimeout: BACKEND_TIMEOUT_MS,
  headersTimeout: BACKEND_TIMEOUT_MS,
  bodyTimeout: BACKEND_TIMEOUT_MS,
});

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.name} ${error.message}`.toLowerCase();
  const cause =
    error.cause instanceof Error
      ? `${error.cause.name} ${error.cause.message}`.toLowerCase()
      : "";
  const haystack = `${message} ${cause}`;
  return (
    haystack.includes("timeout") ||
    haystack.includes("connect") ||
    haystack.includes("fetch failed") ||
    haystack.includes("econnreset") ||
    haystack.includes("enotfound") ||
    haystack.includes("abort")
  );
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  let lastError: unknown;

  for (let attempt = 0; attempt <= BACKEND_RETRIES; attempt += 1) {
    try {
      const res = await undiciFetch(url, {
        method: init?.method,
        headers: init?.headers as Record<string, string> | undefined,
        body: init?.body as string | undefined,
        dispatcher: backendAgent,
        // undici types differ slightly from DOM RequestInit
      });

      if (!res.ok) {
        throw new Error(
          `Backend request failed (${res.status}): ${normalizedPath}`,
        );
      }

      const json = (await res.json()) as ApiEnvelope<T>;
      return json.data;
    } catch (error) {
      lastError = error;
      if (attempt >= BACKEND_RETRIES || !isRetryableFetchError(error)) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Backend request failed: ${normalizedPath}`);
}
