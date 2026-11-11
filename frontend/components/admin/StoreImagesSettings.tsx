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
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type { StoreSettings } from "@/lib/types/store-settings";

const MIN_IMAGES = 1;
const MAX_IMAGES = 20;
const DEFAULT_STORE_IMAGES = [
  "/store/2.jpg",
  "/store/1.jpg",
  "/store/3.jpg",
  "/store/4.jpg",
];

export default function StoreImagesSettings() {
  const [images, setImages] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.message || "Không thể tải danh sách ảnh showroom");

        const settings: StoreSettings = data.settings || {};
        const list =
          Array.isArray(settings.storeImages) && settings.storeImages.length > 0
            ? settings.storeImages
            : DEFAULT_STORE_IMAGES;

        setImages(list);
        setInitialImages(list);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Lỗi khi tải danh sách ảnh showroom");
          setImages(DEFAULT_STORE_IMAGES);
          setInitialImages(DEFAULT_STORE_IMAGES);
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

  const saveImagesDirectly = async (list: string[]) => {
    if (list.length < MIN_IMAGES || list.length > MAX_IMAGES) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeImages: list }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lưu danh sách ảnh showroom");
      setInitialImages(list);
      toast.success("Đã đồng bộ ảnh showroom & album!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu ảnh showroom");
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

    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      toast.error(`Đã đạt giới hạn tối đa ${MAX_IMAGES} ảnh showroom`);
      return;
    }

    const toUpload = fileArray.slice(0, availableSlots);
    if (toUpload.length < fileArray.length) {
      toast.info(`Chỉ có thể tải thêm ${availableSlots} ảnh để không vượt quá ${MAX_IMAGES} ảnh`);
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: toUpload.length });

    const uploadedUrls: string[] = [];
    let failureCount = 0;

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setUploadProgress({ current: i + 1, total: toUpload.length });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.message || `Lỗi tải tệp ${file.name}`);
        }

        uploadedUrls.push(data.url);
      } catch (err) {
        console.error("Upload error for file:", file.name, err);
        failureCount++;
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (uploadedUrls.length > 0) {
      const newList = [...images, ...uploadedUrls];
      setImages(newList);
      void saveImagesDirectly(newList);
      toast.success(`Đã tải lên thành công ${uploadedUrls.length} ảnh showroom!`);
    }

    if (failureCount > 0) {
      toast.error(`Có ${failureCount} tệp không thể tải lên. Vui lòng thử lại.`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;

    if (images.length >= MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh showroom`);
      return;
    }

    const newList = [...images, trimmed];
    setImages(newList);
    setManualUrl("");
    setShowManualInput(false);
    void saveImagesDirectly(newList);
    toast.success("Đã thêm đường dẫn ảnh showroom!");
  };

  const handleRemove = (index: number) => {
    if (images.length <= MIN_IMAGES) {
      toast.error(`Cần giữ lại tối thiểu ${MIN_IMAGES} ảnh showroom`);
      return;
    }
    const newList = images.filter((_, i) => i !== index);
    setImages(newList);
    if (previewIndex >= newList.length) {
      setPreviewIndex(Math.max(0, newList.length - 1));
    }
    void saveImagesDirectly(newList);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newList = [...images];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setImages(newList);
    if (previewIndex === index) setPreviewIndex(targetIndex);
    else if (previewIndex === targetIndex) setPreviewIndex(index);
    void saveImagesDirectly(newList);
  };

  const handleResetDefaults = () => {
    if (confirm("Khôi phục danh sách ảnh showroom mặc định ban đầu?")) {
      setImages(DEFAULT_STORE_IMAGES);
      setPreviewIndex(0);
      void saveImagesDirectly(DEFAULT_STORE_IMAGES);
    }
  };

  const hasUnsavedChanges = JSON.stringify(images) !== JSON.stringify(initialImages);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-light/60 bg-white p-8">
        <div className="flex flex-col items-center gap-3 text-navy/60">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
          <span className="text-sm font-semibold">Đang tải danh sách ảnh showroom...</span>
        </div>
      </div>
    );
  }

  const featured = images[previewIndex] ?? images[0] ?? "/store/2.jpg";

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-light/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
            <Store size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-navy">
                Ảnh Showroom & Album Cửa Hàng
              </h2>
              <Badge variant="outline" className="border-brand-green/30 bg-brand-green/10 font-bold text-brand-green text-[11px]">
                {images.length} / {MAX_IMAGES} ảnh
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-navy/60 max-w-2xl">
              Quản lý album ảnh thực tế của showroom TA HOUSE trên trang chủ. Khách hàng có thể bấm chuyển xem từng góc chụp trong cửa hàng.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs font-bold text-navy/70 hover:text-navy cursor-pointer"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Khôi phục mặc định
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={saving || !hasUnsavedChanges}
            onClick={() => void saveImagesDirectly(images)}
            className="bg-brand-green text-xs font-bold text-white hover:bg-brand-green/90 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="mr-1.5 animate-spin" />
                Đang lưu...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <CheckCircle2 size={14} className="mr-1.5" />
                Lưu thay đổi
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="mr-1.5" />
                Đã đồng bộ
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Upload & Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Upload Dropzone & Thumbnail Manager */}
        <div className="space-y-6 lg:col-span-7">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                void handleUploadFiles(e.dataTransfer.files);
              }
            }}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-light/90 bg-slate-50/70 p-8 text-center transition-all hover:border-brand-green hover:bg-brand-green/[0.02] cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  void handleUploadFiles(e.target.files);
                }
              }}
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-brand-green" />
                <p className="text-sm font-extrabold text-navy">
                  Đang tải lên {uploadProgress?.current} / {uploadProgress?.total} ảnh...
                </p>
                <p className="text-xs text-navy/50">Vui lòng đợi hệ thống xử lý và lưu vào bộ nhớ CDN</p>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs text-brand-green group-hover:scale-105 transition-transform">
                  <UploadCloud size={28} />
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-navy">
                  Nhấn để chọn ảnh hoặc kéo thả vào đây
                </h3>
                <p className="mt-1 text-xs text-navy/55">
                  Hỗ trợ tải lên nhiều ảnh cùng lúc: JPG, PNG, WEBP (Tối đa {MAX_IMAGES} ảnh)
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-brand-green/10 px-3 py-1 text-[11px] font-bold text-brand-green">
                    Tối đa 20 ảnh
                  </span>
                  <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-bold text-navy/60">
                    Tỉ lệ chuẩn 3:4 hoặc 4:3
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Quick link button to manual URL */}
          <div className="flex items-center justify-between text-xs font-bold text-navy/70 px-1">
            <span>Hoặc nhập đường dẫn ảnh có sẵn:</span>
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-brand-green hover:underline cursor-pointer"
            >
              {showManualInput ? "Đóng nhập URL" : "+ Nhập URL ảnh thủ công"}
            </button>
          </div>

          {showManualInput && (
            <div className="flex gap-2 rounded-2xl border border-gray-light bg-white p-3 shadow-xs">
              <Input
                type="url"
                placeholder="https://example.com/showroom.jpg hoặc /store/1.jpg"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrl();
                  }
                }}
                className="text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddManualUrl}
                className="bg-brand-green text-xs font-bold text-white shrink-0 cursor-pointer"
              >
                <Plus size={14} className="mr-1" />
                Thêm
              </Button>
            </div>
          )}

          {/* Image List */}
          <div className="rounded-3xl border border-gray-light/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-light/60 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-brand-green" />
                <h3 className="text-sm font-extrabold text-navy">
                  Danh sách ảnh showroom ({images.length})
                </h3>
              </div>
              <span className="text-[11px] text-navy/50">
                Ảnh số 1 sẽ làm ảnh chính hiển thị mặc định
              </span>
            </div>

            <div className="space-y-3">
              {images.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  onClick={() => setPreviewIndex(idx)}
                  className={`group flex items-center gap-3.5 rounded-2xl border p-3 transition-all cursor-pointer ${
                    previewIndex === idx
                      ? "border-brand-green bg-brand-green/[0.03] shadow-xs ring-1 ring-brand-green/20"
                      : "border-gray-light/70 bg-white hover:border-gray-light hover:bg-slate-50/50"
                  }`}
                >
                  {/* Order index pill */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      idx === 0
                        ? "bg-brand-green text-white"
                        : "bg-navy/10 text-navy/70"
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Thumbnail image */}
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-light bg-neutral">
                    <Image
                      src={url}
                      alt={`Showroom ảnh ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* URL info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-semibold text-navy">
                      {url}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      {idx === 0 ? (
                        <span className="font-extrabold uppercase tracking-wider text-brand-green">
                          ★ Ảnh chính mặc định
                        </span>
                      ) : (
                        <span className="text-navy/40">Ảnh thumbnail {idx + 1}</span>
                      )}
                      {previewIndex === idx && (
                        <span className="rounded bg-brand-green/10 px-1.5 py-0.5 font-bold text-brand-green">
                          Đang xem trước
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex shrink-0 items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "left")}
                      title="Chuyển lên trước"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-light/80 text-navy/60 transition-colors hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                    </button>

                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, "right")}
                      title="Chuyển về sau"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-light/80 text-navy/60 transition-colors hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      disabled={images.length <= MIN_IMAGES}
                      onClick={() => handleRemove(idx)}
                      title="Xóa ảnh này"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Preview */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-6 rounded-3xl border border-gray-light/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-light/60 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-brand-green" />
                <h3 className="text-sm font-extrabold text-navy">
                  Xem trước khu vực Showroom
                </h3>
              </div>
              <a
                href="/#store"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-brand-green hover:underline"
              >
                Trang chủ #store <ExternalLink size={12} />
              </a>
            </div>

            {/* Featured image mock */}
            <div className="space-y-3">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral shadow-inner border border-gray-light/80">
                <Image
                  key={featured}
                  src={featured}
                  alt="Showroom preview"
                  fill
                  unoptimized
                  className="object-cover object-center"
                />
                <div className="absolute top-3 left-3 rounded-full bg-navy/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                  Ảnh {previewIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails strip */}
              <div className="flex gap-2 overflow-x-auto py-1 invisible-scrollbar">
                {images.map((src, idx) => (
                  <button
                    key={`${src}-thumb-${idx}`}
                    type="button"
                    onClick={() => setPreviewIndex(idx)}
                    className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200 transition-all cursor-pointer ${
                      previewIndex === idx
                        ? "ring-2 ring-brand-green ring-offset-2 ring-offset-white"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-navy/70 space-y-2 border border-gray-light/60">
                <p className="font-extrabold text-navy">💡 Lưu ý hiển thị:</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-navy/60">
                  <li>Ảnh số 1 sẽ xuất hiện to nhất khi người dùng vừa cuộn tới khu vực Showroom.</li>
                  <li>Khách hàng có thể bấm vào từng thumbnail bên dưới để phóng to ảnh tương ứng.</li>
                  <li>Thay đổi được tự động đồng bộ tức thì cho toàn bộ website.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
