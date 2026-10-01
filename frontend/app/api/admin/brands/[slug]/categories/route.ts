import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { slug } = await context.params;
    const body = await request.json();

    if (!body?.name?.trim()) {
      return NextResponse.json(
        { message: "Tên danh mục không được để trống" },
        { status: 400 },
      );
    }

    const result = await adminBackendFetch(
      `/admin/brands/${encodeURIComponent(slug)}/categories`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Đã thêm danh mục vào thương hiệu",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/admin/brands/[slug]/categories]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Lỗi khi thêm danh mục",
      },
      { status: 500 },
    );
  }
}
