import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_COOKIE_NAME,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

export async function POST() {
  try {
    // Attempt backend logout to invalidate refresh token
    await adminBackendFetch("/auth/logout", {
      method: "POST",
    }).catch(() => {
      // Ignore errors on backend logout if token already expired
    });
  } catch {
    // Ignore errors
  }

  const response = NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
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
