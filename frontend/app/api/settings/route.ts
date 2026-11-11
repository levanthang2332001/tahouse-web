import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/client";
import { STORE_IMAGES } from "@/data/home-data";
import type { StoreSettings } from "@/lib/types/store-settings";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };

/** Chỉ dùng khi backend không phản hồi; khi backend trả về thì luôn dùng dữ liệu backend. */
const FALLBACK_HERO_BANNERS = ["/parner.jpg"];
const FALLBACK_PROMO_BANNERS = ["/promo/uudai.jpg"];

export async function GET() {
  try {
    const settings = await backendFetch<StoreSettings>("/settings");
    return NextResponse.json(
      {
        ...settings,
        heroBanners: settings.heroBanners?.length ? settings.heroBanners : FALLBACK_HERO_BANNERS,
        storeImages: settings.storeImages?.length ? settings.storeImages : STORE_IMAGES,
        // Mảng rỗng nghĩa là admin đã tắt banner ưu đãi, chỉ dùng mặc định khi backend chưa có field này
        promoBanners: Array.isArray(settings.promoBanners)
          ? settings.promoBanners
          : FALLBACK_PROMO_BANNERS,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.warn("[GET /api/settings] backend unavailable, using fallback:", error);
    return NextResponse.json(
      {
        heroBanners: FALLBACK_HERO_BANNERS,
        storeImages: STORE_IMAGES,
        promoBanners: FALLBACK_PROMO_BANNERS,
      },
      { headers: NO_STORE },
    );
  }
}
