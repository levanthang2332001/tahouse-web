import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/api-client";
import {
  adminBrandPath,
  badRequest,
  readJsonObject,
  requireAdmin,
  runBrandWrite,
} from "../../../../_lib/route-helpers";

type CategoryContext = {
  params: Promise<{
    slug: string;
    catSlug: string;
  }>;
};

export async function POST(request: NextRequest, context: CategoryContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug, catSlug } = await context.params;
  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu danh mục con không đúng định dạng JSON");

  if (typeof body.name !== "string" || !body.name.trim()) {
    return badRequest("Tên danh mục con không được để trống");
  }

  return runBrandWrite(
    "[POST /api/admin/brands/[slug]/categories/[catSlug]/subcategories]",
    () =>
      adminBackendFetch(adminBrandPath(slug, "categories", catSlug, "subcategories"), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    (result) =>
      NextResponse.json(
        { success: true, message: "Đã thêm danh mục con vào danh mục cha", data: result },
        { status: 201 },
      ),
    "Lỗi khi thêm danh mục con",
  );
}
