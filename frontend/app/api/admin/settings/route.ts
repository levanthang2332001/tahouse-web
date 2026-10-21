import { NextRequest, NextResponse } from "next/server";
import { checkAdminRequestAuth } from "@/lib/admin/auth";
import { adminBackendFetch } from "@/lib/admin/api-client";
import type { StoreSettings, StoreSettingsInput } from "@/lib/types/store-settings";

function unauthorized() {
  return NextResponse.json({ message: "Chưa xác thực quyền quản trị" }, { status: 401 });
}

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.startsWith("UNAUTHORIZED") ? 401 : 502;
  return NextResponse.json({ message }, { status });
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const optional = (value: unknown) => str(value) || undefined;

/** Keep only fields the backend DTO accepts, so stray client state never reaches the API */
function pickSettingsInput(body: Partial<StoreSettingsInput>): StoreSettingsInput {
  return {
    storeName: str(body.storeName),
    slogan: str(body.slogan),
    socialLinks: {
      zalo: optional(body.socialLinks?.zalo),
      facebook: optional(body.socialLinks?.facebook),
      youtube: optional(body.socialLinks?.youtube),
      instagram: optional(body.socialLinks?.instagram),
      tiktok: optional(body.socialLinks?.tiktok),
    },
    phoneNumbers: (body.phoneNumbers ?? []).map((p) => ({
      id: optional(p.id),
      number: str(p.number),
      label: str(p.label),
      isHotline: Boolean(p.isHotline),
    })),
    emails: (body.emails ?? []).map((e) => ({
      id: optional(e.id),
      email: str(e.email),
      label: str(e.label),
      isPrimary: Boolean(e.isPrimary),
    })),
    addresses: (body.addresses ?? []).map((a) => ({
      id: optional(a.id),
      branchName: str(a.branchName),
      address: str(a.address),
      mapUrl: optional(a.mapUrl),
      isMain: Boolean(a.isMain),
    })),
    openingHours: {
      text: str(body.openingHours?.text),
      weekdays: optional(body.openingHours?.weekdays),
      weekend: optional(body.openingHours?.weekend),
      note: optional(body.openingHours?.note),
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
    return errorResponse(error, "Không thể tải cấu hình cửa hàng");
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAdminRequestAuth(request)) return unauthorized();

  let body: Partial<StoreSettingsInput>;
  try {
    body = (await request.json()) as Partial<StoreSettingsInput>;
  } catch {
    return NextResponse.json({ message: "Dữ liệu cấu hình không đúng định dạng" }, { status: 400 });
  }

  const input = pickSettingsInput(body);
  if (!input.storeName) {
    return NextResponse.json({ message: "Tên cửa hàng không được để trống" }, { status: 400 });
  }
  if (!input.openingHours.text) {
    return NextResponse.json({ message: "Giờ mở cửa hiển thị không được để trống" }, { status: 400 });
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
    return errorResponse(error, "Không thể lưu cấu hình cửa hàng");
  }
}
