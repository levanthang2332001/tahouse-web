import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/api-client";
import { adminBrandPath, requireAdmin, runBrandWrite } from "../../../../../_lib/route-helpers";

type SubcategoryContext = {
  params: Promise<{
    slug: string;
    catSlug: string;
    subSlug: string;
  }>;
};

export async function DELETE(request: NextRequest, context: SubcategoryContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug, catSlug, subSlug } = await context.params;

  return runBrandWrite(
    "[DELETE /api/admin/brands/[slug]/categories/[catSlug]/subcategories/[subSlug]]",
    () =>
      adminBackendFetch<{ message?: string }>(
        adminBrandPath(slug, "categories", catSlug, "subcategories", subSlug),
        { method: "DELETE" },
      ),
    (result) =>
      NextResponse.json({
        success: true,
        message: result?.message || "Đã xóa danh mục con thành công",
        data: result,
      }),
    "Lỗi khi xóa danh mục con",
  );
}
