import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/client";
import { resolveMediaUrl } from "@/lib/media";
import type { Brand } from "@/lib/types/product";

export async function GET() {
  try {
    const brands = await backendFetch<Brand[]>("/brands");
    const mapped = brands.map((brand) => ({
      ...brand,
      logo: resolveMediaUrl(brand.logo),
    }));
    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[GET /api/brands]", error);
    const missingBackend =
      error instanceof Error && error.message.includes("BACKEND_API_URL");
    return NextResponse.json(
      {
        message: missingBackend
          ? "BACKEND_API_URL chưa được cấu hình trên môi trường deploy"
          : "Không thể tải danh sách thương hiệu",
      },
      { status: 502 },
    );
  }
}
