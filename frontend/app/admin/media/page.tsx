"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Video,
  FileText,
  Search,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  X,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/ui/toast";

interface MediaItem {
  id: string;
  _id?: string;
  filename: string;
  url: string;
  key?: string;
  fileType: "image" | "video" | "document" | "audio" | "other";
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  brand?: string;
  category?: string;
  productCode?: string;
  createdAt: string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolder, setUploadFolder] = useState("products");
  const [uploadBrand, setUploadBrand] = useState("");
  const [uploadProductCode, setUploadProductCode] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMedia = useCallback(() => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const sp = new URLSearchParams();
        sp.set("page", String(page));
        sp.set("limit", String(limit));
        if (search.trim()) sp.set("search", search.trim());
        if (folderFilter !== "all") sp.set("folder", folderFilter);
        if (typeFilter !== "all") sp.set("fileType", typeFilter);

        const res = await fetch(`/api/admin/upload?${sp.toString()}`);
        const data = await res.json();
        if (ignore) return;

        if (!res.ok) {
          throw new Error(data.message || "Không thể tải danh sách media");
        }

        const items = data.data?.items || data.items || [];
        const totalCount = data.data?.total ?? data.total ?? items.length;
        setMediaList(items);
        setTotal(totalCount);
      } catch (err) {
        if (!ignore) {
          toast.error(err instanceof Error ? err.message : "Lỗi khi tải danh sách media");
          setMediaList([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [page, limit, search, folderFilter, typeFilter, refreshKey]);

  const copyUrlToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("Đã sao chép liên kết tệp tin!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tệp tin để tải lên");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      if (uploadFiles.length === 1) {
        fd.append("file", uploadFiles[0]);
      } else {
        uploadFiles.forEach((f) => fd.append("files", f));
      }

      if (uploadFolder) fd.append("folder", uploadFolder);
      if (uploadBrand.trim()) fd.append("brand", uploadBrand.trim());
      if (uploadProductCode.trim()) fd.append("productCode", uploadProductCode.trim());

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Tải lên tệp thất bại");
      }

      toast.success(
        uploadFiles.length === 1
          ? "Tải lên tệp tin Cloudflare R2 thành công!"
          : `Đã tải lên ${uploadFiles.length} tệp tin thành công!`,
      );
      setUploadModalOpen(false);
      setUploadFiles([]);
      setUploadProductCode("");
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải tệp lên");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      const targetId = deletingItem.id || deletingItem._id;
      const res = await fetch(`/api/admin/upload/${encodeURIComponent(targetId || "")}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        // Fallback delete by body if id route returns 404/405
        const bodyRes = await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetId, url: deletingItem.url }),
        });
        if (!bodyRes.ok) {
          throw new Error(data.message || "Không thể xóa tệp tin");
        }
      }

      toast.success("Đã xóa tệp tin khỏi hệ thống!");
      setDeleteModalOpen(false);
      setDeletingItem(null);
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xóa tệp tin");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
              Thư viện Media & Lưu trữ R2
            </h1>
            <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 font-bold">
              {total} tệp tin
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-navy/60 mt-1">
            Quản lý tài nguyên hình ảnh, video và tài liệu lưu trữ trực tiếp trên Cloudflare R2
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchMedia()}
            disabled={loading}
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </Button>

          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="text-xs font-bold gap-1.5 h-9 shadow-xs"
          >
            <Upload size={14} />
            <span>Tải tệp lên R2</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-light/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
            <Input
              type="text"
              placeholder="Tìm theo tên file, mã model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8.5 text-xs h-9"
            />
          </div>

          {/* Folder Filter */}
          <Select
            value={folderFilter}
            onChange={(e) => {
              setFolderFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs h-9 w-36"
            options={[
              { value: "all", label: "Tất cả thư mục" },
              { value: "products", label: "📁 products" },
              { value: "brands", label: "📁 brands" },
              { value: "avatars", label: "📁 avatars" },
              { value: "banners", label: "📁 banners" },
              { value: "documents", label: "📁 documents" },
              { value: "videos", label: "📁 videos" },
            ]}
          />

          {/* File Type Filter */}
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs h-9 w-36"
            options={[
              { value: "all", label: "Tất cả định dạng" },
              { value: "image", label: "🖼️ Hình ảnh (Images)" },
              { value: "video", label: "🎥 Video clip" },
              { value: "document", label: "📄 Tài liệu (PDF/Docs)" },
            ]}
          />
        </div>

        <span className="text-xs text-navy/60 whitespace-nowrap">
          Trang {page} / {totalPages} ({total} tệp)
        </span>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="animate-spin text-brand-green" size={28} />
          <span className="text-xs font-semibold text-navy/60">Đang tải tài nguyên Media...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white border border-gray-light/80 text-center p-6">
          <FolderOpen size={40} className="text-navy/20 mb-3" />
          <h3 className="text-sm font-bold text-navy">Chưa có tệp tin nào trong thư viện</h3>
          <p className="text-xs text-navy/60 mt-1 max-w-sm">
            Bấm nút &quot;Tải tệp lên R2&quot; ở trên để bắt đầu lưu trữ hình ảnh sản phẩm và tài nguyên truyền thông.
          </p>
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 text-xs font-bold gap-1.5"
          >
            <Upload size={14} />
            <span>Tải tệp đầu tiên</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {mediaList.map((item) => {
            const isImage = item.fileType === "image" || item.mimeType?.startsWith("image/");
            const isVideo = item.fileType === "video" || item.mimeType?.startsWith("video/");
            const itemId = item.id || item._id || item.filename;

            return (
              <div
                key={itemId}
                className="group relative flex flex-col justify-between rounded-2xl bg-white border border-gray-light/80 shadow-xs hover:shadow-md hover:border-brand-green/40 transition-all overflow-hidden"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square w-full bg-[#FAF9F5] flex items-center justify-center overflow-hidden border-b border-gray-light/50">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <div className="flex flex-col items-center justify-center text-amber-600 gap-1">
                      <Video size={28} />
                      <span className="text-[10px] font-bold">Video Clip</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-blue-600 gap-1">
                      <FileText size={28} />
                      <span className="text-[10px] font-bold">Document</span>
                    </div>
                  )}

                  {/* Folder Tag */}
                  {item.folder && (
                    <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-navy/80 text-white backdrop-blur-xs">
                      {item.folder}
                    </span>
                  )}
                </div>

                {/* Media Info */}
                <div className="p-2.5 space-y-1">
                  <div className="text-[11px] font-bold text-navy truncate" title={item.filename}>
                    {item.filename}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-navy/50 font-medium">
                    <span>{formatFileSize(item.size)}</span>
                    {item.width && item.height && (
                      <span>{item.width}×{item.height}</span>
                    )}
                  </div>
                  {item.brand && (
                    <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-brand-green/10 text-brand-green">
                      {item.brand}
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-2 pt-0 flex items-center justify-between gap-1 border-t border-gray-light/30">
                  <button
                    type="button"
                    onClick={() => copyUrlToClipboard(item.url, itemId)}
                    className="p-1 rounded-md text-navy/60 hover:text-brand-green hover:bg-brand-green/10 transition-colors cursor-pointer"
                    title="Sao chép URL public"
                  >
                    {copiedId === itemId ? (
                      <Check size={13} className="text-brand-green" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-navy/60 hover:text-navy hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Mở xem kích thước gốc"
                  >
                    <ExternalLink size={13} />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setDeletingItem(item);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1 rounded-md text-navy/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa tệp khỏi R2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-xs h-8"
          >
            Trang trước
          </Button>
          <span className="text-xs font-bold text-navy px-3">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-xs h-8"
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* UPLOAD MODAL                                                          */}
      {/* ===================================================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-light max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-light">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-navy">
                    Tải tệp tin lên Cloudflare R2
                  </h3>
                  <p className="text-xs text-navy/50">
                    Lưu trữ phân cấp tự động, tối ưu CDN toàn cầu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-full p-1 text-navy/40 hover:text-navy hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Dropzone */}
              <div className="rounded-2xl border-2 border-dashed border-gray-light p-6 text-center hover:border-brand-green/50 bg-[#FAF9F5] transition-colors">
                <input
                  type="file"
                  multiple
                  id="media-file-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <label
                  htmlFor="media-file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-brand-green border border-gray-light">
                    <Upload size={22} />
                  </div>
                  <div className="text-xs font-bold text-navy">
                    Nhấp để chọn tệp hoặc kéo thả vào đây
                  </div>
                  <span className="text-[11px] text-navy/50">
                    Hỗ trợ Hình ảnh (PNG, JPG, WEBP), Video (MP4, MOV), Tài liệu (PDF)... Tối đa 100MB/tệp
                  </span>
                </label>
              </div>

              {/* Selected Files List */}
              {uploadFiles.length > 0 && (
                <div className="rounded-xl border border-gray-light bg-white p-3 space-y-1.5 max-h-36 overflow-y-auto">
                  <div className="text-[11px] font-bold text-navy/70 uppercase">
                    Đã chọn {uploadFiles.length} tệp tin:
                  </div>
                  {uploadFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50"
                    >
                      <span className="truncate max-w-[70%] font-medium text-navy">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-navy/50">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Destination folder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy">Thư mục lưu trữ (Folder)</label>
                  <Select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="text-xs h-9"
                    options={[
                      { value: "products", label: "products (Sản phẩm)" },
                      { value: "brands", label: "brands (Logo hãng)" },
                      { value: "avatars", label: "avatars (Ảnh đại diện)" },
                      { value: "banners", label: "banners (Quảng cáo)" },
                      { value: "documents", label: "documents (Tài liệu)" },
                      { value: "videos", label: "videos (Video)" },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy">Thương hiệu liên quan (Tùy chọn)</label>
                  <Input
                    type="text"
                    placeholder="VD: kaadas, philips..."
                    value={uploadBrand}
                    onChange={(e) => setUploadBrand(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy">Mã model sản phẩm (Tùy chọn)</label>
                <Input
                  type="text"
                  placeholder="VD: KL-600, S500-5DH..."
                  value={uploadProductCode}
                  onChange={(e) => setUploadProductCode(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="pt-3 border-t border-gray-light flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                  className="text-xs font-semibold h-9"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={uploading || uploadFiles.length === 0}
                  className="text-xs font-bold h-9 gap-1.5"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang tải lên...</span>
                    </>
                  ) : (
                    <span>Bắt đầu tải lên R2</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DELETE CONFIRM DIALOG                                                 */}
      {/* ===================================================================== */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={(isOpen) => {
          setDeleteModalOpen(isOpen);
          if (!isOpen) setDeletingItem(null);
        }}
        title="Xác nhận xóa tệp tin"
        description={`Bạn có chắc chắn muốn xóa vĩnh viễn tệp "${deletingItem?.filename}" khỏi Cloudflare R2 không?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        loading={deleting}
        onConfirm={handleDeleteMedia}
      />
    </div>
  );
}
