import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend/client";
import { mapProductListItem } from "@/lib/backend/map-product";
import { KITCHEN_CATEGORY_SLUGS } from "@/lib/product-filters";
import type { Product, ProductsListResponse } from "@/lib/types/product";

const GROUP_PAGE_FETCH_LIMIT = 200;

function buildBackendPath(searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `/products/locks?${query}` : "/products/locks";
}

function sortProducts(
  items: Product[],
  sortBy: string | null,
): Product[] {
  const sorted = [...items];
  if (sortBy === "price-asc") {
    sorted.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
  } else if (sortBy === "price-desc") {
    sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  }
  return sorted;
}

function applyClientFilters(
  items: Product[],
  params: {
    brand?: string | null;
    search?: string | null;
    minPrice?: string | null;
    maxPrice?: string | null;
  },
): Product[] {
  const brand = params.brand?.trim().toLowerCase();
  const search = params.search?.trim().toLowerCase();
  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  return items.filter((item) => {
    if (brand && item.brandSlug?.toLowerCase() !== brand && item.brand?.toLowerCase() !== brand) {
      return false;
    }
    if (search) {
      const haystack = `${item.name} ${item.code} ${item.brand}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (minPrice !== null && !Number.isNaN(minPrice) && (item.price ?? 0) < minPrice) {
      return false;
    }
    if (maxPrice !== null && !Number.isNaN(maxPrice) && (item.price ?? Number.POSITIVE_INFINITY) > maxPrice) {
      return false;
    }
    return true;
  });
}

async function fetchKitchenGroup(
  request: NextRequest,
): Promise<ProductsListResponse> {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") || "1"));
  const limit = Math.max(1, Number(request.nextUrl.searchParams.get("limit") || "21"));
  const sortBy = request.nextUrl.searchParams.get("sortBy");

  const pages = await Promise.all(
    KITCHEN_CATEGORY_SLUGS.map(async (category) => {
      const params = new URLSearchParams({
        page: "1",
        limit: String(GROUP_PAGE_FETCH_LIMIT),
        category,
      });
      return backendFetch<ProductsListResponse>(buildBackendPath(params));
    }),
  );

  const byId = new Map<string, Product>();
  for (const result of pages) {
    for (const item of result.items) {
      byId.set(item.id, item);
    }
  }

  let items = applyClientFilters([...byId.values()], {
    brand: request.nextUrl.searchParams.get("brand"),
    search: request.nextUrl.searchParams.get("search"),
    minPrice: request.nextUrl.searchParams.get("minPrice"),
    maxPrice: request.nextUrl.searchParams.get("maxPrice"),
  });

  items = sortProducts(items, sortBy);

  const total = items.length;
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  return {
    items: pageItems,
    total,
    page,
    limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    const group = request.nextUrl.searchParams.get("group");

    let data: ProductsListResponse;

    if (group === "kitchen") {
      data = await fetchKitchenGroup(request);
    } else {
      const params = new URLSearchParams(request.nextUrl.searchParams);
      params.delete("group");
      data = await backendFetch<ProductsListResponse>(buildBackendPath(params));
    }

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
    const missingBackend =
      error instanceof Error && error.message.includes("BACKEND_API_URL");
    return NextResponse.json(
      {
        message: missingBackend
          ? "BACKEND_API_URL chưa được cấu hình trên môi trường deploy"
          : "Không thể tải danh sách sản phẩm",
      },
      { status: 502 },
    );
  }
}
