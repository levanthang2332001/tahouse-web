import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "tahouse_admin_session";
export const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "tahouse-super-secret-admin-token-2026";

export const DEFAULT_ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || "admin@tahouse.vn";
export const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "admin123";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: "superadmin" | "admin" | "editor";
}

export function createAdminToken(user: AdminUser): string {
  const payload = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString("base64url");
  return `${base64}.${Buffer.from(ADMIN_SESSION_SECRET).toString("base64url").slice(0, 16)}`;
}

export function verifyAdminToken(token?: string | null): AdminUser | null {
  if (!token) return null;
  try {
    const [base64] = token.split(".");
    if (!base64) return null;
    const jsonStr = Buffer.from(base64, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return {
      id: payload.id || "admin-1",
      username: payload.username || "admin",
      name: payload.name || "Quản trị viên",
      role: payload.role || "superadmin",
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export function checkAdminRequestAuth(request: NextRequest): AdminUser | null {
  const tokenFromCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (tokenFromCookie) {
    const user = verifyAdminToken(tokenFromCookie);
    if (user) return user;
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token);
  }

  return null;
}
