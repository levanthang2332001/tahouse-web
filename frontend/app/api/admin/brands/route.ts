import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";
import { getAdminStats } from "@/lib/admin/product-store";

interface BackendBrandItem {
  id?: number;
  name: string;
  slug: string;
  logo?: string;
  logoHtml?: string;
  country?: string;
  description?: string;
  website?: string;
  categories?: Array<{
    name: string;
    slug: string;
    subcategories?: Array<{ name: string; slug: string }>;
  }>;
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
    const brands = await adminBackendFetch<BackendBrandItem[]>("/admin/brands");

    // Fetch product counts from stats
    let brandCountMap: Record<string, number> = {};
    try {
      const stats = await getAdminStats();
      if (stats.brandBreakdown) {
        brandCountMap = stats.brandBreakdown;
      }
    } catch {
      // ignore
    }

    const items = brands.map((b) => ({
      ...b,
      productCount:
        brandCountMap[b.name] ??
        brandCountMap[b.slug] ??
        0,
    }));

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/brands]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi lấy danh sách thương hiệu",
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
    const body = (await request.json()) as Partial<BackendBrandItem>;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu thương hiệu không đúng định dạng" },
        { status: 400 },
      );
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { message: "Tên thương hiệu không được để trống" },
        { status: 400 },
      );
    }

    const saved = await adminBackendFetch<BackendBrandItem>("/admin/brands", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lưu thương hiệu thành công",
        brand: saved,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/admin/brands]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi lưu thương hiệu",
      },
      { status: 500 },
    );
  }
}
