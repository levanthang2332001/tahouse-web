import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

type RouteContext = {
  params: Promise<{
    slug: string;
    catSlug: string;
    subSlug: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { slug, catSlug, subSlug } = await context.params;

    const result = await adminBackendFetch(
      `/admin/brands/${encodeURIComponent(slug)}/categories/${encodeURIComponent(catSlug)}/subcategories/${encodeURIComponent(subSlug)}`,
      {
        method: "DELETE",
      },
    );

    return NextResponse.json({
      success: true,
      message: "Đã xóa danh mục con thành công",
      data: result,
    });
  } catch (error) {
    console.error(
      "[DELETE /api/admin/brands/[slug]/categories/[catSlug]/subcategories/[subSlug]]",
      error,
    );
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi xóa danh mục con",
      },
      { status: 500 },
    );
  }
}
