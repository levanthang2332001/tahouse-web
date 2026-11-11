import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, adminErrorResponse } from "@/lib/admin/api-client";
import { invalidateRemoteProductsCache, PRODUCT_SECTORS } from "@/lib/admin/product-store";
import { getDashboardStats } from "@/lib/admin/dashboard-stats";
import type { Product } from "@/lib/types/product";
import {
  badRequest,
  prepareProductPayload,
  readJsonObject,
  requireAdmin,
  validateProductBody,
} from "./_lib/product-payload";

interface BackendProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const brand = searchParams.get("brand")?.trim() || "";
    const sortBy = searchParams.get("sortBy")?.trim() || "newest";
    const forceRefresh = searchParams.get("refresh") === "true";

    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const parsedLimit = parseInt(searchParams.get("limit") || "16", 10);
    const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 16 : Math.min(parsedLimit, 100);

    // Build backend query parameters
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));

    if (search) {
      query.set("search", search);
    }

    if (brand && brand !== "all") {
      query.set("brand", brand);
    }

    if (sortBy && sortBy !== "newest") {
      query.set("sortBy", sortBy);
    }

    // Check if category is a sector or specific slug
    let isSectorQuery = false;
    let sectorSlugs: string[] = [];

    if (category && category !== "all") {
      const sector = PRODUCT_SECTORS.find((s) => s.id === category);
      if (sector) {
        // If it is 'thiet-bi-nha-bep', backend directly matches category='thiet-bi-nha-bep'
        if (category === "thiet-bi-nha-bep") {
          query.set("category", "thiet-bi-nha-bep");
        } else {
          isSectorQuery = true;
          sectorSlugs = sector.slugs;
        }
      } else {
        query.set("category", category);
      }
    }

    let items: Product[] = [];
    let total = 0;
    let totalPages = 1;

    if (!isSectorQuery) {
      // Normal direct backend query
      const backendData = await adminBackendFetch<BackendProductListResponse>(
        `/admin/products?${query.toString()}`,
      );
      items = backendData.items || [];
      total = backendData.total || 0;
      totalPages = Math.max(1, Math.ceil(total / limit));
    } else {
      // For sectors spanning multiple categories, fetch and filter
      const allData = await adminBackendFetch<BackendProductListResponse>(
        `/admin/products?page=1&limit=2500${search ? `&search=${encodeURIComponent(search)}` : ""}${brand && brand !== "all" ? `&brand=${encodeURIComponent(brand)}` : ""}`,
      );
      const filtered = (allData.items || []).filter((p) =>
        sectorSlugs.includes(p.category || ""),
      );
      total = filtered.length;
      totalPages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      items = filtered.slice(start, start + limit);
    }

    // Include dashboard stats
    const stats = await getDashboardStats(forceRefresh);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages,
      stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return adminErrorResponse(error, "Không thể lấy danh sách sản phẩm từ hệ thống");
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu gửi lên không đúng định dạng JSON");

  const invalid = validateProductBody(body, "create");
  if (invalid) return badRequest(invalid);

  try {
    // Brand → UUID, and the category/subcategory are added to the brand tree *before* the product is
    // created (the backend rejects categories it does not know). If that fails nothing is created.
    const prepared = await prepareProductPayload(body, "create");
    if (prepared instanceof NextResponse) return prepared;

    const created = await adminBackendFetch<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(prepared.payload),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đã tạo sản phẩm",
        product: created,
        taxonomy: { added: prepared.added },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return adminErrorResponse(error, "Không tạo được sản phẩm do lỗi hệ thống");
  } finally {
    // Also after failures: a timed-out write may still have been applied
    invalidateRemoteProductsCache();
  }
}
