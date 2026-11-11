import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/api-client";
import {
  adminBrandPath,
  badRequest,
  readJsonObject,
  requireAdmin,
  runBrandWrite,
} from "../../_lib/route-helpers";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { slug } = await context.params;
  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu danh mục không đúng định dạng JSON");

  if (typeof body.name !== "string" || !body.name.trim()) {
    return badRequest("Tên danh mục không được để trống");
  }

  return runBrandWrite(
    "[POST /api/admin/brands/[slug]/categories]",
    () =>
      adminBackendFetch(adminBrandPath(slug, "categories"), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    (result) =>
      NextResponse.json(
        { success: true, message: "Đã thêm danh mục vào thương hiệu", data: result },
        { status: 201 },
      ),
    "Lỗi khi thêm danh mục",
  );
}
