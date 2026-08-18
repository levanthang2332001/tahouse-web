import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
