import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/api-client";
import { invalidateAdminBrands } from "@/lib/admin/brand-taxonomy";

/** 401 response when the admin session is missing; null when the request is authorised. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (checkAdminRequestAuth(request)) return null;
  return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

/** Parses the JSON body; returns null for invalid JSON or a non-object body (arrays, strings…). */
export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Backend path under /admin/brands with every segment URL-encoded. */
export function adminBrandPath(...segments: string[]): string {
  return ["/admin/brands", ...segments.map((s) => encodeURIComponent(s.trim()))].join("/");
}

/**
 * Runs a brand/category/subcategory write against the backend and clears the cached brand tree.
 * The cache is cleared after failures too: a timed-out write may still have been applied.
 * Failures keep the backend status (400/401/404/409) and its Vietnamese message; 5xx/network → 502.
 */
export async function runBrandWrite<T>(
  label: string,
  write: () => Promise<T>,
  onSuccess: (result: T) => NextResponse,
  fallbackMessage: string,
): Promise<NextResponse> {
  let result: T;
  try {
    result = await write();
  } catch (error) {
    console.error(label, error);
    return adminErrorResponse(error, fallbackMessage);
  } finally {
    invalidateAdminBrands();
  }
  return onSuccess(result);
}
