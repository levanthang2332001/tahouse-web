import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  checkAdminRequestAuth,
  createAdminToken,
  type AdminUser,
} from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";

interface BackendMeResponse {
  username: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
}

export async function GET(request: NextRequest) {
  const localUser = checkAdminRequestAuth(request);
  if (!localUser) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // Fetch live profile from backend
    const meData = await adminBackendFetch<BackendMeResponse>("/auth/me");

    const user: AdminUser = {
      id: meData.username || localUser.id,
      username: meData.username || localUser.username,
      name: meData.fullName || localUser.name,
      email: meData.email || localUser.email,
      avatarUrl: meData.avatarUrl || localUser.avatarUrl,
      role: (meData.role?.toLowerCase() as AdminUser["role"]) || localUser.role || "superadmin",
    };

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch {
    // Fallback to local user if backend call fails but token was valid
    return NextResponse.json({
      authenticated: true,
      user: localUser,
    });
  }
}

export async function PATCH(request: NextRequest) {
  const localUser = checkAdminRequestAuth(request);
  if (!localUser) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const updated = await adminBackendFetch<BackendMeResponse>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    const user: AdminUser = {
      id: updated.username || localUser.id,
      username: updated.username || localUser.username,
      name: updated.fullName || localUser.name,
      email: updated.email || localUser.email,
      avatarUrl: updated.avatarUrl || localUser.avatarUrl,
      role: (updated.role?.toLowerCase() as AdminUser["role"]) || localUser.role || "superadmin",
    };

    const sessionToken = createAdminToken(user);
    const response = NextResponse.json({
      success: true,
      message: "Cập nhật thông tin tài khoản thành công",
      user,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[PATCH /api/auth/me]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi cập nhật thông tin tài khoản",
      },
      { status: 500 },
    );
  }
}
