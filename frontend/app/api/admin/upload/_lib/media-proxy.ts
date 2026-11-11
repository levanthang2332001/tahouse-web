import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { getValidAdminAccessToken } from "@/lib/admin/api-client";

type JsonBody = Record<string, unknown>;

/** Giới hạn khớp với backend (backend/src/modules/upload/upload.constants.ts) */
export const MAX_TOTAL_UPLOAD_BYTES = 60 * 1024 * 1024;
export const TOO_LARGE_MESSAGE =
  "Tệp quá lớn. Ảnh tối đa 15MB, video tối đa 50MB, mỗi lần tải tối đa 60MB.";

/** Thông báo che lỗi 5xx của backend ở production (GlobalExceptionFilter) */
const MASKED_SERVER_MESSAGE_PREFIX = "Đã xảy ra lỗi nội bộ hệ thống";

export const ADMIN_HEADERS_UA = "TA House Admin FE/1.0";

/** Thông báo lỗi 5xx khi xóa tệp (dùng chung cho DELETE /api/admin/upload và /api/admin/upload/[id]) */
export const DELETE_SERVER_ERRORS: Record<string, string> = {
  MEDIA_STORAGE_ERROR: "Không xóa được tệp trên kho lưu trữ R2. Tệp vẫn được giữ nguyên, vui lòng thử lại.",
  MEDIA_DB_ERROR: "Chưa xóa xong tệp do lỗi cơ sở dữ liệu. Vui lòng thử xóa lại.",
};

/**
 * Kiểm tra phiên quản trị và lấy access token.
 * Trả về { token } khi hợp lệ, hoặc { response } 401 để route trả về ngay.
 */
export async function requireAdminToken(
  request: NextRequest,
): Promise<{ token: string; response?: undefined } | { token?: undefined; response: NextResponse }> {
  if (!checkAdminRequestAuth(request)) {
    return {
      response: NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 }),
    };
  }
  const token = await getValidAdminAccessToken();
  if (!token) {
    return {
      response: NextResponse.json(
        { message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" },
        { status: 401 },
      ),
    };
  }
  return { token };
}

/** Đọc body JSON an toàn: trang lỗi HTML (vd. 413/502 của Cloudflare) trả về null thay vì ném lỗi */
export async function readBackendJson(res: { text(): Promise<string> }): Promise<JsonBody | null> {
  let raw = "";
  try {
    raw = await res.text();
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as JsonBody) : null;
  } catch {
    return null;
  }
}

function messageOf(body: JsonBody | null): string | undefined {
  const message = body?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message)) {
    const joined = message.filter((m): m is string => typeof m === "string").join(", ");
    return joined || undefined;
  }
  return undefined;
}

interface ProxyOptions {
  /** Thông báo khi backend không trả về thông điệp nào */
  fallback: string;
  /** Thông báo riêng cho lỗi 5xx theo errorName (vì backend che thông điệp 5xx ở production) */
  serverErrors?: Record<string, string>;
}

/**
 * Chuyển tiếp phản hồi backend: giữ nguyên status thật (400/401/404/409/413/5xx), thông điệp tiếng Việt,
 * errorName và data (vd. danh sách nơi đang dùng tệp khi 409). Không bao giờ trả 2xx khi backend lỗi.
 */
export function mediaProxyResponse(status: number, body: JsonBody | null, options: ProxyOptions): NextResponse {
  if (status >= 200 && status < 300) {
    if (body) return NextResponse.json(body, { status });
    return NextResponse.json(
      { message: "Máy chủ trả về phản hồi không hợp lệ, vui lòng tải lại trang để kiểm tra" },
      { status: 502 },
    );
  }

  const errorName = typeof body?.errorName === "string" ? body.errorName : undefined;
  let message = messageOf(body);

  if (status === 413) {
    message = message ?? TOO_LARGE_MESSAGE;
  } else if (status === 401) {
    message = message ?? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
  } else if (status >= 500) {
    const mapped = errorName ? options.serverErrors?.[errorName] : undefined;
    if (mapped && (!message || message.startsWith(MASKED_SERVER_MESSAGE_PREFIX))) {
      message = mapped;
    }
    if (!body) message = `${options.fallback} (máy chủ lỗi ${status})`;
  }

  return NextResponse.json(
    {
      message: message ?? options.fallback,
      ...(errorName ? { errorName } : {}),
      ...(body && "data" in body ? { data: body.data } : {}),
    },
    { status },
  );
}

/** Lỗi mạng / hết thời gian chờ khi gọi backend */
export function networkErrorResponse(label: string, error: unknown, fallback: string): NextResponse {
  console.error(label, error);
  const name = error instanceof Error ? error.name : "";
  if (name === "TimeoutError" || name === "AbortError") {
    return NextResponse.json(
      { message: `${fallback}: máy chủ phản hồi quá lâu. Vui lòng tải lại trang để kiểm tra kết quả.` },
      { status: 504 },
    );
  }
  return NextResponse.json({ message: `${fallback}: không kết nối được máy chủ` }, { status: 502 });
}
