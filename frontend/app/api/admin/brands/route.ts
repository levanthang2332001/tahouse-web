import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import {
  getAllBrandsWithStats,
  saveBrand,
  type CustomBrand,
} from "@/lib/admin/brand-store";

export async function GET(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
  }

  try {
    const brands = await getAllBrandsWithStats();
    return NextResponse.json({
      success: true,
      items: brands,
      total: brands.length,
    });
  } catch (error) {
    console.error("[GET /api/admin/brands]", error);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách thương hiệu" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<CustomBrand>;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu thương hiệu không đúng định dạng" },
        { status: 400 },
      );
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { message: "Tên thương hiệu không được để trống" },
        { status: 400 },
      );
    }

    if (body.name.trim().length < 2) {
      return NextResponse.json(
        { message: "Tên thương hiệu phải có ít nhất 2 ký tự" },
        { status: 400 },
      );
    }

    const saved = await saveBrand(body);

    return NextResponse.json(
      {
        success: true,
        message: "Lưu thương hiệu thành công",
        brand: saved,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/admin/brands]", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống khi lưu thương hiệu" },
      { status: 500 },
    );
  }
}
