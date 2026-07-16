import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/client";
import { mapProductDetail } from "@/lib/backend/map-product";
import type { Product } from "@/lib/types/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await backendFetch<Product>(
      `/products/locks/${encodeURIComponent(id)}`,
    );
    return NextResponse.json(mapProductDetail(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("(404)")) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json(
      { message: "Không thể tải chi tiết sản phẩm" },
      { status: 502 },
    );
  }
}
