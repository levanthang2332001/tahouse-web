import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import {
  deleteBrand,
  saveBrand,
  type CustomBrand,
} from "@/lib/admin/brand-store";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
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

    const body = (await request.json()) as Partial<CustomBrand>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu cập nhật không đúng định dạng" },
        { status: 400 },
      );
    }

    const saved = await saveBrand({
      ...body,
      slug: cleanSlug,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật thương hiệu thành công",
      brand: saved,
    });
  } catch (error) {
    console.error("[PUT /api/admin/brands/[slug]]", error);
    return NextResponse.json(
      { message: "Lỗi khi cập nhật thương hiệu" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
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

    await deleteBrand(cleanSlug);

    return NextResponse.json({
      success: true,
      message: "Đã xóa thương hiệu",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/brands/[slug]]", error);
    return NextResponse.json(
      { message: "Lỗi khi xóa thương hiệu" },
      { status: 500 },
    );
  }
}
