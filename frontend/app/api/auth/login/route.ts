import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  type AdminUser,
} from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu đăng nhập không hợp lệ" },
        { status: 400 },
      );
    }

    const { username, password } = body;
    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "Tài khoản và mật khẩu phải là chuỗi ký tự" },
        { status: 400 },
      );
    }

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu" },
        { status: 400 },
      );
    }

    // Accept default admin credentials
    const isValidUser =
      trimmedUser === DEFAULT_ADMIN_USERNAME ||
      trimmedUser === "admin" ||
      trimmedUser === "admin@tahouse.vn";
    const isValidPass =
      trimmedPass === DEFAULT_ADMIN_PASSWORD ||
      trimmedPass === "admin123" ||
      trimmedPass === "tahouse2026";

    if (!isValidUser || !isValidPass) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác" },
        { status: 401 },
      );
    }

    const adminUser: AdminUser = {
      id: "admin-master",
      username: trimmedUser,
      name: "Quản Trị Viên TA HOUSE",
      role: "superadmin",
    };

    const token = createAdminToken(adminUser);

    const response = NextResponse.json({
      success: true,
      user: adminUser,
      message: "Đăng nhập thành công",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra trong quá trình đăng nhập" },
      { status: 500 },
    );
  }
}
