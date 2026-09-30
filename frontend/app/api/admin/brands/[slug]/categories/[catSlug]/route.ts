import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

type RouteContext = {
  params: Promise<{
    slug: string;
    catSlug: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { slug, catSlug } = await context.params;
    const body = await request.json();

    const result = await adminBackendFetch(
      `/admin/brands/${encodeURIComponent(slug)}/categories/${encodeURIComponent(catSlug)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: result,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/brands/[slug]/categories/[catSlug]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi cập nhật danh mục",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { slug, catSlug } = await context.params;

    const result = await adminBackendFetch(
      `/admin/brands/${encodeURIComponent(slug)}/categories/${encodeURIComponent(catSlug)}`,
      {
        method: "DELETE",
      },
    );

    return NextResponse.json({
      success: true,
      message: "Xóa danh mục thành công",
      data: result,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/brands/[slug]/categories/[catSlug]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Lỗi khi xóa danh mục",
      },
      { status: 500 },
    );
  }
}
