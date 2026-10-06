"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  Loader2,
  Plus,
  Star,
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface SingleImageUploaderProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  brand?: string;
  category?: string;
  productCode?: string;
  required?: boolean;
}

/**
 * Ô Upload ảnh đơn lẻ (Ảnh đại diện chính) với giao diện Dropzone rõ ràng,
 * tự động tải lên máy chủ qua /api/admin/upload, KHÔNG hiển thị chuỗi URL.
 */
export function SingleImageUploader({
  label,
  description,
  value,
  onChange,
  brand,
  category,
  productCode,
  required = false,
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, GIF)");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa 15MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "products");
      if (brand) fd.append("brand", brand);
      if (category) fd.append("category", category);
      if (productCode) fd.append("productCode", productCode);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Tải lên ảnh thất bại");
      }

      const uploadedUrl = data.data?.url || data.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success("Tải ảnh đại diện lên máy chủ thành công!");
      } else {
        throw new Error("Không nhận được URL ảnh từ máy chủ");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const handleApplyManualUrl = () => {
    if (manualUrlInput.trim()) {
      onChange(manualUrlInput.trim());
      setManualUrlInput("");
      setShowManualUrl(false);
      toast.success("Đã áp dụng ảnh!");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-navy flex items-center gap-1.5">
            {label}
            {required && <span className="text-rose-600">*</span>}
          </label>
          {description && (
            <p className="text-[11px] text-navy/50">{description}</p>
          )}
        </div>

        {/* Nút nhỏ cho trường hợp hiếm hoi muốn dán URL thủ công */}
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] font-semibold text-navy/50 hover:text-brand-green hover:underline cursor-pointer"
        >
          {showManualUrl ? "Đóng dán URL" : "Dán link ngoài"}
        </button>
      </div>

      {showManualUrl && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
          <input
            type="text"
            placeholder="Dán link ảnh trực tiếp (https://...)"
            value={manualUrlInput}
            onChange={(e) => setManualUrlInput(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
          />
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={handleApplyManualUrl}
            className="text-xs font-bold h-8"
          >
            Áp dụng
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowManualUrl(false)}
            className="text-xs h-8 px-2"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Uploading state */}
      {uploading ? (
        <div className="h-56 rounded-2xl border-2 border-dashed border-brand-green bg-brand-green/5 flex flex-col items-center justify-center gap-3 p-6 text-center animate-pulse">
          <div className="p-3 rounded-full bg-brand-green/20 text-[#2d5a15]">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <div>
            <div className="text-sm font-bold text-navy">Đang tải ảnh lên máy chủ...</div>
            <div className="text-xs text-navy/60 mt-0.5">Vui lòng chờ trong giây lát</div>
          </div>
        </div>
      ) : value ? (
        /* Preview Card khi đã có ảnh */
        <div className="relative rounded-2xl border-2 border-gray-200 bg-[#FAF9F5] p-3 overflow-hidden group hover:border-brand-green/60 transition-all">
          <div className="relative h-60 w-full rounded-xl overflow-hidden bg-white flex items-center justify-center border border-gray-100 shadow-inner">
            <Image
              src={value}
              alt="Ảnh đại diện"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain p-2"
            />
            {/* Tag badge góc trên */}
            <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#2d5a15] text-white shadow-xs">
              <Star size={11} className="fill-white" />
              <span>Ảnh đại diện chính</span>
            </div>
          </div>

          {/* Action Toolbar bên dưới ảnh */}
          <div className="flex items-center justify-between gap-2 pt-3 px-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold gap-1.5 h-8 bg-white"
              >
                <RefreshCw size={12} />
                <span>Thay ảnh khác</span>
              </Button>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy/60 hover:text-navy px-2 py-1"
              >
                <ExternalLink size={12} />
                <span>Xem ảnh gốc</span>
              </a>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 gap-1"
            >
              <Trash2 size={13} />
              <span>Xóa ảnh</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Dropzone Box khi chưa có ảnh */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-56 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none ${
            isDragging
              ? "border-brand-green bg-brand-green/10 scale-[0.99]"
              : "border-gray-300 hover:border-brand-green bg-[#FAF9F5] hover:bg-[#F2EFE8]"
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-gray-100 text-brand-green mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud size={32} />
          </div>
          <div className="text-sm font-bold text-navy">
            Kéo thả ảnh đại diện vào đây, hoặc <span className="text-brand-green underline">chọn tệp từ máy</span>
          </div>
          <p className="text-xs text-navy/50 mt-1 max-w-sm">
            Hỗ trợ PNG, JPG, JPEG, WEBP. Ảnh tự động tải lên Cloudflare R2 máy chủ.
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-gray-200 text-navy shadow-xs">
              <ImageIcon size={12} className="text-brand-green" />
              <span>Khuyên dùng ảnh vuông hoặc nền trắng</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface MultiImageUploaderProps {
  label: string;
  description?: string;
  items: string[];
  onChange: (items: string[]) => void;
  onSetAsPrimary?: (url: string) => void;
  brand?: string;
  category?: string;
  productCode?: string;
  folder?: string;
}

/**
 * Ô Upload nhiều ảnh (Album chi tiết / Ảnh thi công) với giao diện Dropzone chọn nhiều file cùng lúc,
 * grid thumbnail có nút xóa và đặt làm ảnh chính, KHÔNG hiển thị chuỗi URL.
 */
export function MultiImageUploader({
  label,
  description,
  items = [],
  onChange,
  onSetAsPrimary,
  brand,
  category,
  productCode,
  folder = "products",
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      toast.error("Vui lòng chọn các tệp hình ảnh hợp lệ (PNG, JPG, WEBP)");
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });
    const uploadedUrls: string[] = [];
    let failureCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress({ current: i + 1, total: fileArray.length });

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        if (brand) fd.append("brand", brand);
        if (category) fd.append("category", category);
        if (productCode) fd.append("productCode", productCode);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Tải lên thất bại");
        }

        const url = data.data?.url || data.url;
        if (url) {
          uploadedUrls.push(url);
        }
      } catch (err) {
        failureCount++;
        console.error("Upload error for file", file.name, err);
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...items, ...uploadedUrls]);
      if (failureCount === 0) {
        toast.success(`Đã tải lên thành công ${uploadedUrls.length} ảnh!`);
      } else {
        toast.warning(`Đã tải lên ${uploadedUrls.length} ảnh, ${failureCount} ảnh lỗi`);
      }
    } else if (failureCount > 0) {
      toast.error("Lỗi khi tải ảnh lên máy chủ");
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void handleUploadFiles(files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      void handleUploadFiles(files);
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  const handleAddManualUrl = () => {
    if (manualUrlInput.trim()) {
      onChange([...items, manualUrlInput.trim()]);
      setManualUrlInput("");
      setShowManualUrl(false);
      toast.success("Đã thêm ảnh vào danh sách!");
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-navy flex items-center gap-2">
            <span>{label}</span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-brand-green/20 text-[#2d5a15]">
              {items.length} ảnh
            </span>
          </label>
          {description && (
            <p className="text-[11px] text-navy/50">{description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] font-semibold text-navy/50 hover:text-brand-green hover:underline cursor-pointer"
        >
          {showManualUrl ? "Đóng dán link" : "Dán link ảnh ngoài"}
        </button>
      </div>

      {showManualUrl && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
          <input
            type="text"
            placeholder="Dán link ảnh (https://...)"
            value={manualUrlInput}
            onChange={(e) => setManualUrlInput(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
          />
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={handleAddManualUrl}
            className="text-xs font-bold h-8"
          >
            Thêm
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowManualUrl(false)}
            className="text-xs h-8 px-2"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Hidden file input supporting multiple files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dropzone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center select-none ${
          uploading
            ? "border-brand-green bg-brand-green/5 cursor-wait"
            : isDragging
            ? "border-brand-green bg-brand-green/10 scale-[0.99]"
            : "border-gray-300 hover:border-brand-green bg-[#FAF9F5] hover:bg-[#F2EFE8]"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 size={24} className="animate-spin text-brand-green" />
            <div className="text-xs font-bold text-navy">
              Đang tải lên {uploadProgress?.current}/{uploadProgress?.total} ảnh lên Cloudflare R2...
            </div>
            <div className="text-[11px] text-navy/50">Vui lòng không đóng trang trong khi tải</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className="p-2.5 rounded-xl bg-white shadow-xs border border-gray-100 text-brand-green mb-1">
              <UploadCloud size={24} />
            </div>
            <div className="text-xs sm:text-sm font-bold text-navy">
              Kéo thả nhiều ảnh vào đây, hoặc <span className="text-brand-green underline">bấm để chọn tệp</span>
            </div>
            <p className="text-[11px] text-navy/50">
              Có thể chọn cùng lúc nhiều file ảnh (PNG, JPG, WEBP). Server sẽ tự động tối ưu & lưu trữ.
            </p>
          </div>
        )}
      </div>

      {/* Grid danh sách ảnh đã upload */}
      {items.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((url, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-gray-200 bg-white p-1.5 shadow-xs hover:border-brand-green hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative h-28 w-full rounded-lg overflow-hidden bg-[#FAF9F5] flex items-center justify-center">
                  <Image
                    src={url}
                    alt={`Ảnh #${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-contain p-1"
                  />
                  {/* Badge số thứ tự */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                    #{idx + 1}
                  </div>

                  {/* Nút xóa nhanh góc trên phải */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="absolute top-1 right-1 h-6 w-6 rounded-md bg-white/90 hover:bg-rose-600 text-navy/70 hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Footer action buttons */}
                <div className="pt-1.5 flex items-center justify-between gap-1">
                  {onSetAsPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetAsPrimary(url)}
                      className="text-[10px] font-bold text-navy/70 hover:text-brand-green hover:underline inline-flex items-center gap-1 cursor-pointer truncate"
                      title="Đặt ảnh này làm ảnh đại diện chính của sản phẩm"
                    >
                      <Star size={11} className="text-amber-500 shrink-0" />
                      <span>Làm ảnh chính</span>
                    </button>
                  )}

                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-navy/40 hover:text-navy p-1"
                    title="Mở xem ảnh gốc"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}

            {/* Ô vuông "+ Thêm ảnh" cuối grid */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-36 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-green bg-[#FAF9F5] hover:bg-[#F2EFE8] flex flex-col items-center justify-center gap-1.5 text-navy/60 hover:text-navy transition-all cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-brand-green shadow-xs">
                <Plus size={16} />
              </div>
              <span className="text-[11px] font-bold">Thêm ảnh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
