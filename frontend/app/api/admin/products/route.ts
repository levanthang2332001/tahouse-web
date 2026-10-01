import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";
import { getAdminStats, invalidateRemoteProductsCache, PRODUCT_SECTORS } from "@/lib/admin/product-store";
import type { Product } from "@/lib/types/product";

interface BackendProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

interface BackendBrandItem {
  id: number;
  name: string;
  slug: string;
}

let cachedBrandMap: Map<string, number> | null = null;
let lastBrandMapTime = 0;

async function getBrandIdByNameOrSlug(brandStr?: string): Promise<number | undefined> {
  if (!brandStr) return undefined;
  const now = Date.now();
  if (!cachedBrandMap || now - lastBrandMapTime > 5 * 60 * 1000) {
    try {
      const brands = await adminBackendFetch<BackendBrandItem[]>("/admin/brands");
      const map = new Map<string, number>();
      for (const b of brands) {
        if (b.id) {
          map.set(b.name.toLowerCase(), b.id);
          map.set(b.slug.toLowerCase(), b.id);
        }
      }
      cachedBrandMap = map;
      lastBrandMapTime = now;
    } catch {
      // ignore
    }
  }
  return cachedBrandMap?.get(brandStr.toLowerCase());
}

export async function GET(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

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
    const stats = await getAdminStats(forceRefresh);

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
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy danh sách sản phẩm từ backend",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as Partial<Product>;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu gửi lên không đúng định dạng JSON" },
        { status: 400 },
      );
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { message: "Tên sản phẩm không được để trống" },
        { status: 400 },
      );
    }

    if (!body.code || typeof body.code !== "string" || !body.code.trim()) {
      return NextResponse.json(
        { message: "Mã sản phẩm không được để trống" },
        { status: 400 },
      );
    }

    // Resolve brandId if missing
    let brandId = body.brandId;
    if (!brandId && body.brand) {
      brandId = await getBrandIdByNameOrSlug(body.brand);
    }

    const payload = {
      ...body,
      brandId,
      code: body.code.trim(),
      name: body.name.trim(),
    };

    const created = await adminBackendFetch<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    invalidateRemoteProductsCache();

    return NextResponse.json(
      {
        success: true,
        message: "Tạo sản phẩm thành công trên hệ thống",
        product: created,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi tạo sản phẩm",
      },
      { status: 400 },
    );
  }
}
