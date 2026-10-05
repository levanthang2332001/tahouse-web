import { NextResponse } from "next/server";
import { getAllBrandsWithStats } from "@/lib/admin/brand-store";

export async function GET() {
  try {
    const brands = await getAllBrandsWithStats();
    return NextResponse.json(brands, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[GET /api/brands]", error);
    return NextResponse.json(
      { message: "Không thể tải danh sách thương hiệu" },
      { status: 500 },
    );
  }
}
