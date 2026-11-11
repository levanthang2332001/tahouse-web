import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/client";
import { getSavedHeroBanners } from "@/lib/server/hero-banners";
import { getSavedStoreImages } from "@/lib/server/store-images";
import type { StoreSettings } from "@/lib/types/store-settings";

export async function GET() {
  try {
    const [settings, savedBanners, savedStoreImages] = await Promise.all([
      backendFetch<StoreSettings>("/settings").catch(() => null),
      getSavedHeroBanners(),
      getSavedStoreImages(),
    ]);

    const heroBanners =
      Array.isArray(settings?.heroBanners) && settings.heroBanners.length > 0 && settings.heroBanners[0] !== "/parner.jpg"
        ? settings.heroBanners
        : savedBanners;

    const storeImages =
      Array.isArray(settings?.storeImages) && settings.storeImages.length > 0
        ? settings.storeImages
        : savedStoreImages;

    return NextResponse.json(
      {
        ...(settings || {}),
        heroBanners,
        storeImages,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error) {
    console.warn("[GET /api/settings] fallback:", error);
    const [heroBanners, storeImages] = await Promise.all([
      getSavedHeroBanners(),
      getSavedStoreImages(),
    ]);
    return NextResponse.json(
      {
        heroBanners,
        storeImages,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
