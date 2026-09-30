import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

export async function GET(
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
    const cleanSlug = slug?.trim();

    if (!cleanSlug) {
      return NextResponse.json(
        { message: "Mã định danh thương hiệu không hợp lệ" },
        { status: 400 },
      );
    }

    const brand = await adminBackendFetch(
      `/admin/brands/${encodeURIComponent(cleanSlug)}`,
    );

    return NextResponse.json(brand);
  } catch (error) {
    console.error("[GET /api/admin/brands/[slug]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi lấy thông tin thương hiệu",
      },
      { status: 404 },
    );
  }
}

export async function PUT(
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
    const cleanSlug = slug?.trim();

    if (!cleanSlug) {
      return NextResponse.json(
        { message: "Mã định danh thương hiệu không hợp lệ" },
        { status: 400 },
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu cập nhật không đúng định dạng" },
        { status: 400 },
      );
    }

    const saved = await adminBackendFetch(
      `/admin/brands/${encodeURIComponent(cleanSlug)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật thương hiệu thành công",
      brand: saved,
    });
  } catch (error) {
    console.error("[PUT /api/admin/brands/[slug]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi cập nhật thương hiệu",
      },
      { status: 500 },
    );
  }
}

export const PATCH = PUT;

export async function DELETE(
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
    const cleanSlug = slug?.trim();

    if (!cleanSlug) {
      return NextResponse.json(
        { message: "Mã định danh thương hiệu không hợp lệ" },
        { status: 400 },
      );
    }

    await adminBackendFetch(`/admin/brands/${encodeURIComponent(cleanSlug)}`, {
      method: "DELETE",
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa thương hiệu thành công",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/brands/[slug]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Lỗi khi xóa thương hiệu",
      },
      { status: 500 },
    );
  }
}
