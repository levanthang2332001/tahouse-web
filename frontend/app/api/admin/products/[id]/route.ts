import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch, adminErrorResponse } from "@/lib/admin/api-client";
import { prepareBrandTaxonomy, resolveBrandId, validateTaxonomyFields } from "@/lib/admin/brand-taxonomy";
import { invalidateRemoteProductsCache } from "@/lib/admin/product-store";
import type { Product } from "@/lib/types/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const product = await adminBackendFetch<Product>(
      `/admin/products/${encodeURIComponent(cleanId)}`,
    );

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi lấy thông tin sản phẩm",
      },
      { status: 404 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as Partial<Product> | null;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Dữ liệu cập nhật không hợp lệ" },
        { status: 400 },
      );
    }

    const taxonomyError = validateTaxonomyFields(body as Record<string, unknown>);
    if (taxonomyError) {
      return NextResponse.json({ message: taxonomyError }, { status: 400 });
    }

    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
      return NextResponse.json(
        { message: "Tên sản phẩm không được để trống" },
        { status: 400 },
      );
    }

    // Resolve brandId if missing
    let brandId = body.brandId;
    if (!brandId && body.brand) {
      brandId = await resolveBrandId(body.brand);
    }

    const payload = {
      ...body,
      ...(brandId ? { brandId } : {}),
    };

    // Keep the brand's category tree in step with its products, only once the save has succeeded
    const taxonomy = await prepareBrandTaxonomy(payload);
    const updated = await adminBackendFetch<Product>(`/admin/products/${encodeURIComponent(cleanId)}`, {
      method: "PATCH",
      body: JSON.stringify(taxonomy.payload),
    });
    const taxonomySync = await taxonomy.sync();

    invalidateRemoteProductsCache();

    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: updated,
      taxonomy: taxonomySync,
    });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return adminErrorResponse(error, "Lỗi hệ thống khi cập nhật sản phẩm");
  }
}

export const PATCH = PUT;

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    await adminBackendFetch(
      `/admin/products/${encodeURIComponent(cleanId)}`,
      {
        method: "DELETE",
      },
    );

    invalidateRemoteProductsCache();

    return NextResponse.json({
      success: true,
      message: "Đã xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi xóa sản phẩm",
      },
      { status: 500 },
    );
  }
}
