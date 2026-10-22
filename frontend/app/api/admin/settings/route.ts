import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch, adminErrorResponse } from "@/lib/admin/api-client";
import type { StoreSettings, StoreSettingsInput } from "@/lib/types/store-settings";

function unauthorized() {
  return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
}

class InputError extends Error {}

const MAX_TEXT = 200;
const MAX_ADDRESS = 300;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+().\s-]{6,20}$/;
const URL_RE = /^https?:\/\/\S+$/i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Optional trimmed string; rejects non-strings and over-long values */
function text(value: unknown, label: string, max = MAX_TEXT): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new InputError(`${label} phải là chuỗi ký tự`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new InputError(`${label} tối đa ${max} ký tự`);
  return trimmed;
}

function required(value: unknown, label: string, max = MAX_TEXT): string {
  const v = text(value, label, max);
  if (!v) throw new InputError(`${label} không được để trống`);
  return v;
}

function url(value: unknown, label: string): string | undefined {
  const v = text(value, label, 500);
  if (v && !URL_RE.test(v)) throw new InputError(`${label} phải là đường dẫn bắt đầu bằng https://`);
  return v || undefined;
}

function list(value: unknown, label: string): Record<string, unknown>[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new InputError(`${label} phải là danh sách`);
  return value.map((item, i) => {
    if (!isRecord(item)) throw new InputError(`${label} #${i + 1} không hợp lệ`);
    return item;
  });
}

/**
 * Validates the body and keeps only fields the backend DTO accepts, so malformed or stray client data never
 * reaches the API. Throws InputError with a user-facing message.
 */
function pickSettingsInput(body: unknown): StoreSettingsInput {
  if (!isRecord(body)) throw new InputError("Dữ liệu cấu hình không đúng định dạng");
  const social = body.socialLinks === undefined ? {} : body.socialLinks;
  const hours = body.openingHours === undefined ? {} : body.openingHours;
  if (!isRecord(social)) throw new InputError("Mạng xã hội không đúng định dạng");
  if (!isRecord(hours)) throw new InputError("Giờ mở cửa không đúng định dạng");

  return {
    storeName: required(body.storeName, "Tên cửa hàng"),
    slogan: text(body.slogan, "Slogan"),
    socialLinks: {
      zalo: url(social.zalo, "Link Zalo"),
      facebook: url(social.facebook, "Link Facebook"),
      youtube: url(social.youtube, "Link YouTube"),
      instagram: url(social.instagram, "Link Instagram"),
      tiktok: url(social.tiktok, "Link TikTok"),
    },
    phoneNumbers: list(body.phoneNumbers, "Số điện thoại").map((p, i) => {
      const number = required(p.number, `Số điện thoại #${i + 1}`, 30);
      if (!PHONE_RE.test(number)) throw new InputError(`Số điện thoại #${i + 1} không hợp lệ`);
      return {
        id: text(p.id, "ID") || undefined,
        number,
        label: required(p.label, `Nhãn số điện thoại #${i + 1}`),
        isHotline: p.isHotline === true,
      };
    }),
    emails: list(body.emails, "Email").map((e, i) => {
      const email = required(e.email, `Email #${i + 1}`, 120);
      if (!EMAIL_RE.test(email)) throw new InputError(`Email #${i + 1} không hợp lệ`);
      return {
        id: text(e.id, "ID") || undefined,
        email,
        label: required(e.label, `Nhãn email #${i + 1}`),
        isPrimary: e.isPrimary === true,
      };
    }),
    addresses: list(body.addresses, "Địa chỉ").map((a, i) => ({
      id: text(a.id, "ID") || undefined,
      branchName: required(a.branchName, `Tên chi nhánh #${i + 1}`),
      address: required(a.address, `Địa chỉ #${i + 1}`, MAX_ADDRESS),
      mapUrl: url(a.mapUrl, `Link bản đồ #${i + 1}`),
      isMain: a.isMain === true,
    })),
    openingHours: {
      text: required(hours.text, "Giờ mở cửa hiển thị"),
      weekdays: text(hours.weekdays, "Giờ Thứ 2 – Thứ 6") || undefined,
      weekend: text(hours.weekend, "Giờ Thứ 7 – Chủ nhật") || undefined,
      note: text(hours.note, "Ghi chú giờ mở cửa", 300) || undefined,
    },
  };
}

export async function GET(request: NextRequest) {
  if (!checkAdminRequestAuth(request)) return unauthorized();

  try {
    const settings = await adminBackendFetch<StoreSettings>("/admin/settings", { cache: "no-store" });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[GET /api/admin/settings]", error);
    return adminErrorResponse(error, "Không thể tải cấu hình cửa hàng");
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAdminRequestAuth(request)) return unauthorized();

  let input: StoreSettingsInput;
  try {
    input = pickSettingsInput(await request.json());
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Dữ liệu cấu hình không đúng định dạng";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    // PATCH, not PUT: the form owns these fields only, so backend-side extras like `metadata` survive
    const settings = await adminBackendFetch<StoreSettings>("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return NextResponse.json({ success: true, message: "Đã lưu cấu hình cửa hàng", settings });
  } catch (error) {
    console.error("[PUT /api/admin/settings]", error);
    return adminErrorResponse(error, "Không thể lưu cấu hình cửa hàng");
  }
}
