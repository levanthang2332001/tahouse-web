import { cache } from "react";
import { backendFetch } from "@/lib/backend/client";
import { FALLBACK_STORE_INFO, toStoreInfo, type StoreInfo } from "@/lib/store-info";
import type { StoreSettings } from "@/lib/types/store-settings";

const TTL_MS = 60 * 1000;
let cached: { at: number; info: StoreInfo } | null = null;

/**
 * Public store contact details from `GET /settings`, cached for a minute across requests
 * (admin edits show up within that window) and memoized per request.
 * Never throws: on failure the last good value, or the hardcoded fallback, is served.
 */
export const getStoreInfo = cache(async (): Promise<StoreInfo> => {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.info;
  try {
    const settings = await backendFetch<StoreSettings>("/settings");
    const info = toStoreInfo(settings);
    cached = { at: Date.now(), info };
    return info;
  } catch (error) {
    console.warn("[getStoreInfo] settings unavailable, using fallback:", error);
    return cached?.info ?? FALLBACK_STORE_INFO;
  }
});
