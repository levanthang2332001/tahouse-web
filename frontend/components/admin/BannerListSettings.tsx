"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Loader2,
  CheckCircle2,
  RefreshCw,
  ImageIcon,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { summarizeUploadErrors, uploadAdminFile } from "@/lib/admin/upload-client";
import type { StoreSettings } from "@/lib/types/store-settings";

type BannerField = "heroBanners" | "promoBanners";

export interface BannerListSettingsProps {
  /** Field trong cấu hình cửa hàng (backend lưu trong metadata) */
  field: BannerField;
  /** Tên hiển thị ngắn, vd. "banner hero" — dùng trong thông báo */
  label: string;
  title: string;
  description: string;
  min: number;
  max: number;
  recommendedMin?: number;
  /** Danh sách hiển thị khi cấu hình chưa có field này */
  fallback: string[];
  /** Thư mục upload trên R2 */
  uploadFolder: string;
  /** Tỷ lệ khung xem trước, vd. "aspect-video" */
  previewAspectClass?: string;
  uploadHint: string;
  emptyHint?: string;
  tipTitle: string;
  tipBody: React.ReactNode;
}

export default function BannerListSettings({
  field,
  label,
  title,
  description,
  min,
  max,
  recommendedMin = min,
  fallback,
  uploadFolder,
  previewAspectClass = "aspect-video",
  uploadHint,
  emptyHint,
  tipTitle,
  tipBody,
}: BannerListSettingsProps) {
  const [banners, setBanners] = useState<string[]>([]);
  const [initialBanners, setInitialBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.message || `Không thể tải danh sách ${label}`);

        const settings: StoreSettings = data.settings || {};
        const saved = settings[field];
        const list = Array.isArray(saved) && saved.length >= min ? saved : fallback;

        setBanners(list);
        setInitialBanners(list);
      } catch (err) {
        if (!cancelled) {
          // Không cho chỉnh sửa khi chưa tải được: lưu lúc này sẽ ghi đè dữ liệu thật bằng danh sách mặc định
          setLoadFailed(true);
          toast.error(err instanceof Error ? err.message : `Lỗi khi tải danh sách ${label}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [field, label, min, fallback]);

  const saveBannersDirectly = async (list: string[]) => {
    if (list.length < min || list.length > max) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: list }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Không thể lưu danh sách ${label}`);
      // Backend cũ bỏ qua field lạ nhưng vẫn trả 200 → so lại dữ liệu trả về để không báo "đã lưu" giả
      const saved = (data.settings as StoreSettings | undefined)?.[field];
      if (!Array.isArray(saved) || JSON.stringify(saved) !== JSON.stringify(list)) {
        throw new Error("Máy chủ chưa lưu được danh sách (backend có thể chưa được cập nhật)");
      }
      setInitialBanners(list);
      toast.success(`Đã lưu ${label}!`);
    } catch (err) {
      toast.error(
        `${err instanceof Error ? err.message : `Lỗi khi lưu ${label}`}. Thay đổi chưa được lưu — bấm "Lưu" để thử lại.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      toast.error("Vui lòng chọn các tệp hình ảnh hợp lệ (PNG, JPG, WEBP, JPEG)");
      return;
    }

    const remainingSlots = max - banners.length;
    if (remainingSlots <= 0) {
      toast.error(`Đã đạt tối đa ${max} ảnh ${label}`);
      return;
    }

    const filesToUpload = fileArray.slice(0, remainingSlots);
    if (fileArray.length > remainingSlots) {
      toast.info(`Chỉ có thể thêm ${remainingSlots} ảnh nữa (tối đa ${max} ảnh)`);
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: filesToUpload.length });
    const newUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadProgress({ current: i + 1, total: filesToUpload.length });

      try {
        newUrls.push(await uploadAdminFile(file, { folder: uploadFolder }));
      } catch (err) {
        errors.push(err instanceof Error ? err.message : `${file.name}: tải lên thất bại`);
      }
    }

    if (errors.length > 0) {
      toast.error(`Có ${errors.length} ảnh không tải lên được: ${summarizeUploadErrors(errors)}`);
    }

    if (newUrls.length > 0) {
      const updated = [...banners, ...newUrls].slice(0, max);
      setBanners(updated);
      // Kết quả cuối cùng (đã lưu / lỗi) do saveBannersDirectly thông báo
      toast.info(`Đã tải lên ${newUrls.length} ảnh, đang lưu danh sách...`);
      void saveBannersDirectly(updated);
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleAddManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) return;
    if (!/^(\/(?!\/)|https:\/\/)\S+$/i.test(url)) {
      toast.error("Đường dẫn ảnh phải bắt đầu bằng / (ảnh trong site) hoặc https://");
      return;
    }

    if (banners.length >= max) {
      toast.error(`Đã đạt tối đa ${max} ảnh ${label}`);
      return;
    }

    const updated = [...banners, url];
    setBanners(updated);
    setManualUrl("");
    setShowManualInput(false);
    toast.success("Đã thêm URL ảnh");
    void saveBannersDirectly(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const next = [...banners];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setBanners(next);
    void saveBannersDirectly(next);
  };

  const handleRemove = (index: number) => {
    if (banners.length <= min) {
      toast.error(`Cần tối thiểu ${min} ảnh ${label}`);
      return;
    }

    const updated = banners.filter((_, i) => i !== index);
    setBanners(updated);
    toast.info("Đã xóa ảnh khỏi danh sách");
    void saveBannersDirectly(updated);
  };

  const handleSave = async () => {
    if (banners.length < min) {
      toast.error(`Cần tối thiểu ${min} ảnh ${label}`);
      return;
    }

    if (banners.length > max) {
      toast.error(`Tối đa ${max} ảnh ${label}`);
      return;
    }

    await saveBannersDirectly(banners);
  };

  const isDirty = JSON.stringify(banners) !== JSON.stringify(initialBanners);
  // Khóa thao tác khi đang lưu/tải lên: các lần lưu chạy song song có thể tới backend sai thứ tự và ghi đè nhau
  const busy = saving || uploading;

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-gray-light/80 p-12 text-center shadow-xs">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-3 text-xs font-bold text-navy/60">Đang tải cấu hình {label}...</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="rounded-3xl bg-white border border-rose-200 p-12 text-center shadow-xs space-y-3">
        <p className="text-sm font-bold text-rose-700">Không tải được danh sách {label} từ máy chủ.</p>
        <p className="text-xs text-navy/60">Tải lại trang để thử lại. Chỉnh sửa bị khóa để tránh ghi đè dữ liệu hiện có.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs font-bold gap-1.5">
          <RefreshCw size={13} />
          Tải lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl bg-white border border-gray-light/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-light/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-navy">{title}</h2>
                <Badge
                  variant="outline"
                  className={
                    banners.length >= recommendedMin
                      ? "bg-brand-green/10 text-brand-green border-brand-green/30 font-bold text-[11px]"
                      : "bg-amber-50 text-amber-700 border-amber-300 font-bold text-[11px]"
                  }
                >
                  {banners.length} / {max} ảnh
                </Badge>
              </div>
              <p className="text-xs text-navy/50 mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBanners(initialBanners)}
                disabled={busy}
                className="text-xs font-bold gap-1.5 h-9"
              >
                <RefreshCw size={13} />
                <span>Hoàn tác</span>
              </Button>
            )}
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={handleSave}
              disabled={busy || !isDirty}
              className="text-xs font-bold gap-1.5 h-9"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Lưu {label}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Upload Dropzone */}
        {banners.length < max && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void handleUploadFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {uploading ? (
              <div className="h-40 rounded-2xl border-2 border-dashed border-brand-green bg-brand-green/5 flex flex-col items-center justify-center gap-2 p-6 text-center animate-pulse">
                <Loader2 size={28} className="animate-spin text-brand-green" />
                <div className="text-sm font-bold text-navy">
                  Đang tải lên máy chủ {uploadProgress?.current}/{uploadProgress?.total}...
                </div>
                <div className="text-xs text-navy/50">Vui lòng chờ trong giây lát</div>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (!busy) fileInputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!busy && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    void handleUploadFiles(e.dataTransfer.files);
                  }
                }}
                className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-green bg-[#FAF9F5] hover:bg-[#F2EFE8] p-6 text-center cursor-pointer transition-all group"
              >
                <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-white shadow-xs border border-gray-100 text-brand-green mb-2 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div className="text-xs sm:text-sm font-bold text-navy">
                  Kéo thả ảnh vào đây hoặc <span className="text-brand-green underline">chọn tệp từ máy tính</span>
                </div>
                <p className="text-[11px] text-navy/50 mt-1">
                  {uploadHint} Tối đa còn thêm được {max - banners.length} ảnh.
                </p>
              </div>
            )}

            {/* Manual URL toggle */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-brand-green hover:underline font-semibold text-[11px]"
              >
                {showManualInput ? "Ẩn nhập link ảnh thủ công" : "+ Nhập URL ảnh thủ công hoặc đường dẫn tĩnh"}
              </button>
            </div>

            {showManualInput && (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`https://... hoặc ${fallback[0] ?? "/duong-dan-anh.jpg"}`}
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddManualUrl}
                  disabled={busy || !manualUrl.trim()}
                  className="text-xs font-bold shrink-0"
                >
                  <Plus size={13} className="mr-1" />
                  Thêm
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Banner List Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-navy/80 uppercase tracking-wider">
              Danh sách hiển thị ({banners.length} ảnh)
            </span>
            <span className="text-[11px] text-navy/50">
              Thứ tự từ trái qua phải tương ứng với thứ tự hiển thị
            </span>
          </div>

          {banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-[#FAF9F5] p-8 text-center text-xs text-navy/55">
              {emptyHint ?? "Chưa có ảnh nào."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {banners.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative rounded-2xl border border-gray-light/80 bg-[#FAF9F5] p-2.5 overflow-hidden shadow-xs hover:border-brand-green/60 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image preview */}
                  <div className={`relative ${previewAspectClass} w-full rounded-xl overflow-hidden bg-white border border-gray-200`}>
                    <Image
                      src={url}
                      alt={`Ảnh ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-navy/85 text-white backdrop-blur-xs">
                      #{index + 1}
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-green text-white shadow-xs">
                        Bắt đầu
                      </div>
                    )}
                  </div>

                  {/* Path / link */}
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[11px] font-mono text-navy/60 truncate max-w-[150px]" title={url}>
                      {url.split("/").pop()}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy/40 hover:text-navy text-[11px] inline-flex items-center gap-0.5"
                      title="Mở ảnh gốc"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  {/* Control toolbar */}
                  <div className="mt-2.5 pt-2 border-t border-gray-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMove(index, "left")}
                        disabled={busy || index === 0}
                        className="h-7 w-7 p-0 text-navy/70 hover:text-navy disabled:opacity-30"
                        title="Chuyển sang trước"
                      >
                        <ArrowLeft size={13} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMove(index, "right")}
                        disabled={busy || index === banners.length - 1}
                        className="h-7 w-7 p-0 text-navy/70 hover:text-navy disabled:opacity-30"
                        title="Chuyển ra sau"
                      >
                        <ArrowRight size={13} />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      disabled={busy || banners.length <= min}
                      className="h-7 px-2 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tip alert */}
        <div className="rounded-2xl bg-brand-green/5 border border-brand-green/20 p-4 flex items-start gap-3">
          <ImageIcon className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
          <div className="text-xs text-navy/70 space-y-1">
            <p className="font-bold text-navy">{tipTitle}</p>
            <div>{tipBody}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
