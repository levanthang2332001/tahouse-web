import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";
import { invalidateRemoteProductsCache } from "@/lib/admin/product-store";
import type { Product } from "@/lib/types/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface BackendBrandItem {
  id: number;
  name: string;
  slug: string;
}

let cachedBrandMap: Map<string, number> | null = null;
let lastBrandMapTime = 0;

async function getBrandIdByNameOrSlug(brandStr?: string): Promise<number | undefined> {
  if (!brandStr) return undefined;
  const now = Date.now();
  if (!cachedBrandMap || now - lastBrandMapTime > 5 * 60 * 1000) {
    try {
      const brands = await adminBackendFetch<BackendBrandItem[]>("/admin/brands");
      const map = new Map<string, number>();
      for (const b of brands) {
        if (b.id) {
          map.set(b.name.toLowerCase(), b.id);
          map.set(b.slug.toLowerCase(), b.id);
        }
      }
      cachedBrandMap = map;
      lastBrandMapTime = now;
    } catch {
      // ignore
    }
  }
  return cachedBrandMap?.get(brandStr.toLowerCase());
}

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

    const body = (await request.json()) as Partial<Product>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Dữ liệu cập nhật không hợp lệ" },
        { status: 400 },
      );
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
      brandId = await getBrandIdByNameOrSlug(body.brand);
    }

    const payload = {
      ...body,
      ...(brandId ? { brandId } : {}),
    };

    const updated = await adminBackendFetch<Product>(
      `/admin/products/${encodeURIComponent(cleanId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    invalidateRemoteProductsCache();

    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi cập nhật sản phẩm",
      },
      { status: 400 },
    );
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
