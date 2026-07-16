import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/client";
import { mapProductListItem } from "@/lib/backend/map-product";
import type { ProductsListResponse } from "@/lib/types/product";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.toString();
    const path = query ? `/products/locks?${query}` : "/products/locks";
    const data = await backendFetch<ProductsListResponse>(path);

    return NextResponse.json(
      {
        ...data,
        items: data.items.map(mapProductListItem),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { message: "Không thể tải danh sách sản phẩm" },
      { status: 502 },
    );
  }
}
