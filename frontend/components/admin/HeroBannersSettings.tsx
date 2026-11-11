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
import type { StoreSettings } from "@/lib/types/store-settings";

const MIN_BANNERS = 1;
const MAX_BANNERS = 10;
const RECOMMENDED_MIN = 5;

export default function HeroBannersSettings() {
  const [banners, setBanners] = useState<string[]>([]);
  const [initialBanners, setInitialBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
        if (!res.ok) throw new Error(data.message || "Không thể tải danh sách banner");

        const settings: StoreSettings = data.settings || {};
        const list =
          Array.isArray(settings.heroBanners) && settings.heroBanners.length > 0
            ? settings.heroBanners
            : ["/parner.jpg"];

        setBanners(list);
        setInitialBanners(list);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Lỗi khi tải danh sách banner");
          setBanners(["/parner.jpg"]);
          setInitialBanners(["/parner.jpg"]);
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
  }, []);

  const saveBannersDirectly = async (list: string[]) => {
    if (list.length < MIN_BANNERS || list.length > MAX_BANNERS) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroBanners: list }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lưu danh sách banner");
      setInitialBanners(list);
      toast.success("Đã tự động đồng bộ banner hero!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu banner");
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

    const remainingSlots = MAX_BANNERS - banners.length;
    if (remainingSlots <= 0) {
      toast.error(`Đã đạt tối đa ${MAX_BANNERS} ảnh banner`);
      return;
    }

    const filesToUpload = fileArray.slice(0, remainingSlots);
    if (fileArray.length > remainingSlots) {
      toast.info(`Chỉ có thể thêm ${remainingSlots} ảnh nữa (tối đa ${MAX_BANNERS} ảnh)`);
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: filesToUpload.length });
    const newUrls: string[] = [];
    let failedCount = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadProgress({ current: i + 1, total: filesToUpload.length });

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "banners");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Tải ảnh thất bại");

        const uploadedUrl = data.data?.url || data.url;
        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    if (newUrls.length > 0) {
      const updated = [...banners, ...newUrls].slice(0, MAX_BANNERS);
      setBanners(updated);
      toast.success(`Đã tải lên ${newUrls.length} ảnh banner thành công!`);
      void saveBannersDirectly(updated);
    }

    if (failedCount > 0) {
      toast.error(`Có ${failedCount} ảnh tải lên thất bại`);
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleAddManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) return;

    if (banners.length >= MAX_BANNERS) {
      toast.error(`Đã đạt tối đa ${MAX_BANNERS} ảnh banner`);
      return;
    }

    const updated = [...banners, url];
    setBanners(updated);
    setManualUrl("");
    setShowManualInput(false);
    toast.success("Đã thêm URL ảnh banner");
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
    if (banners.length <= MIN_BANNERS) {
      toast.error(`Cần tối thiểu ${MIN_BANNERS} ảnh banner trên trang chủ`);
      return;
    }

    const updated = banners.filter((_, i) => i !== index);
    setBanners(updated);
    toast.info("Đã xóa ảnh khỏi danh sách");
    void saveBannersDirectly(updated);
  };

  const handleSave = async () => {
    if (banners.length < MIN_BANNERS) {
      toast.error(`Cần tối thiểu ${MIN_BANNERS} ảnh banner`);
      return;
    }

    if (banners.length > MAX_BANNERS) {
      toast.error(`Tối đa ${MAX_BANNERS} ảnh banner`);
      return;
    }

    await saveBannersDirectly(banners);
  };

  const isDirty = JSON.stringify(banners) !== JSON.stringify(initialBanners);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border border-gray-light/80 p-12 text-center shadow-xs">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-green" />
        <p className="mt-3 text-xs font-bold text-navy/60">Đang tải cấu hình banner hero...</p>
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
                <h2 className="text-sm font-extrabold text-navy">
                  Ảnh bìa Hero Trang chủ (Auto Scroll)
                </h2>
                <Badge
                  variant="outline"
                  className={
                    banners.length >= RECOMMENDED_MIN
                      ? "bg-brand-green/10 text-brand-green border-brand-green/30 font-bold text-[11px]"
                      : "bg-amber-50 text-amber-700 border-amber-300 font-bold text-[11px]"
                  }
                >
                  {banners.length} / {MAX_BANNERS} ảnh
                </Badge>
              </div>
              <p className="text-xs text-navy/50 mt-0.5">
                Tự động cuộn sang trái sau mỗi 8 giây trên trang chủ. Tối thiểu {MIN_BANNERS} ảnh, tối đa {MAX_BANNERS} ảnh (khuyến nghị {RECOMMENDED_MIN} - {MAX_BANNERS} ảnh).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBanners(initialBanners)}
                disabled={saving}
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
              disabled={saving || !isDirty}
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
                  <span>Lưu banner hero</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Upload Dropzone */}
        {banners.length < MAX_BANNERS && (
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
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    void handleUploadFiles(e.dataTransfer.files);
                  }
                }}
                className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-brand-green bg-[#FAF9F5] hover:bg-[#F2EFE8] p-6 text-center cursor-pointer transition-all group"
              >
                <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-white shadow-xs border border-gray-100 text-brand-green mb-2 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div className="text-xs sm:text-sm font-bold text-navy">
                  Kéo thả ảnh banner vào đây hoặc <span className="text-brand-green underline">chọn tệp từ máy tính</span>
                </div>
                <p className="text-[11px] text-navy/50 mt-1">
                  Có thể chọn nhiều ảnh cùng lúc. Hỗ trợ JPG, PNG, WEBP (tỷ lệ 16:9 hoặc ảnh ngang showroom). Tối đa còn thêm được {MAX_BANNERS - banners.length} ảnh.
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
                  placeholder="https://... hoặc /parner.jpg"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddManualUrl}
                  disabled={!manualUrl.trim()}
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
              Danh sách slide hiển thị ({banners.length} ảnh)
            </span>
            <span className="text-[11px] text-navy/50">
              Thứ tự từ trái qua phải tương ứng với thứ tự cuộn slide
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {banners.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative rounded-2xl border border-gray-light/80 bg-[#FAF9F5] p-2.5 overflow-hidden shadow-xs hover:border-brand-green/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image preview */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white border border-gray-200">
                  <Image
                    src={url}
                    alt={`Banner ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                  {/* Badge position */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-navy/85 text-white backdrop-blur-xs">
                    Slide #{index + 1}
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
                      disabled={index === 0}
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
                      disabled={index === banners.length - 1}
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
                    disabled={banners.length <= MIN_BANNERS}
                    className="h-7 px-2 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip alert */}
        <div className="rounded-2xl bg-brand-green/5 border border-brand-green/20 p-4 flex items-start gap-3">
          <ImageIcon className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
          <div className="text-xs text-navy/70 space-y-1">
            <p className="font-bold text-navy">
              Cơ chế hiển thị trên trang chủ:
            </p>
            <p>
              Ảnh banner sẽ tự động cuộn mượt mà sang trái sau mỗi <strong>8 giây</strong>. Khách truy cập cũng có thể bấm vào các nút chuyển slide hoặc hover chuột để xem chi tiết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
