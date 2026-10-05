import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

export async function POST(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    if (!oldPassword || typeof oldPassword !== "string") {
      return NextResponse.json(
        { message: "Vui lòng nhập mật khẩu hiện tại" },
        { status: 400 },
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu mới phải có tối thiểu 6 ký tự" },
        { status: 400 },
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Xác nhận mật khẩu mới không khớp" },
        { status: 400 },
      );
    }

    const res = await adminBackendFetch<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      }),
    });

    return NextResponse.json({
      success: true,
      message: res?.message || "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("[POST /api/auth/change-password]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Lỗi khi đổi mật khẩu",
      },
      { status: 400 },
    );
  }
}
