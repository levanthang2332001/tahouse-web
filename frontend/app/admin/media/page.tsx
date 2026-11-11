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
  CircleCheck,
  CircleAlert,
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

const MB = 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * MB;
const MAX_VIDEO_BYTES = 50 * MB;
const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov";

/** Thư mục gốc được backend cho phép (backend/src/modules/upload/upload.constants.ts) */
const FOLDER_OPTIONS = [
  { value: "products", label: "products (Sản phẩm)" },
  { value: "jobs", label: "jobs (Công trình lắp đặt)" },
  { value: "brands", label: "brands (Logo hãng)" },
  { value: "banners", label: "banners (Banner hero)" },
  { value: "promo", label: "promo (Banner khuyến mãi)" },
  { value: "store", label: "store (Ảnh cửa hàng)" },
  { value: "avatars", label: "avatars (Ảnh đại diện)" },
  { value: "videos", label: "videos (Video)" },
];
const FILTER_FOLDER_OPTIONS = [
  ...FOLDER_OPTIONS,
  { value: "categories", label: "categories" },
  { value: "documents", label: "documents" },
];

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface UploadResultItem {
  name: string;
  size: number;
  status: UploadStatus;
  message?: string;
}

interface DeleteConflict {
  summary: string;
}

/** Đọc JSON an toàn: phản hồi lỗi có thể là trang HTML (vd. 413 từ proxy) */
async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const raw = await res.text();
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function errorMessage(res: Response, data: Record<string, unknown>, fallback: string): string {
  if (typeof data.message === "string" && data.message) return data.message;
  if (res.status === 413) return "Tệp quá lớn. Ảnh tối đa 15MB, video tối đa 50MB.";
  if (res.status === 401) return "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
  return `${fallback} (lỗi ${res.status})`;
}

