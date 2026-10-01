import { NextRequest, NextResponse } from "next/server";
import { fetch as undiciFetch } from "undici";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { getValidAdminAccessToken } from "@/lib/admin/api-client";
import { getBackendUrl } from "@/lib/backend/config";
import { backendAgent } from "@/lib/backend/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(_request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  const token = await getValidAdminAccessToken();
  if (!token) {
    return NextResponse.json(
      { message: "Phiên làm việc hết hạn" },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const backendUrl = getBackendUrl();
    const beRes = await undiciFetch(
      `${backendUrl}/admin/upload/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "TA House Admin FE/1.0",
        },
        dispatcher: backendAgent,
      },
    );

    const beData = (await beRes.json()) as Record<string, unknown>;
    return NextResponse.json(beData, { status: beRes.status });
  } catch (error) {
    console.error("[GET /api/admin/upload/[id]]", error);
    return NextResponse.json(
      { message: "Không thể lấy thông tin tệp tin" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = checkAdminRequestAuth(_request);
  if (!user) {
    return NextResponse.json(
      { message: "Chưa xác thực quyền quản trị" },
      { status: 401 },
    );
  }

  const token = await getValidAdminAccessToken();
  if (!token) {
    return NextResponse.json(
      { message: "Phiên làm việc hết hạn" },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const backendUrl = getBackendUrl();
    const beRes = await undiciFetch(
      `${backendUrl}/admin/upload/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "TA House Admin FE/1.0",
        },
        dispatcher: backendAgent,
      },
    );

    const beData = (await beRes.json()) as Record<string, unknown>;
    return NextResponse.json(beData, { status: beRes.status });
  } catch (error) {
    console.error("[DELETE /api/admin/upload/[id]]", error);
    return NextResponse.json(
      { message: "Không thể xóa tệp tin media" },
      { status: 500 },
    );
  }
}
