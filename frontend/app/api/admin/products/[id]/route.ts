import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, adminErrorResponse } from "@/lib/admin/api-client";
import { invalidateRemoteProductsCache } from "@/lib/admin/product-store";
import type { Product } from "@/lib/types/product";
import {
  badRequest,
  prepareProductPayload,
  readJsonObject,
  requireAdmin,
  validateProductBody,
} from "../_lib/product-payload";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function readProductId(context: RouteContext): Promise<string | null> {
  const { id } = await context.params;
  return id?.trim() || null;
}

const productPath = (id: string) => `/admin/products/${encodeURIComponent(id)}`;

export async function GET(request: NextRequest, context: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const id = await readProductId(context);
  if (!id) return badRequest("Mã sản phẩm không hợp lệ");

  try {
    const product = await adminBackendFetch<Product>(productPath(id));
    return NextResponse.json(product, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return adminErrorResponse(error, "Không tải được thông tin sản phẩm");
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const id = await readProductId(context);
  if (!id) return badRequest("Mã sản phẩm không hợp lệ");

  const body = await readJsonObject(request);
  if (!body) return badRequest("Dữ liệu cập nhật không đúng định dạng JSON");

  const invalid = validateProductBody(body, "update");
  if (invalid) return badRequest(invalid);

  try {
    // A new category/subcategory is added to the brand tree first; if that fails the product is not touched
    const prepared = await prepareProductPayload(body, "update");
    if (prepared instanceof NextResponse) return prepared;

    const updated = await adminBackendFetch<Product>(productPath(id), {
      method: "PATCH",
      body: JSON.stringify(prepared.payload),
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật sản phẩm",
      product: updated,
      taxonomy: { added: prepared.added },
    });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return adminErrorResponse(error, "Không cập nhật được sản phẩm do lỗi hệ thống");
  } finally {
    // Also after failures: a timed-out write may still have been applied
    invalidateRemoteProductsCache();
  }
}

export const PATCH = PUT;

export async function DELETE(request: NextRequest, context: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const id = await readProductId(context);
  if (!id) return badRequest("Mã sản phẩm không hợp lệ");

  try {
    const result = await adminBackendFetch<{ message?: string }>(productPath(id), {
      method: "DELETE",
    });

    return NextResponse.json({
      success: true,
      message: result?.message || "Đã xóa sản phẩm",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return adminErrorResponse(error, "Không xóa được sản phẩm do lỗi hệ thống");
  } finally {
    // Also after failures: a timed-out write may still have been applied
    invalidateRemoteProductsCache();
  }
}