/** Kiểm tra nhanh phía trình duyệt; backend vẫn kiểm tra lại bằng magic bytes */
function precheckFile(file: File): string | null {
  if (file.size === 0) return "Tệp rỗng (0 byte)";
  const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
    return "Không hỗ trợ SVG. Chỉ chấp nhận ảnh JPG, PNG, WebP, GIF, AVIF và video MP4, WebM, MOV";
  }
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    return `Tệp quá lớn (${formatFileSize(file.size)}). ${isVideo ? "Video" : "Ảnh"} tối đa ${max / MB}MB`;
  }
  return null;
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
  const [uploadResults, setUploadResults] = useState<UploadResultItem[]>([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConflict, setDeleteConflict] = useState<DeleteConflict | null>(null);

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
        const data = await readJson(res);
        if (ignore) return;

        if (!res.ok) {
          throw new Error(errorMessage(res, data, "Không thể tải danh sách media"));
        }

        // Backend: { success, data: { items, pagination: { total, page, limit, totalPages } } }
        const payload = (data.data ?? data) as {
          items?: MediaItem[];
          pagination?: { total?: number; totalPages?: number };
          total?: number;
        };
        const items = Array.isArray(payload.items) ? payload.items : [];
        const totalCount = Number(payload.pagination?.total ?? payload.total ?? items.length) || 0;
        const pages = Math.max(1, Math.ceil(totalCount / limit));
        // Trang hiện tại không còn dữ liệu (vd. vừa xóa tệp cuối) → lùi về trang cuối cùng có dữ liệu
        if (page > pages) {
          setPage(pages);
          return;
        }
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

  const resetUploadModal = () => {
    setUploadModalOpen(false);
    setUploadFiles([]);
    setUploadResults([]);
  };

  const handleSelectFiles = (files: File[]) => {
    setUploadFiles(files);
    setUploadResults([]);
  };

  /** Tải từng tệp một (mỗi request 1 tệp) để có kết quả riêng cho từng tệp và tránh vượt giới hạn dung lượng */
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tệp tin để tải lên");
      return;
    }

    const files = [...uploadFiles];
    const results: UploadResultItem[] = files.map((f) => ({ name: f.name, size: f.size, status: "pending" }));
    const update = (i: number, patch: Partial<UploadResultItem>) => {
      results[i] = { ...results[i], ...patch };
      setUploadResults([...results]);
    };
    setUploadResults([...results]);
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const precheck = precheckFile(file);
      if (precheck) {
        update(i, { status: "error", message: precheck });
        continue;
      }

      update(i, { status: "uploading" });
      try {
        const fd = new FormData();
        fd.append("file", file);
        if (uploadFolder) fd.append("folder", uploadFolder);
        if (uploadBrand.trim()) fd.append("brand", uploadBrand.trim());
        if (uploadProductCode.trim()) fd.append("productCode", uploadProductCode.trim());

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await readJson(res);
        const url = (data.data as { url?: string } | undefined)?.url ?? (data.url as string | undefined);
        if (!res.ok) {
          update(i, { status: "error", message: errorMessage(res, data, "Tải lên thất bại") });
        } else if (!url) {
          update(i, { status: "error", message: "Máy chủ không trả về đường dẫn tệp" });
        } else {
          update(i, { status: "success" });
        }
      } catch {
        update(i, { status: "error", message: "Không kết nối được máy chủ" });
      }
    }

    setUploading(false);
    fetchMedia();

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.length - succeeded;
    if (failed === 0) {
      toast.success(succeeded === 1 ? "Đã tải lên 1 tệp thành công!" : `Đã tải lên ${succeeded} tệp thành công!`);
      setUploadProductCode("");
      resetUploadModal();
      return;
    }

    // Giữ lại các tệp lỗi để thử lại, không tải lại tệp đã thành công (tránh trùng lặp)
    setUploadFiles(files.filter((_, i) => results[i].status !== "success"));
    if (succeeded === 0) {
      toast.error(
        failed === 1 ? results.find((r) => r.status === "error")?.message ?? "Tải lên thất bại" : `Không tải lên được tệp nào (${failed} tệp lỗi)`,
      );
    } else {
      toast.warning(`Đã tải lên ${succeeded}/${results.length} tệp. ${failed} tệp lỗi, xem chi tiết bên dưới.`);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteModalOpen(false);
    setDeletingItem(null);
    setDeleteConflict(null);
  };

  const handleDeleteMedia = async () => {
    if (!deletingItem) return;
    const targetId = deletingItem.id || deletingItem._id;
    if (!targetId) {
      toast.error("Không xác định được tệp cần xóa");
      return;
    }

    // Đã được cảnh báo tệp đang được dùng và admin chọn "Vẫn xóa"
    const force = deleteConflict !== null;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/upload/${encodeURIComponent(targetId)}${force ? "?force=true" : ""}`,
        { method: "DELETE" },
      );
      const data = await readJson(res);

      if (res.status === 409 && !force) {
        // Tệp đang được sử dụng: hiển thị nơi đang dùng và cho phép "Vẫn xóa"
        setDeleteConflict({ summary: errorMessage(res, data, "Tệp đang được sử dụng") });
        return;
      }

      if (!res.ok) {
        toast.error(errorMessage(res, data, "Không thể xóa tệp"));
        closeDeleteDialog();
        fetchMedia();
        return;
      }

      toast.success(`Đã xóa tệp "${deletingItem.filename}"`);
      closeDeleteDialog();
      fetchMedia();
    } catch {
      toast.error("Không kết nối được máy chủ, tệp chưa bị xóa. Vui lòng thử lại.");
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
              ...FILTER_FOLDER_OPTIONS.map((o) => ({ value: o.value, label: `📁 ${o.value}` })),
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
                onClick={resetUploadModal}
                disabled={uploading}
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
                  accept={ACCEPTED_TYPES}
                  id="media-file-input"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleSelectFiles(Array.from(e.target.files));
                    }
                    e.target.value = "";
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
                    Ảnh JPG, PNG, WebP, GIF, AVIF (tối đa 15MB) · Video MP4, WebM, MOV (tối đa 50MB). Không hỗ trợ SVG
                  </span>
                </label>
              </div>

              {/* Per-file upload results */}
              {uploadResults.length > 0 && (
                <div className="rounded-xl border border-gray-light bg-white p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[11px] font-bold text-navy/70 uppercase">
                    Kết quả: {uploadResults.filter((r) => r.status === "success").length}/{uploadResults.length} tệp thành công
                  </div>
                  {uploadResults.map((r, idx) => (
                    <div key={`${r.name}-${idx}`} className="flex items-start gap-2 text-xs py-1 px-2 rounded-lg bg-slate-50">
                      <span className="mt-0.5 shrink-0">
                        {r.status === "success" ? (
                          <CircleCheck size={13} className="text-brand-green" />
                        ) : r.status === "error" ? (
                          <CircleAlert size={13} className="text-rose-600" />
                        ) : r.status === "uploading" ? (
                          <Loader2 size={13} className="animate-spin text-navy/50" />
                        ) : (
                          <span className="block h-3 w-3 rounded-full border border-navy/30" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-navy" title={r.name}>
                          {r.name}
                        </div>
                        {r.status === "error" && r.message && (
                          <div className="text-[11px] text-rose-600 break-words">{r.message}</div>
                        )}
                      </div>
                      <span className="text-[10px] text-navy/50 shrink-0">{formatFileSize(r.size)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Files List */}
              {uploadFiles.length > 0 && uploadResults.length === 0 && (
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
                    options={FOLDER_OPTIONS}
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
                  onClick={resetUploadModal}
                  disabled={uploading}
                  className="text-xs font-semibold h-9"
                >
                  {uploadResults.length > 0 ? "Đóng" : "Hủy bỏ"}
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
                  ) : uploadResults.some((r) => r.status === "error") ? (
                    <span>Thử lại {uploadFiles.length} tệp lỗi</span>
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
          if (deleting) return;
          if (isOpen) setDeleteModalOpen(true);
          else closeDeleteDialog();
        }}
        title={deleteConflict ? "Tệp đang được sử dụng" : "Xác nhận xóa tệp tin"}
        description={
          deleteConflict
            ? `${deleteConflict.summary}. Nếu vẫn xóa, các vị trí này sẽ hiển thị ảnh lỗi cho đến khi được thay ảnh khác.`
            : `Bạn có chắc chắn muốn xóa vĩnh viễn tệp "${deletingItem?.filename}" khỏi Cloudflare R2 không?`
        }
        confirmText={deleteConflict ? "Vẫn xóa" : "Xác nhận xóa"}
        cancelText="Hủy bỏ"
        loading={deleting}
        onConfirm={handleDeleteMedia}
      />
    </div>
  );
}
