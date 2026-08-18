"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Table as TableIcon,
  LayoutGrid,
  List,
  AlertCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/ui/toast";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";
import { calculateProductDiscount } from "@/lib/format-price";
import { formatProductName } from "@/lib/format-product-name";
import type { Product } from "@/lib/types/product";

type AdminProductViewMode = "table" | "grid" | "list";

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(16);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<AdminProductViewMode>("table");
  const [stats, setStats] = useState<{
    totalProducts?: number;
    totalBrands?: number;
    totalCategories?: number;
    sectorBreakdown?: Array<{ id: string; name: string; count: number }>;
  } | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Copied product ID feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch error handling
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        category,
        brand: "all",
        sortBy,
      });
      if (isRefresh) {
        params.set("refresh", "true");
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.message || `Lỗi tải danh sách sản phẩm (${res.status})`;
        setFetchError(errMsg);
        toast.error(errMsg);
        return;
      }

      setProducts(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.stats) {
        setStats(data.stats);
      }
      if (isRefresh) {
        toast.success(`Đã làm mới dữ liệu (${data.total} sản phẩm)`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.";
      setFetchError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, sortBy]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: search.trim(),
          category,
          brand: "all",
          sortBy,
        });

        const res = await fetch(`/api/admin/products?${params.toString()}`);
        const data = await res.json();

        if (ignore) return;
        if (!res.ok) {
          const errMsg = data.message || `Lỗi tải danh sách sản phẩm (${res.status})`;
          setFetchError(errMsg);
          toast.error(errMsg);
          return;
        }

        setProducts(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err: unknown) {
        if (ignore) return;
        const errMsg = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.";
        setFetchError(errMsg);
        toast.error(errMsg);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [page, limit, search, category, sortBy, refreshIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setRefreshIndex((prev) => prev + 1);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.info(`Đã sao chép mã ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(deletingProduct.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Xóa sản phẩm thất bại");
        return;
      }
      toast.success(`Đã xóa sản phẩm: ${deletingProduct.name}`);
      setDeleteModalOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch {
      toast.error("Lỗi khi kết nối máy chủ");
    } finally {
      setDeleteLoading(false);
    }
  };

  const SECTOR_PILLS = [
    { id: "all", label: "Tất cả", icon: "✨" },
    { id: "thiet-bi-nha-bep", label: "Bếp & Phụ Kiện", icon: "🍳" },
    { id: "khoa-dien-tu", label: "Khóa Thông Minh", icon: "🚪" },
    { id: "quat-tran-den", label: "Quạt Trần Đèn", icon: "🌀" },
    { id: "ket-sat-thong-minh", label: "Két Sắt", icon: "🛡️" },
    { id: "may-loc-nuoc", label: "Lọc Nước", icon: "💧" },
    { id: "cua-thong-phong", label: "Cửa Thông Phòng", icon: "🚪" },
  ];

  const SECTOR_SUBOPTIONS: Record<string, Array<{ value: string; label: string }>> = {
    all: [
      { value: "all", label: "Tất cả danh mục" },
      { value: "thiet-bi-nha-bep", label: "Bếp & Phụ kiện" },
      { value: "khoa-dien-tu", label: "Khóa thông minh" },
      { value: "quat-tran-den", label: "Quạt trần đèn" },
      { value: "ket-sat-thong-minh", label: "Két sắt an toàn" },
      { value: "may-loc-nuoc", label: "Máy lọc nước" },
      { value: "cua-thong-phong", label: "Cửa thông phòng" },
    ],
    "thiet-bi-nha-bep": [
      { value: "thiet-bi-nha-bep", label: "Tất cả ngành Bếp" },
      { value: "phu-kien-nha-bep", label: "Phụ kiện nhà bếp" },
      { value: "chau-voi-bep", label: "Chậu vòi bếp" },
      { value: "bep-dien-tu", label: "Bếp điện - từ" },
      { value: "bep-tu", label: "Bếp từ" },
      { value: "may-rua-chen", label: "Máy rửa chén" },
      { value: "may-hut-mui", label: "Máy hút mùi" },
      { value: "lo-nuong", label: "Lò nướng & Vi sóng" },
      { value: "bep-gas-am", label: "Bếp gas âm" },
    ],
    "khoa-dien-tu": [
      { value: "khoa-dien-tu", label: "Tất cả khóa thông minh" },
      { value: "dai-sanh", label: "Khóa đại sảnh" },
      { value: "cua-go", label: "Khóa cửa gỗ" },
      { value: "xingfa-sat", label: "Khóa nhôm kính" },
      { value: "cua-cong", label: "Khóa cửa cổng" },
      { value: "khach-san", label: "Khóa khách sạn" },
      { value: "cua-kinh", label: "Khóa cửa kính" },
    ],
    "quat-tran-den": [
      { value: "quat-tran-den", label: "Tất cả quạt trần đèn" },
      { value: "quat-tran-den-hien-dai", label: "Quạt trần hiện đại" },
      { value: "den-op-quat-trang-tri", label: "Đèn ốp quạt" },
      { value: "quat-tran-den-giau-canh", label: "Quạt giấu cánh" },
      { value: "quat-tran-den-trang-tri", label: "Quạt trang trí" },
    ],
    "ket-sat-thong-minh": [
      { value: "ket-sat-thong-minh", label: "Tất cả két sắt" },
      { value: "ket-sat", label: "Két sắt Philips" },
      { value: "Smart", label: "Két sắt thông minh" },
    ],
    "may-loc-nuoc": [
      { value: "may-loc-nuoc", label: "Tất cả máy lọc nước" },
      { value: "may-dien-giai", label: "Điện giải Hydro-ion" },
      { value: "may-nong-lanh", label: "Lọc nước nóng lạnh" },
      { value: "may-de-gam", label: "Lọc nước để gầm" },
      { value: "cay-nuoc", label: "Cây nước nóng lạnh" },
      { value: "may-ro-tu-dung", label: "Máy lọc nước RO" },
    ],
    "cua-thong-phong": [
      { value: "cua-thong-phong", label: "Tất cả cửa thông phòng" },
      { value: "cua-phang", label: "Cửa phẳng" },
      { value: "cua-nep-kim-loai", label: "Cửa nẹp kim loại" },
      { value: "cua-o-kinh", label: "Cửa ô kính" },
      { value: "cua-chi-noi", label: "Cửa chỉ nổi" },
    ],
  };

  // Find active sector or subcategory options
  let currentSectorId = "all";
  if (category !== "all") {
    if (SECTOR_SUBOPTIONS[category]) {
      currentSectorId = category;
    } else {
      for (const [sId, subList] of Object.entries(SECTOR_SUBOPTIONS)) {
        if (subList.some((sub) => sub.value === category)) {
          currentSectorId = sId;
          break;
        }
      }
    }
  }

  const currentOptions = SECTOR_SUBOPTIONS[currentSectorId] || SECTOR_SUBOPTIONS.all;

  return (
    <div className="space-y-4">
      {/* 1. Quick Sector Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {SECTOR_PILLS.map((pill) => {
          const isActive = currentSectorId === pill.id;
          const sectorData = stats?.sectorBreakdown?.find((s) => s.id === pill.id);
          const count = pill.id === "all" ? (stats?.totalProducts || total) : sectorData?.count;

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setCategory(pill.id);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? "bg-navy text-white border-navy shadow-xs scale-100"
                  : "bg-white text-navy/70 border-gray-light/80 hover:bg-[#FAF9F5] hover:text-navy"
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-navy/60"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Search & Filter Header Bar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 border border-gray-light/70 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40"
            />
            <Input
              type="text"
              placeholder="Tìm theo tên, mã model, hãng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </form>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Compact Category Select Dropdown */}
            <div className="w-36 sm:w-44">
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-10 font-bold"
                options={currentOptions}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-32 sm:w-36">
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-10 font-medium"
                options={[
                  { value: "newest", label: "Mới nhất" },
                  { value: "name-asc", label: "Tên (A-Z)" },
                  { value: "price-asc", label: "Giá tăng dần" },
                  { value: "price-desc", label: "Giá giảm dần" },
                ]}
              />
            </div>

            {/* Page Limit */}
            <div className="w-28 sm:w-32">
              <Select
                value={String(limit)}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="text-xs h-10 font-medium"
                options={[
                  { value: "16", label: "16 SP / trang" },
                  { value: "24", label: "24 SP / trang" },
                  { value: "32", label: "32 SP / trang" },
                  { value: "48", label: "48 SP / trang" },
                ]}
              />
            </div>

            {/* View Mode Switcher (Table / Big Grid / List) */}
            <div className="flex items-center rounded-xl bg-[#FAF9F5] border border-gray-light/60 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-navy font-bold shadow-xs border border-gray-light/40"
                    : "text-navy/60 hover:text-navy hover:bg-white/50"
                }`}
                title="Dạng Bảng"
                aria-label="Dạng Bảng"
              >
                <TableIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-navy font-bold shadow-xs border border-gray-light/40"
                    : "text-navy/60 hover:text-navy hover:bg-white/50"
                }`}
                title="Dạng Thẻ Lưới To"
                aria-label="Dạng Thẻ Lưới To"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-navy font-bold shadow-xs border border-gray-light/40"
                    : "text-navy/60 hover:text-navy hover:bg-white/50"
                }`}
                title="Dạng Danh Sách Ngang"
                aria-label="Dạng Danh Sách Ngang"
              >
                <List size={15} />
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fetchProducts(true)}
              title="Tải lại danh sách (Làm mới từ máy chủ)"
              className="h-10 w-10 text-navy"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </Button>

            <Link href="/admin/products/new">
              <Button variant="brand" size="default" className="text-xs font-bold gap-1.5 h-10">
                <Plus size={16} />
                <span>Thêm sản phẩm</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. Active Filters Tags & Total Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-navy/60 pt-2 border-t border-gray-light/40">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Tìm thấy <strong className="text-navy font-bold">{total}</strong> sản phẩm
            </span>

            {/* Active Category Tag */}
            {category !== "all" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-brand-green/15 text-[#3b6d1b] border border-brand-green/30 px-2.5 py-0.5 rounded-full">
                <span>{CATEGORY_LABELS[category] || SECTOR_PILLS.find((s) => s.id === category)?.label || category}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("all");
                    setPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer ml-0.5 text-xs"
                  title="Bỏ lọc danh mục"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Active Search Tag */}
            {search.trim() !== "" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                <span>Từ khóa: &quot;{search}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer ml-0.5 text-xs"
                  title="Bỏ từ khóa tìm kiếm"
                >
                  ✕
                </button>
              </span>
            )}

            {(category !== "all" || search.trim() !== "") && (
              <button
                type="button"
                onClick={() => {
                  setCategory("all");
                  setSearch("");
                  setPage(1);
                }}
                className="text-[11px] font-semibold text-navy/50 hover:text-rose-600 underline cursor-pointer ml-1"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          <span>
            Trang <strong className="text-navy">{page}</strong> / {totalPages}
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: DẠNG BẢNG (TABLE VIEW)                                       */}
      {/* ===================================================================== */}
      {viewMode === "table" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Ảnh</TableHead>
              <TableHead className="w-24">Mã SP</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead className="w-32">Thương hiệu</TableHead>
              <TableHead className="w-36">Danh mục</TableHead>
              <TableHead className="w-40 text-right">Giá bán / Giá gốc</TableHead>
              <TableHead className="w-32 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-xs font-medium text-navy/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
                    <span>Đang tải dữ liệu sản phẩm...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700">
                    <AlertCircle size={20} className="text-rose-600" />
                    <span className="text-xs font-bold">{fetchError}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProducts(true)}
                      className="text-xs font-bold mt-1 bg-white hover:bg-rose-100 text-rose-700 border-rose-200"
                    >
                      Thử lại
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-xs text-navy/60">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Package size={28} className="text-navy/30" />
                    <span className="font-bold text-navy">Không tìm thấy sản phẩm nào</span>
                    <span className="text-[11px] text-navy/50">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</span>
                    {(category !== "all" || search.trim() !== "") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCategory("all");
                          setSearch("");
                          setPage(1);
                        }}
                        className="text-xs font-bold mt-1"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const discount = calculateProductDiscount(
                  p.price,
                  p.originalPrice,
                  p.priceRange,
                  p.id,
                );

                return (
                  <TableRow key={p.id}>
                    {/* Thumbnail */}
                    <TableCell className="p-2.5 text-center">
                      <div className="relative h-12 w-12 mx-auto overflow-hidden rounded-xl border border-gray-light/80 bg-[#FAF9F5]">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-navy/40 font-bold">
                            NO IMG
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Model Code */}
                    <TableCell className="font-mono text-xs font-bold text-navy/70">
                      #{p.code || p.id.slice(0, 6)}
                    </TableCell>

                    {/* Name & ID Slug */}
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="font-bold text-xs text-navy hover:text-brand-green transition-colors line-clamp-1"
                          title={formatProductName(p.name)}
                        >
                          {formatProductName(p.name)}
                        </Link>
                        <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-navy/40 font-mono">
                          <span className="truncate max-w-[200px]">{p.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(p.id)}
                            className="text-navy/40 hover:text-navy cursor-pointer"
                            title="Sao chép ID"
                          >
                            {copiedId === p.id ? (
                              <Check size={11} className="text-brand-green" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    {/* Brand */}
                    <TableCell>
                      {p.brand ? (
                        <Badge variant="secondary" className="text-[10px] font-bold py-0.5 px-2">
                          {p.brand}
                        </Badge>
                      ) : (
                        <span className="text-xs text-navy/40">—</span>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="text-xs font-semibold text-navy/70 line-clamp-1">
                        {CATEGORY_LABELS[p.category] || p.categoryName || p.category}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xs text-rose-600">
                          {discount.formattedCurrentPrice}
                        </span>
                        {discount.hasDiscount && discount.formattedOriginalPrice && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-zinc-400 line-through">
                              {discount.formattedOriginalPrice}
                            </span>
                            <span className="rounded bg-rose-100 text-rose-700 px-1 text-[9px] font-bold">
                              -{discount.discountPercent}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/product/${p.id}`} target="_blank" title="Xem trên web">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-navy/60 hover:text-navy"
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${p.id}/edit`} title="Chỉnh sửa sản phẩm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(p)}
                          title="Xóa sản phẩm"
                          className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: DẠNG THẺ LƯỚI TO (BIG GRID CARDS)                            */}
      {/* ===================================================================== */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl border border-gray-light bg-white p-4 animate-pulse space-y-3"
              >
                <div className="aspect-square bg-gray-100 rounded-xl w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          ) : fetchError ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-center">
              <AlertCircle size={24} className="text-rose-600" />
              <span className="text-xs font-bold">{fetchError}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchProducts(true)}
                className="text-xs font-bold mt-1 bg-white hover:bg-rose-100 text-rose-700 border-rose-200"
              >
                Thử lại
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs font-medium text-navy/50 bg-white rounded-2xl border border-gray-light">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </div>
          ) : (
            products.map((p) => {
              const discount = calculateProductDiscount(
                p.price,
                p.originalPrice,
                p.priceRange,
                p.id,
              );

              return (
                <div
                  key={p.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-light/80 bg-white shadow-xs hover:shadow-md transition-all"
                >
                  {/* Top Image area */}
                  <div className="relative aspect-[1.2] w-full overflow-hidden bg-[#FAF9F5] border-b border-gray-light/50">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-navy/40">
                        NO IMAGE
                      </div>
                    )}

                    {discount.hasDiscount && (
                      <div className="absolute top-2.5 left-2.5 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                        -{discount.discountPercent}%
                      </div>
                    )}

                    {p.brand && (
                      <div className="absolute top-2.5 right-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-navy/80 shadow-xs border border-gray-light/60">
                        {p.brand}
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-navy/40 font-bold mb-1">
                        <span>#{p.code || p.id.slice(0, 6)}</span>
                        <span className="truncate max-w-[120px]">
                          {CATEGORY_LABELS[p.category] || p.categoryName || p.category}
                        </span>
                      </div>

                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-bold text-sm text-navy hover:text-brand-green transition-colors line-clamp-2 leading-snug"
                        title={formatProductName(p.name)}
                      >
                        {formatProductName(p.name)}
                      </Link>
                    </div>

                    {/* Price Box */}
                    <div className="rounded-xl bg-[#FAF9F5] border border-gray-light/60 p-2.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-base font-black text-rose-600">
                          {discount.formattedCurrentPrice}
                        </span>
                        {discount.hasDiscount && discount.formattedOriginalPrice && (
                          <span className="text-[11px] text-zinc-400 line-through font-medium">
                            {discount.formattedOriginalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-gray-light/50 flex items-center justify-between gap-2">
                      <Link href={`/product/${p.id}`} target="_blank" className="flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs font-semibold text-navy/70 gap-1 h-8 px-2"
                        >
                          <ExternalLink size={13} />
                          <span>Xem</span>
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${p.id}/edit`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold gap-1 h-8 px-2 text-navy"
                        >
                          <Edit size={13} />
                          <span>Sửa</span>
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(p)}
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50 shrink-0"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: DẠNG DANH SÁCH NGANG (LIST VIEW)                              */}
      {/* ===================================================================== */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-3.5">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-32 rounded-2xl border border-gray-light bg-white p-4 animate-pulse flex gap-4"
              >
                <div className="w-28 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : fetchError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-center">
              <AlertCircle size={24} className="text-rose-600" />
              <span className="text-xs font-bold">{fetchError}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchProducts(true)}
                className="text-xs font-bold mt-1 bg-white hover:bg-rose-100 text-rose-700 border-rose-200"
              >
                Thử lại
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-xs font-medium text-navy/50 bg-white rounded-2xl border border-gray-light">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </div>
          ) : (
            products.map((p) => {
              const discount = calculateProductDiscount(
                p.price,
                p.originalPrice,
                p.priceRange,
                p.id,
              );

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-gray-light/80 bg-white shadow-xs hover:shadow-md transition-all"
                >
                  {/* Left thumbnail & main information */}
                  <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-light bg-[#FAF9F5]">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-navy/40">
                          NO IMG
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-navy/60">
                          #{p.code || p.id.slice(0, 6)}
                        </span>
                        {p.brand && (
                          <Badge variant="secondary" className="text-[9.5px] font-bold py-0 px-1.5">
                            {p.brand}
                          </Badge>
                        )}
                        <span className="text-[11px] font-semibold text-navy/50">
                          {CATEGORY_LABELS[p.category] || p.categoryName || p.category}
                        </span>
                      </div>

                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-bold text-sm text-navy hover:text-brand-green transition-colors line-clamp-1 block"
                      >
                        {formatProductName(p.name)}
                      </Link>

                      {p.features && p.features.length > 0 && (
                        <p className="text-[11px] text-navy/60 line-clamp-1">
                          • {p.features[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-light/40">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-black text-rose-600">
                        {discount.formattedCurrentPrice}
                      </div>
                      {discount.hasDiscount && discount.formattedOriginalPrice && (
                        <div className="text-xs text-zinc-400 line-through">
                          {discount.formattedOriginalPrice}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link href={`/product/${p.id}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-navy/60 hover:text-navy"
                          title="Xem trên web"
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-bold gap-1 text-navy"
                        >
                          <Edit size={13} />
                          <span>Sửa</span>
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(p)}
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-3 border border-gray-light/70 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-xs font-semibold"
          >
            <ChevronLeft size={14} />
            <span>Trang trước</span>
          </Button>

          <span className="font-bold text-navy">
            Trang {page} / {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-xs font-semibold"
          >
            <span>Trang sau</span>
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${formatProductName(deletingProduct?.name || "")}" (Mã: ${deletingProduct?.code || deletingProduct?.id})? Hành động này sẽ ẩn sản phẩm khỏi hệ thống và website.`}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
