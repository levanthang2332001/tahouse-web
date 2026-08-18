import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/admin/product-store";
import type { Product } from "@/lib/types/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const product = await getProductById(cleanId);

    if (!product) {
      return NextResponse.json(
        { message: `Không tìm thấy sản phẩm với mã: ${cleanId}` },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy thông tin sản phẩm" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Partial<Product>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu cập nhật không hợp lệ" },
        { status: 400 },
      );
    }

    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
      return NextResponse.json(
        { message: "Tên sản phẩm không được để trống" },
        { status: 400 },
      );
    }

    const updated = await updateProduct(cleanId, body);
    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi cập nhật sản phẩm",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    await deleteProduct(cleanId);

    return NextResponse.json({
      success: true,
      message: "Đã xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống khi xóa sản phẩm" },
      { status: 500 },
    );
  }
}
