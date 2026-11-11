import { NextRequest } from "next/server";
import { fetch as undiciFetch } from "undici";
import { getBackendUrl } from "@/lib/backend/config";
import { backendAgent } from "@/lib/backend/client";
import {
  ADMIN_HEADERS_UA,
  DELETE_SERVER_ERRORS,
  mediaProxyResponse,
  networkErrorResponse,
  readBackendJson,
  requireAdminToken,
} from "../_lib/media-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminToken(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const beRes = await undiciFetch(`${getBackendUrl()}/admin/upload/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "User-Agent": ADMIN_HEADERS_UA,
      },
      dispatcher: backendAgent,
    });
    const body = await readBackendJson(beRes);
    return mediaProxyResponse(beRes.status, body, { fallback: "Không thể lấy thông tin tệp" });
  } catch (error) {
    return networkErrorResponse("[GET /api/admin/upload/[id]]", error, "Không thể lấy thông tin tệp");
  }
}

/** DELETE /api/admin/upload/:id[?force=true] — 404 nếu không có tệp, 409 kèm tóm tắt nếu tệp đang được dùng */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAdminToken(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const force = request.nextUrl.searchParams.get("force");
    const beRes = await undiciFetch(
      `${getBackendUrl()}/admin/upload/${encodeURIComponent(id)}${force ? `?force=${encodeURIComponent(force)}` : ""}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "User-Agent": ADMIN_HEADERS_UA,
        },
        dispatcher: backendAgent,
      },
    );
    const body = await readBackendJson(beRes);
    return mediaProxyResponse(beRes.status, body, {
      fallback: "Không thể xóa tệp",
      serverErrors: DELETE_SERVER_ERRORS,
    });
  } catch (error) {
    return networkErrorResponse("[DELETE /api/admin/upload/[id]]", error, "Không thể xóa tệp");
  }
}
