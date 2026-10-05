import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/admin/product-store";
import { backendFetch } from "@/lib/backend/client";
import { mapProductDetail } from "@/lib/backend/map-product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { message: "Mã sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const data = await getProductById(cleanId);
    if (!data) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }

    // If installation_preview is empty, check /installation sub-endpoint for real jobsite photos
    if (data.id && (!data.installation_preview || data.installation_preview.length === 0)) {
      try {
        const installData = await backendFetch<{
          items?: Array<{ url: string; type: string }>;
        }>(`/products/locks/${encodeURIComponent(data.id)}/installation`);
        if (installData?.items && installData.items.length > 0) {
          data.installation_preview = installData.items
            .filter((item) => item.type === "image" && Boolean(item.url))
            .map((item) => item.url);
        }
      } catch {
        // Soft-fail: product might not have an installation record
      }
    }

    return NextResponse.json(mapProductDetail(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("(404)")) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }
    console.error("[GET /api/products/[id]]", error);
    const missingBackend =
      error instanceof Error && error.message.includes("BACKEND_API_URL");
    return NextResponse.json(
      {
        message: missingBackend
          ? "BACKEND_API_URL chưa được cấu hình trên môi trường deploy"
          : "Không thể tải chi tiết sản phẩm",
      },
      { status: 502 },
    );
  }
}
