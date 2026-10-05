import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_COOKIE_NAME,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

export async function POST() {
  try {
    await adminBackendFetch("/auth/logout-all", {
      method: "POST",
    }).catch(() => {
      // Ignore if already logged out
    });
  } catch {
    // Ignore
  }

  const response = NextResponse.json({
    success: true,
    message: "Đã đăng xuất khỏi tất cả thiết bị",
  });

  const clearOptions = {
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  };

  response.cookies.set({
    ...clearOptions,
    name: ADMIN_ACCESS_TOKEN_COOKIE,
  });

  response.cookies.set({
    ...clearOptions,
    name: ADMIN_REFRESH_TOKEN_COOKIE,
  });

  response.cookies.set({
    ...clearOptions,
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
  });

  return response;
}
