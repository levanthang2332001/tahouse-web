import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, adminErrorResponse } from "@/lib/admin/api-client";
import { getDashboardStats } from "@/lib/admin/dashboard-stats";
import { badRequest, readJsonObject, requireAdmin, runBrandWrite } from "./_lib/route-helpers";

interface BackendBrandItem {
  id?: string;
  name: string;
  slug: string;
  logo?: string;
  logoHtml?: string;
  categories?: Array<{
    name: string;
    slug: string;
    subcategories?: Array<{ name: string; slug: string }>;
  }>;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const brands = await adminBackendFetch<BackendBrandItem[]>("/admin/brands");

    // Fetch product counts from stats
    let brandCountMap: Record<string, number> = {};
    try {
      const stats = await getDashboardStats();
      if (stats.brandBreakdown) {
        brandCountMap = stats.brandBreakdown;
      }
    } catch {
      // ignore: counts are informational, the backend still blocks deleting brands with products
    }

    const items = (Array.isArray(brands) ? brands : []).map((b) => ({
      ...b,
      productCount: brandCountMap[b.name] ?? brandCountMap[b.slug] ?? 0,
    }));

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/brands]", error);
    return adminErrorResponse(error, "Lỗi khi lấy danh sách thương hiệu");
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu thương hiệu không đúng định dạng JSON");

  if (typeof body.name !== "string" || !body.name.trim()) {
    return badRequest("Tên thương hiệu không được để trống");
  }

  return runBrandWrite(
    "[POST /api/admin/brands]",
    () =>
      adminBackendFetch<BackendBrandItem>("/admin/brands", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    (saved) =>
      NextResponse.json(
        { success: true, message: "Lưu thương hiệu thành công", brand: saved },
        { status: 201 },
      ),
    "Lỗi hệ thống khi lưu thương hiệu",
  );
}
