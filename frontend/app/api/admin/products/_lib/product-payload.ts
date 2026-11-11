import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import {
  ensureBrandTaxonomy,
  getAdminBrands,
  resolveAdminBrand,
  validateTaxonomyFields,
} from "@/lib/admin/brand-taxonomy";

/** 401 response when the admin session is missing; null when the request is authorised. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (checkAdminRequestAuth(request)) return null;
  return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

/** Parses the JSON body; null for invalid JSON or a non-object body (arrays, strings…). */
export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const isBlank = (value: unknown) => typeof value !== "string" || !value.trim();

/** Field checks the BFF can answer without the backend (the backend validates everything again). */
export function validateProductBody(body: Record<string, unknown>, mode: "create" | "update"): string | null {
  const taxonomyError = validateTaxonomyFields(body);
  if (taxonomyError) return taxonomyError;

  const isCreate = mode === "create";
  if ((isCreate || body.name !== undefined) && isBlank(body.name)) return "Tên sản phẩm không được để trống";
  if ((isCreate || body.code !== undefined) && isBlank(body.code)) return "Mã sản phẩm không được để trống";
  if (isCreate && isBlank(body.brand) && isBlank(body.brandId)) return "Vui lòng chọn thương hiệu cho sản phẩm";
  if ((isCreate || body.category !== undefined) && isBlank(body.category)) {
    return "Vui lòng chọn danh mục chính cho sản phẩm";
  }
  if (body.brandId !== undefined && body.brandId !== null && typeof body.brandId !== "string") {
    return "Mã thương hiệu (brandId) không hợp lệ";
  }
  return null;
}

/**
 * Resolves the brand to its UUID and makes sure the category/subcategory exist in the brand tree
 * *before* the product is written. Returns an error response (backend status kept) when that fails,
 * so a product is never created against a category the backend would reject.
 * Throws for backend/network failures; callers wrap it with `adminErrorResponse`.
 */
export async function prepareProductPayload(
  body: Record<string, unknown>,
  mode: "create" | "update",
): Promise<{ payload: Record<string, unknown>; added: string[] } | NextResponse> {
  const payload: Record<string, unknown> = { ...body };
  if (typeof payload.code === "string") payload.code = payload.code.trim();
  if (typeof payload.name === "string") payload.name = payload.name.trim();

  const mentionsBrand = !isBlank(body.brand) || !isBlank(body.brandId);
  if (!mentionsBrand) {
    // Update without a brand change: the backend validates the category against the current brand
    return { payload, added: [] };
  }

  const brand = resolveAdminBrand(await getAdminBrands(true), body);
  if (!brand) {
    const label = typeof body.brand === "string" && body.brand.trim() ? body.brand.trim() : String(body.brandId);
    return badRequest(
      `Không tìm thấy thương hiệu "${label}" trên hệ thống. Hãy chọn thương hiệu có sẵn hoặc tạo thương hiệu này trong mục Thương hiệu trước.`,
    );
  }
  payload.brandId = brand.id;

  if (mode === "update" && isBlank(body.category)) return { payload, added: [] };
  const { payload: withTaxonomy, added } = await ensureBrandTaxonomy(payload, brand);
  return { payload: withTaxonomy, added };
}
