"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Clock, Loader2, Mail, Map as MapIcon, MapPin, Phone, RefreshCw, RotateCcw, Store } from "lucide-react";
import { SiFacebook, SiZalo } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { COMPANY_LEGAL } from "@/data/company-legal";
import type { StoreSettings, StoreSettingsInput, StoreSocialLinks } from "@/lib/types/store-settings";

type Errors = Record<string, string>;

// Numbers the website currently displays; backend entries outside this set (e.g. a seeded 1900 line) stay hidden
const SITE_PHONE_DIGITS = new Set<string>([COMPANY_LEGAL.phoneTel, COMPANY_LEGAL.phoneSecondaryTel]);
const digits = (value: string) => value.replace(/\D/g, "");

/** Indexes of phone entries the website uses, judged on the loaded data so a field never vanishes mid-edit */
function sitePhoneIndexes(settings: StoreSettings): number[] {
  return (settings.phoneNumbers ?? []).flatMap((p, i) => (SITE_PHONE_DIGITS.has(digits(p.number)) ? [i] : []));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+$/i;
const PHONE_RE = /^[0-9+().\s-]{6,20}$/;

// Only the channels the website links to; YouTube/Instagram/TikTok stay in the data untouched
const SOCIALS: { key: keyof StoreSocialLinks; label: string; icon: React.ElementType; color: string }[] = [
  { key: "zalo", label: "Zalo", icon: SiZalo, color: "text-[#0068FF]" },
  { key: "facebook", label: "Facebook", icon: SiFacebook, color: "text-[#1877F2]" },
]

// One colour per kind of info, reused by the card header and the field icons
const TONES = {
  green: { icon: "text-[#3f8f1f]", badge: "bg-[#79C143]/15 text-[#3f8f1f]" },
  blue: { icon: "text-[#1d6fd6]", badge: "bg-[#1d6fd6]/10 text-[#1d6fd6]" },
  violet: { icon: "text-[#7c3aed]", badge: "bg-[#7c3aed]/10 text-[#7c3aed]" },
  red: { icon: "text-[#c0283a]", badge: "bg-[#c0283a]/10 text-[#c0283a]" },
  amber: { icon: "text-[#c2700a]", badge: "bg-[#f59e0b]/15 text-[#c2700a]" },
  pink: { icon: "text-[#db2777]", badge: "bg-[#db2777]/10 text-[#db2777]" },
} as const;
type Tone = keyof typeof TONES;

function toInput(s: StoreSettings): StoreSettingsInput {
  return {
    storeName: s.storeName ?? "",
    slogan: s.slogan ?? "",
    socialLinks: { ...s.socialLinks },
    phoneNumbers: (s.phoneNumbers ?? []).map((p) => ({ ...p })),
    emails: (s.emails ?? []).map((e) => ({ ...e })),
    addresses: (s.addresses ?? []).map((a) => ({ ...a })),
    openingHours: { ...s.openingHours, text: s.openingHours?.text ?? "" },
  };
}

// The primary email / main address is the one the website shows (first entry as fallback)
const primaryIndex = <T,>(items: T[], isPrimary: (item: T) => boolean | undefined) =>
  items.length === 0 ? -1 : Math.max(items.findIndex((item) => isPrimary(item)), 0);

/** Validates only the fields this form shows, so hidden data can never block a save */
function validate(form: StoreSettingsInput, phoneIndexes: number[]): Errors {
  const errors: Errors = {};
  if (!form.storeName.trim()) errors.storeName = "Không được để trống";
  if (!form.openingHours.text.trim()) errors.hours = "Không được để trống";
  phoneIndexes.forEach((i) => {
    if (!PHONE_RE.test(form.phoneNumbers[i]?.number.trim() ?? "")) errors[`phone.${i}`] = "Số điện thoại không hợp lệ";
  });
  const e = primaryIndex(form.emails, (m) => m.isPrimary);
  if (e >= 0 && !EMAIL_RE.test(form.emails[e].email.trim())) errors[`email.${e}`] = "Email không hợp lệ";
  const a = primaryIndex(form.addresses, (x) => x.isMain);
  if (a >= 0) {
    if (!form.addresses[a].address.trim()) errors[`addr.${a}`] = "Không được để trống";
    const map = form.addresses[a].mapUrl?.trim();
    if (map && !URL_RE.test(map)) errors[`map.${a}`] = "Link phải bắt đầu bằng https://";
  }
  SOCIALS.forEach(({ key }) => {
    const v = form.socialLinks[key]?.trim();
    if (v && !URL_RE.test(v)) errors[`social.${key}`] = "Link phải bắt đầu bằng https://";
  });
  return errors;
}

function Field({
  label,
  badge,
  error,
  icon: Icon,
  iconClassName = "text-navy/50",
  children,
}: {
  label: React.ReactNode;
  badge?: string;
  error?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="flex items-center gap-2 text-xs font-semibold text-navy/80">
        <span className="truncate">{label}</span>
        {badge && (
          <span className="shrink-0 rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-semibold text-[#3f741b]">
            {badge}
          </span>
        )}
      </span>
      {Icon ? (
        <span className="relative block">
          <Icon size={17} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${iconClassName}`} />
          {React.cloneElement(children, { className: `pl-11 ${children.props.className ?? ""}` })}
        </span>
      ) : (
        children
      )}
      {error && (
        <span className="flex items-center gap-1 text-xs text-[#c0283a]">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </label>
  );
}

function Card({
  icon: Icon,
  tone,
  title,
  description,
  className = "",
  children,
}: {
  icon: React.ElementType;
  tone: Tone;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-3xl border border-gray-light/80 bg-white p-6 shadow-xs ${className}`}>
      <header className="mb-5 flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONES[tone].badge}`}>
          <Icon size={21} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-navy">{title}</h2>
          <p className="text-xs text-navy/60">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export default function StoreSettingsForm() {
  const [loaded, setLoaded] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState<StoreSettingsInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tải cấu hình cửa hàng");
      setLoaded(data.settings);
      setForm(toInput(data.settings));
      setErrors({});
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Không thể tải cấu hình cửa hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch on mount; the setState calls happen after the request resolves
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const dirty = Boolean(loaded && form && JSON.stringify(form) !== JSON.stringify(toInput(loaded)));

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-gray-light/80 bg-white p-12 text-sm text-navy/70">
        <Loader2 size={16} className="animate-spin" /> Đang tải...
      </div>
    );
  }

  if (loadError || !loaded || !form) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#c0283a]/20 bg-[#c0283a]/5 p-5 text-sm text-[#c0283a]">
        <span className="flex items-center gap-2 font-medium">
          <AlertCircle size={16} /> {loadError || "Không có dữ liệu cấu hình"}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={load} className="text-xs font-semibold gap-1.5 bg-white">
          <RefreshCw size={13} /> Thử lại
        </Button>
      </div>
    );
  }

  const set = (patch: Partial<StoreSettingsInput>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // Once errors are shown, clear them as soon as the field is fixed
    if (Object.keys(errors).length > 0) setErrors(validate(next, phoneIndexes));
  };
  const setListItem = <K extends "phoneNumbers" | "emails" | "addresses">(
    list: K,
    index: number,
    changes: Partial<StoreSettingsInput[K][number]>,
  ) => set({ [list]: form[list].map((item, i) => (i === index ? { ...item, ...changes } : item)) } as Partial<StoreSettingsInput>);

  const phoneIndexes = sitePhoneIndexes(loaded);
  const emailIndex = primaryIndex(form.emails, (m) => m.isPrimary);
  const addressIndex = primaryIndex(form.addresses, (a) => a.isMain);

  const inputProps = (key: string) =>
    errors[key] ? { "aria-invalid": true as const, className: "border-[#c0283a] focus-visible:ring-[#c0283a]" } : {};

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form, phoneIndexes);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại các ô được đánh dấu đỏ");
      requestAnimationFrame(() =>
        document.querySelector("[aria-invalid='true']")?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lưu cấu hình cửa hàng");
      setLoaded(data.settings);
      setForm(toInput(data.settings));
      toast.success("Đã lưu thông tin cửa hàng");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu cấu hình cửa hàng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} noValidate className="space-y-6">
      {/* Only fields the public website renders are editable here; the rest pass through unchanged on save */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card icon={Store} tone="green" title="Thương hiệu & mạng xã hội" description="Tên hiển thị và các nút Zalo, Facebook" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Tên cửa hàng" icon={Store} iconClassName={TONES.green.icon} error={errors.storeName}>
              <Input value={form.storeName} onChange={(e) => set({ storeName: e.target.value })} {...inputProps("storeName")} />
            </Field>
            {SOCIALS.map(({ key, label, icon, color }) => (
              <Field key={key} label={label} icon={icon} iconClassName={color} error={errors[`social.${key}`]}>
                <Input
                  type="url"
                  value={form.socialLinks[key] ?? ""}
                  placeholder="https://"
                  onChange={(e) => set({ socialLinks: { ...form.socialLinks, [key]: e.target.value } })}
                  {...inputProps(`social.${key}`)}
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card icon={Phone} tone="blue" title="Liên hệ" description="Số điện thoại và email hiển thị cho khách hàng">
          <div className="space-y-4">
            {phoneIndexes.map((i) => {
              const p = form.phoneNumbers[i];
              return (
                <Field key={p.id ?? i} label={p.label} badge={p.isHotline ? "Hotline" : undefined} icon={Phone} iconClassName={TONES.green.icon} error={errors[`phone.${i}`]}>
                  <Input
                    type="tel"
                    inputMode="tel"
                    value={p.number}
                    onChange={(e) => setListItem("phoneNumbers", i, { number: e.target.value })}
                    {...inputProps(`phone.${i}`)}
                  />
                </Field>
              );
            })}
            {emailIndex >= 0 && (
              <Field label={form.emails[emailIndex].label} icon={Mail} iconClassName={TONES.blue.icon} error={errors[`email.${emailIndex}`]}>
                <Input
                  type="email"
                  inputMode="email"
                  value={form.emails[emailIndex].email}
                  onChange={(e) => setListItem("emails", emailIndex, { email: e.target.value })}
                  {...inputProps(`email.${emailIndex}`)}
                />
              </Field>
            )}
          </div>
        </Card>

        <Card icon={MapPin} tone="red" title="Cửa hàng" description="Địa chỉ, nút chỉ đường và giờ mở cửa">
          <div className="space-y-4">
            {addressIndex >= 0 && (
              <>
                <Field label={form.addresses[addressIndex].branchName} icon={MapPin} iconClassName={TONES.red.icon} error={errors[`addr.${addressIndex}`]}>
                  <Input
                    value={form.addresses[addressIndex].address}
                    onChange={(e) => setListItem("addresses", addressIndex, { address: e.target.value })}
                    {...inputProps(`addr.${addressIndex}`)}
                  />
                </Field>
                <Field label="Link chỉ đường (Google Maps)" icon={MapIcon} iconClassName={TONES.amber.icon} error={errors[`map.${addressIndex}`]}>
                  <Input
                    type="url"
                    value={form.addresses[addressIndex].mapUrl ?? ""}
                    placeholder="https://maps.app.goo.gl/..."
                    onChange={(e) => setListItem("addresses", addressIndex, { mapUrl: e.target.value })}
                    {...inputProps(`map.${addressIndex}`)}
                  />
                </Field>
              </>
            )}
            <Field label="Giờ mở cửa" icon={Clock} iconClassName={TONES.violet.icon} error={errors.hours}>
              <Input
                value={form.openingHours.text}
                onChange={(e) => set({ openingHours: { ...form.openingHours, text: e.target.value } })}
                {...inputProps("hours")}
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* Save bar stays in view while scrolling the form */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-light/80 bg-white/95 px-5 py-3 shadow-lg backdrop-blur-sm">
        <span className={`flex items-center gap-2 text-xs ${dirty ? "font-semibold text-amber-700" : "text-navy/60"}`}>
          <span className={`h-2 w-2 rounded-full ${dirty ? "bg-amber-500" : "bg-brand-green"}`} />
          {dirty ? "Có thay đổi chưa lưu" : `Đã lưu · cập nhật ${new Date(loaded.updatedAt).toLocaleString("vi-VN")}`}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!dirty || saving}
            onClick={() => {
              setForm(toInput(loaded));
              setErrors({});
            }}
            className="text-xs font-semibold gap-1.5 bg-white"
          >
            <RotateCcw size={13} /> Hoàn tác
          </Button>
          <Button type="submit" variant="brand" size="sm" disabled={!dirty || saving} className="text-xs font-bold gap-1.5">
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
