import { NextRequest, NextResponse } from "next/server";
import { fetch as undiciFetch } from "undici";
import { getBackendUrl } from "@/lib/backend/config";
import { backendAgent } from "@/lib/backend/client";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_COOKIE_NAME,
  ADMIN_REFRESH_TOKEN_COOKIE,
  createAdminToken,
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

    // Call Backend API /auth/login
    const backendUrl = getBackendUrl();
    const userAgent = request.headers.get("user-agent") || "TA House Admin FE/1.0";

    const beRes = await undiciFetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": userAgent,
      },
      body: JSON.stringify({
        username: trimmedUser,
        password: trimmedPass,
      }),
      dispatcher: backendAgent,
    });

    interface BackendLoginResponse {
      success?: boolean;
      message?: string;
      data?: {
        accessToken?: string;
        refreshToken?: string;
      };
    }

    const beData = (await beRes.json()) as BackendLoginResponse;

    if (!beRes.ok || !beData.success || !beData.data?.accessToken) {
      return NextResponse.json(
        {
          message:
            beData.message ||
            "Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.",
        },
        { status: 401 },
      );
    }

    const accessToken = beData.data.accessToken;
    const refreshToken = beData.data.refreshToken || accessToken;

    // Fetch user profile from /auth/me
    let userProfile = {
      username: trimmedUser,
      fullName: "Quản Trị Viên TA HOUSE",
      email: trimmedUser.includes("@") ? trimmedUser : undefined,
      role: "superadmin",
      avatarUrl: "",
    };

    try {
      const meRes = await undiciFetch(`${backendUrl}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": userAgent,
        },
        dispatcher: backendAgent,
      });
      if (meRes.ok) {
        interface BackendMeResponse {
          success?: boolean;
          data?: {
            username?: string;
            fullName?: string;
            email?: string;
            role?: string;
            avatarUrl?: string;
          };
        }
        const meData = (await meRes.json()) as BackendMeResponse;
        if (meData.success && meData.data) {
          userProfile = {
            ...userProfile,
            ...meData.data,
            fullName: meData.data.fullName || userProfile.fullName,
          };
        }
      }
    } catch (profileErr) {
      console.warn("[POST /api/auth/login] Could not fetch me profile:", profileErr);
    }

    const adminUser: AdminUser = {
      id: userProfile.username,
      username: userProfile.username,
      name: userProfile.fullName || "Quản Trị Viên TA HOUSE",
      email: userProfile.email,
      avatarUrl: userProfile.avatarUrl,
      role: "superadmin",
    };

    const sessionToken = createAdminToken(adminUser);

    const response = NextResponse.json({
      success: true,
      user: adminUser,
      message: "Đăng nhập thành công",
    });

    const isProd = process.env.NODE_ENV === "production";

    // Set access token cookie (7 days max age, refreshed as needed)
    response.cookies.set({
      name: ADMIN_ACCESS_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Set refresh token cookie (7 days)
    response.cookies.set({
      name: ADMIN_REFRESH_TOKEN_COOKIE,
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Set signed session cookie for FE compatibility (HttpOnly for security)
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng kiểm tra kết nối." },
      { status: 500 },
    );
  }
}
