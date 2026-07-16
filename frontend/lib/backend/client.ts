import { getBackendUrl } from "@/lib/backend/config";

type ApiEnvelope<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
};

export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${base}${normalizedPath}`, {
    ...init,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Backend request failed (${res.status}): ${normalizedPath}`);
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  return json.data;
}
