// Admin products API handler
import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import {
  createProduct,
  getAdminStats,
  getMergedProducts,
  PRODUCT_SECTORS,
} from "@/lib/admin/product-store";
import type { Product } from "@/lib/types/product";

export async function GET(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const category = searchParams.get("category")?.trim();
    const brand = searchParams.get("brand")?.trim();
    const forceRefresh = searchParams.get("refresh") === "true";
    const sortBy = searchParams.get("sortBy")?.trim() || "newest";

    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const parsedLimit = parseInt(searchParams.get("limit") || "16", 10);
    const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 16 : Math.min(parsedLimit, 100);

    let items = await getMergedProducts(forceRefresh);

    // Filtering
    if (search) {
      items = items.filter((p) => {
        const haystack = `${p.name} ${p.code} ${p.brand} ${p.categoryName || ""}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    if (category && category !== "all") {
      const sector = PRODUCT_SECTORS.find((s) => s.id === category);
      if (sector) {
        items = items.filter((p) => sector.slugs.includes(p.category || ""));
      } else {
        items = items.filter(
          (p) => p.category === category || p.subcategory === category,
        );
      }
    }

    if (brand && brand !== "all") {
      items = items.filter(
        (p) =>
          p.brand?.toLowerCase() === brand.toLowerCase() ||
          p.brandSlug?.toLowerCase() === brand.toLowerCase(),
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      items.sort((a, b) => (a.price ?? 999999999) - (b.price ?? 999999999));
    } else if (sortBy === "price-desc") {
      items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "name-asc") {
      items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const validPage = Math.min(page, totalPages);
    const start = (validPage - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    const stats = await getAdminStats();

    return NextResponse.json({
      items: paginatedItems,
      total,
      page: validPage,
      limit,
      totalPages,
      stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json(
      { message: "Không thể lấy danh sách sản phẩm" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
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

    const created = await createProduct(body);
    return NextResponse.json(
      {
        success: true,
        message: "Tạo sản phẩm thành công",
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
