import { NextRequest, NextResponse } from "next/server";
import { fetch as undiciFetch } from "undici";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { getValidAdminAccessToken } from "@/lib/admin/api-client";
import { getBackendUrl } from "@/lib/backend/config";
import { backendAgent } from "@/lib/backend/client";

export async function POST(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
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
    const formData = await request.formData();
    const backendUrl = getBackendUrl();

    // Forward multipart form data to backend with native fetch to ensure proper boundary
    const beRes = await fetch(`${backendUrl}/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "TA House Admin FE/1.0",
      },
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    const beData = (await beRes.json()) as Record<string, unknown>;

    if (!beRes.ok) {
      return NextResponse.json(
        { message: typeof beData?.message === "string" ? beData.message : "Tải lên tệp tin thất bại" },
        { status: beRes.status },
      );
    }

    return NextResponse.json(beData, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/upload]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lỗi kết nối khi tải lên tệp tin",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
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
    const query = request.nextUrl.searchParams.toString();
    const backendUrl = getBackendUrl();
    const beRes = await undiciFetch(`${backendUrl}/admin/upload?${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "TA House Admin FE/1.0",
      },
      dispatcher: backendAgent,
    });

    const beData = (await beRes.json()) as Record<string, unknown>;
    return NextResponse.json(beData, { status: beRes.status });
  } catch (error) {
    console.error("[GET /api/admin/upload]", error);
    return NextResponse.json(
      { message: "Không thể lấy danh sách tệp tin tải lên" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = checkAdminRequestAuth(request);
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
    const body = await request.json();
    const backendUrl = getBackendUrl();
    const beRes = await undiciFetch(`${backendUrl}/admin/upload`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "TA House Admin FE/1.0",
      },
      body: JSON.stringify(body),
      dispatcher: backendAgent,
    });

    const beData = (await beRes.json()) as Record<string, unknown>;
    return NextResponse.json(beData, { status: beRes.status });
  } catch (error) {
    console.error("[DELETE /api/admin/upload]", error);
    return NextResponse.json(
      { message: "Không thể xóa tệp tin media" },
      { status: 500 },
    );
  }
}
