// Public products API handler
import { NextRequest, NextResponse } from "next/server";
import { getMergedProducts } from "@/lib/admin/product-store";
import {
  buildSidebarSectionsFromBrands,
  SIDEBAR_SECTIONS,
} from "@/data/catalog-taxonomy";
import { backendFetch } from "@/lib/backend/client";
import { mapProductListItem } from "@/lib/backend/map-product";
import { resolveKitchenCategorySlugs } from "@/lib/product-filters";
import type { Brand, Product, ProductsListResponse } from "@/lib/types/product";

const GROUP_PAGE_FETCH_LIMIT = 1000;

function buildBackendPath(searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `/products/locks?${query}` : "/products/locks";
}

function sortProducts(items: Product[], sortBy: string | null): Product[] {
  const sorted = [...items];
  if (sortBy === "price-asc") {
    sorted.sort(
      (a, b) =>
        (a.price ?? Number.POSITIVE_INFINITY) -
        (b.price ?? Number.POSITIVE_INFINITY),
    );
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
    category?: string | null;
  },
): Product[] {
  const brand = params.brand?.trim().toLowerCase();
  const search = params.search?.trim().toLowerCase();
  const category = params.category?.trim().toLowerCase();
  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  return items.filter((item) => {
    if (
      category &&
      category !== "all" &&
      category !== "lock-parent" &&
      item.category?.toLowerCase() !== category &&
      item.subcategory?.toLowerCase() !== category
    ) {
      return false;
    }
    if (
      brand &&
      item.brandSlug?.toLowerCase() !== brand &&
      item.brand?.toLowerCase() !== brand
    ) {
      return false;
    }
    if (search) {
      const haystack = `${item.name} ${item.code} ${item.brand}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (
      minPrice !== null &&
      !Number.isNaN(minPrice) &&
      (item.price ?? 0) < minPrice
    ) {
      return false;
    }
    if (
      maxPrice !== null &&
      !Number.isNaN(maxPrice) &&
      (item.price ?? Number.POSITIVE_INFINITY) > maxPrice
    ) {
      return false;
    }
    return true;
  });
}

async function fetchMergedCategoryGroup(
  request: NextRequest,
  categories: string[],
): Promise<ProductsListResponse> {
  const page = Math.max(
    1,
    Number(request.nextUrl.searchParams.get("page") || "1"),
  );
  const limit = Math.max(
    1,
    Number(request.nextUrl.searchParams.get("limit") || "21"),
  );
  const sortBy = request.nextUrl.searchParams.get("sortBy");

  if (categories.length === 0) {
    return { items: [], total: 0, page, limit };
  }

  const pages = await Promise.all(
    categories.map(async (category) => {
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

async function resolveExtrasCategorySlugs(): Promise<string[]> {
  const brands = await backendFetch<Brand[]>("/brands");
  const sections = buildSidebarSectionsFromBrands(brands, SIDEBAR_SECTIONS);
  const extras = sections.find((section) => section.id === "danh-muc-moi");
  return extras?.subcategories.map((sub) => sub.id) ?? [];
}

export async function GET(request: NextRequest) {
  try {
    const group = request.nextUrl.searchParams.get("group");

    let data: ProductsListResponse;

    if (group === "kitchen") {
      const brands = await backendFetch<Brand[]>("/brands");
      data = await fetchMergedCategoryGroup(
        request,
        resolveKitchenCategorySlugs(brands),
      );
    } else if (group === "extras") {
      data = await fetchMergedCategoryGroup(
        request,
        await resolveExtrasCategorySlugs(),
      );
    } else {
      // Use local overlay merged products to include custom admin creations/updates
      const page = Math.max(
        1,
        Number(request.nextUrl.searchParams.get("page") || "1"),
      );
      const limit = Math.max(
        1,
        Number(request.nextUrl.searchParams.get("limit") || "21"),
      );
      const sortBy = request.nextUrl.searchParams.get("sortBy");

      let allMerged = await getMergedProducts();

      allMerged = applyClientFilters(allMerged, {
        category: request.nextUrl.searchParams.get("category"),
        brand: request.nextUrl.searchParams.get("brand"),
        search: request.nextUrl.searchParams.get("search"),
        minPrice: request.nextUrl.searchParams.get("minPrice"),
        maxPrice: request.nextUrl.searchParams.get("maxPrice"),
      });

      allMerged = sortProducts(allMerged, sortBy);

      const total = allMerged.length;
      const start = (page - 1) * limit;
      const pageItems = allMerged.slice(start, start + limit);

      data = {
        items: pageItems,
        total,
        page,
        limit,
      };
    }

    return NextResponse.json(
      {
        ...data,
        items: data.items.map(mapProductListItem),
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
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
