import { NextRequest, NextResponse } from "next/server";
import { fetch as undiciFetch } from "undici";
import { getBackendUrl } from "@/lib/backend/config";
import { backendAgent } from "@/lib/backend/client";
import {
  ADMIN_HEADERS_UA,
  DELETE_SERVER_ERRORS,
  MAX_TOTAL_UPLOAD_BYTES,
  TOO_LARGE_MESSAGE,
  mediaProxyResponse,
  networkErrorResponse,
  readBackendJson,
  requireAdminToken,
} from "./_lib/media-proxy";

const UPLOAD_SERVER_ERRORS = {
  MEDIA_STORAGE_ERROR: "Không tải được tệp lên kho lưu trữ R2. Vui lòng thử lại.",
  MEDIA_DB_ERROR: "Không lưu được thông tin tệp vào cơ sở dữ liệu. Vui lòng thử lại.",
  MEDIA_UPLOAD_FAILED: "Không tải lên được tệp nào. Vui lòng thử lại.",
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminToken(request);
  if (auth.response) return auth.response;

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_TOTAL_UPLOAD_BYTES) {
    return NextResponse.json({ message: TOO_LARGE_MESSAGE }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu tải lên không hợp lệ. Vui lòng chọn lại tệp và thử lại." },
      { status: 400 },
    );
  }

  try {
    // Native fetch để tự tạo boundary multipart đúng
    const beRes = await fetch(`${getBackendUrl()}/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "User-Agent": ADMIN_HEADERS_UA,
      },
      body: formData,
      signal: AbortSignal.timeout(120_000),
    });
    const body = await readBackendJson(beRes);
    return mediaProxyResponse(beRes.status, body, {
      fallback: "Tải lên tệp thất bại",
      serverErrors: UPLOAD_SERVER_ERRORS,
    });
  } catch (error) {
    return networkErrorResponse("[POST /api/admin/upload]", error, "Tải lên tệp thất bại");
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminToken(request);
  if (auth.response) return auth.response;

  try {
    const query = request.nextUrl.searchParams.toString();
    const beRes = await undiciFetch(`${getBackendUrl()}/admin/upload${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "User-Agent": ADMIN_HEADERS_UA,
      },
      dispatcher: backendAgent,
    });
    const body = await readBackendJson(beRes);
    return mediaProxyResponse(beRes.status, body, {
      fallback: "Không thể lấy danh sách tệp",
    });
  } catch (error) {
    return networkErrorResponse("[GET /api/admin/upload]", error, "Không thể lấy danh sách tệp");
  }
}

/** Xóa theo { id } hoặc { url } (URL phải khớp 1 tệp trong thư viện). force=true để xóa tệp đang được dùng. */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminToken(request);
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Thiếu ID hoặc URL của tệp cần xóa." }, { status: 400 });
  }

  try {
    const force = request.nextUrl.searchParams.get("force");
    const beRes = await undiciFetch(
      `${getBackendUrl()}/admin/upload${force ? `?force=${encodeURIComponent(force)}` : ""}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
          "User-Agent": ADMIN_HEADERS_UA,
        },
        body: JSON.stringify(body),
        dispatcher: backendAgent,
      },
    );
    const beBody = await readBackendJson(beRes);
    return mediaProxyResponse(beRes.status, beBody, {
      fallback: "Không thể xóa tệp",
      serverErrors: DELETE_SERVER_ERRORS,
    });
  } catch (error) {
    return networkErrorResponse("[DELETE /api/admin/upload]", error, "Không thể xóa tệp");
  }
}
