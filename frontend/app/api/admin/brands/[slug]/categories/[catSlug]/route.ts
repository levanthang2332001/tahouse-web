import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/api-client";
import {
  adminBrandPath,
  badRequest,
  readJsonObject,
  requireAdmin,
  runBrandWrite,
} from "../../../_lib/route-helpers";

type CategoryContext = {
  params: Promise<{
    slug: string;
    catSlug: string;
  }>;
};

export async function PATCH(request: NextRequest, context: CategoryContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug, catSlug } = await context.params;
  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu cập nhật danh mục không đúng định dạng JSON");
  if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
    return badRequest("Tên danh mục không được để trống");
  }

  return runBrandWrite(
    "[PATCH /api/admin/brands/[slug]/categories/[catSlug]]",
    () =>
      adminBackendFetch(adminBrandPath(slug, "categories", catSlug), {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    (result) =>
      NextResponse.json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: result,
      }),
    "Lỗi khi cập nhật danh mục",
  );
}

export async function DELETE(request: NextRequest, context: CategoryContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug, catSlug } = await context.params;

  return runBrandWrite(
    "[DELETE /api/admin/brands/[slug]/categories/[catSlug]]",
    () =>
      adminBackendFetch<{ message?: string }>(adminBrandPath(slug, "categories", catSlug), {
        method: "DELETE",
      }),
    (result) =>
      NextResponse.json({
        success: true,
        message: result?.message || "Xóa danh mục thành công",
        data: result,
      }),
    "Lỗi khi xóa danh mục",
  );
}
