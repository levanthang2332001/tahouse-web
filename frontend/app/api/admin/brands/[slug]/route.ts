import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, adminErrorResponse } from "@/lib/admin/api-client";
import {
  adminBrandPath,
  badRequest,
  readJsonObject,
  requireAdmin,
  runBrandWrite,
} from "../_lib/route-helpers";

type SlugContext = { params: Promise<{ slug: string }> };

const INVALID_SLUG = "Mã định danh thương hiệu không hợp lệ";

export async function GET(request: NextRequest, context: SlugContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await context.params;
  if (!slug?.trim()) return badRequest(INVALID_SLUG);

  try {
    const brand = await adminBackendFetch(adminBrandPath(slug));
    return NextResponse.json(brand);
  } catch (error) {
    console.error("[GET /api/admin/brands/[slug]]", error);
    return adminErrorResponse(error, "Lỗi khi lấy thông tin thương hiệu");
  }
}

export async function PUT(request: NextRequest, context: SlugContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await context.params;
  if (!slug?.trim()) return badRequest(INVALID_SLUG);

  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu cập nhật không đúng định dạng JSON");
  if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
    return badRequest("Tên thương hiệu không được để trống");
  }

  return runBrandWrite(
    "[PUT /api/admin/brands/[slug]]",
    () =>
      adminBackendFetch(adminBrandPath(slug), {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    (saved) =>
      NextResponse.json({
        success: true,
        message: "Cập nhật thương hiệu thành công",
        brand: saved,
      }),
    "Lỗi khi cập nhật thương hiệu",
  );
}

export const PATCH = PUT;

export async function DELETE(request: NextRequest, context: SlugContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await context.params;
  if (!slug?.trim()) return badRequest(INVALID_SLUG);

  return runBrandWrite(
    "[DELETE /api/admin/brands/[slug]]",
    () =>
      adminBackendFetch<{ message?: string }>(adminBrandPath(slug), {
        method: "DELETE",
      }),
    (result) =>
      NextResponse.json({
        success: true,
        message: result?.message || "Đã xóa thương hiệu",
      }),
    "Lỗi khi xóa thương hiệu",
  );
}
