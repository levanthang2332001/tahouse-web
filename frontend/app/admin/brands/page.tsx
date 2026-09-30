"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Package,
  Sparkles,
  AlertCircle,
  X,
  Layers,
  Upload,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/ui/toast";
import { getLocalBrandLogo } from "@/lib/brand-logos";
import type { CustomBrand } from "@/lib/admin/brand-store";

export interface BrandSubcategory {
  name: string;
  slug: string;
}

export interface BrandCategory {
  name: string;
  slug: string;
  subcategories?: BrandSubcategory[];
}

export type BrandItem = CustomBrand & {
  productCount: number;
  categories?: BrandCategory[];
};

function BrandCardLogo({ brand }: { brand: BrandItem }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = (!failed && (brand.logo || getLocalBrandLogo(brand.slug, brand.name))) || "";

  if (logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt={brand.name}
        className="max-h-12 w-auto max-w-[85%] object-contain drop-shadow-xs transition-transform group-hover:scale-105"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-sm font-black text-navy/70 tracking-wide uppercase">
        {brand.name}
      </span>
      <span className="text-[10px] text-navy/40 mt-0.5 font-medium">Chưa có logo</span>
    </div>
  );
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formLogo, setFormLogo] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Category Management Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryBrand, setCategoryBrand] = useState<BrandItem | null>(null);
  const [brandCategories, setBrandCategories] = useState<BrandCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Add Category form inside Category Modal
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [submittingCat, setSubmittingCat] = useState(false);

  // Add Subcategory form inside Category Modal
  const [activeCatForSub, setActiveCatForSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [submittingSub, setSubmittingSub] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchBrands = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/brands");
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.message || `Không thể tải danh sách thương hiệu (${res.status})`;
        setFetchError(errMsg);
        toast.error(errMsg);
        return;
      }
      setBrands(data.items || []);
      if (isRefresh) {
        toast.success(`Đã làm mới danh sách (${data.items?.length || 0} thương hiệu)`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Lỗi khi tải danh sách thương hiệu";
      setFetchError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/admin/brands");
        const data = await res.json();
        if (ignore) return;
        if (!res.ok) {
          const errMsg = data.message || `Không thể tải danh sách thương hiệu (${res.status})`;
          setFetchError(errMsg);
          toast.error(errMsg);
          return;
        }
        setBrands(data.items || []);
      } catch (err: unknown) {
        if (ignore) return;
        const errMsg = err instanceof Error ? err.message : "Lỗi khi tải danh sách thương hiệu";
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
  }, [refreshIndex]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormName("");
    setFormSlug("");
    setFormLogo("");
    setFormCountry("Chính hãng");
    setFormDescription("");
    setFormWebsite("");
    setModalOpen(true);
  };

  const openEditModal = (brand: BrandItem) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormLogo(brand.logo || "");
    setFormCountry(brand.country || "Chính hãng");
    setFormDescription(brand.description || "");
    setFormWebsite(brand.website || "");
    setModalOpen(true);
  };

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "brands");
      if (formSlug || formName) fd.append("brand", formSlug || formName);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải ảnh logo thất bại");
      const uploadedUrl = data.data?.url;
      if (uploadedUrl) {
        setFormLogo(uploadedUrl);
        toast.success("Tải logo lên Cloudflare R2 thành công!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<CustomBrand> = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        logo: formLogo.trim(),
        country: formCountry.trim(),
        description: formDescription.trim(),
        website: formWebsite.trim(),
      };

      const url = editingBrand
        ? `/api/admin/brands/${editingBrand.slug}`
        : "/api/admin/brands";
      const method = editingBrand ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu");
      }

      toast.success(
        editingBrand
          ? `Đã cập nhật thương hiệu "${formName}"`
          : `Đã thêm thương hiệu "${formName}" thành công`,
      );
      setModalOpen(false);
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi lưu thương hiệu");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingBrand) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${deletingBrand.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Lỗi khi xóa");

      toast.success(`Đã xóa thương hiệu "${deletingBrand.name}"`);
      setDeleteModalOpen(false);
      setDeletingBrand(null);
      fetchBrands();
    } catch {
      toast.error("Không thể xóa thương hiệu");
    } finally {
      setDeleting(false);
    }
  };

  // --- Category & Subcategory Management ---

  const openCategoryModal = async (brand: BrandItem) => {
    setCategoryBrand(brand);
    setCategoryModalOpen(true);
    setLoadingCategories(true);
    setNewCatName("");
    setNewCatSlug("");
    setActiveCatForSub(null);

    try {
      const res = await fetch(`/api/admin/brands/${encodeURIComponent(brand.slug)}`);
      if (res.ok) {
        const fullBrand = await res.json();
        setBrandCategories(fullBrand.categories || []);
      } else {
        setBrandCategories(brand.categories || []);
      }
    } catch {
      setBrandCategories(brand.categories || []);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryBrand || !newCatName.trim()) {
      toast.error("Vui lòng nhập tên danh mục cha");
      return;
    }

    setSubmittingCat(true);
    try {
      const res = await fetch(
        `/api/admin/brands/${encodeURIComponent(categoryBrand.slug)}/categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newCatName.trim(),
            slug: newCatSlug.trim() || undefined,
            subcategories: [],
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể thêm danh mục");

      toast.success(`Đã thêm danh mục "${newCatName}"`);
      setNewCatName("");
      setNewCatSlug("");
      // Refresh category list
      const updatedRes = await fetch(`/api/admin/brands/${encodeURIComponent(categoryBrand.slug)}`);
      if (updatedRes.ok) {
        const updatedBrand = await updatedRes.json();
        setBrandCategories(updatedBrand.categories || []);
      }
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi thêm danh mục");
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (catSlug: string, catName: string) => {
    if (!categoryBrand) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}" không?`)) return;

    try {
      const res = await fetch(
        `/api/admin/brands/${encodeURIComponent(categoryBrand.slug)}/categories/${encodeURIComponent(catSlug)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Không thể xóa danh mục");

      toast.success(`Đã xóa danh mục "${catName}"`);
      setBrandCategories((prev) => prev.filter((c) => c.slug !== catSlug));
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xóa danh mục");
    }
  };

  const handleAddSubcategory = async (catSlug: string) => {
    if (!categoryBrand || !newSubName.trim()) {
      toast.error("Vui lòng nhập tên danh mục con");
      return;
    }

    setSubmittingSub(true);
    try {
      const res = await fetch(
        `/api/admin/brands/${encodeURIComponent(categoryBrand.slug)}/categories/${encodeURIComponent(catSlug)}/subcategories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newSubName.trim(),
            slug: newSubSlug.trim() || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể thêm danh mục con");

      toast.success(`Đã thêm danh mục con "${newSubName}"`);
      setNewSubName("");
      setNewSubSlug("");
      setActiveCatForSub(null);

      // Refresh category list
      const updatedRes = await fetch(`/api/admin/brands/${encodeURIComponent(categoryBrand.slug)}`);
      if (updatedRes.ok) {
        const updatedBrand = await updatedRes.json();
        setBrandCategories(updatedBrand.categories || []);
      }
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi thêm danh mục con");
    } finally {
      setSubmittingSub(false);
    }
  };

  const handleDeleteSubcategory = async (
    catSlug: string,
    subSlug: string,
    subName: string,
  ) => {
    if (!categoryBrand) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục con "${subName}" không?`)) return;

    try {
      const res = await fetch(
        `/api/admin/brands/${encodeURIComponent(categoryBrand.slug)}/categories/${encodeURIComponent(catSlug)}/subcategories/${encodeURIComponent(subSlug)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Không thể xóa danh mục con");

      toast.success(`Đã xóa danh mục con "${subName}"`);
      setBrandCategories((prev) =>
        prev.map((c) =>
          c.slug === catSlug
            ? {
                ...c,
                subcategories: (c.subcategories || []).filter((s) => s.slug !== subSlug),
              }
            : c,
        ),
      );
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xóa danh mục con");
    }
  };

  const filteredBrands = brands.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      (b.country && b.country.toLowerCase().includes(q))
    );
  });

  const totalProducts = brands.reduce((acc, b) => acc + (b.productCount || 0), 0);
  const brandsWithLogo = brands.filter((b) => Boolean(b.logo)).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
              Quản lý Thương hiệu & Danh mục
            </h1>
            <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 font-bold">
              {brands.length} hãng
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-navy/60 mt-1">
            Quản lý thông tin hãng, xuất xứ, logo đối tác và cây phân cấp danh mục sản phẩm (Categories & Subcategories)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchBrands(true)}
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
            onClick={openCreateModal}
            className="text-xs font-bold gap-1.5 h-9 shadow-xs"
          >
            <Plus size={15} />
            <span>Thêm thương hiệu mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-light/80 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
            <Tag size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-navy">{brands.length}</div>
            <div className="text-xs text-navy/60 font-medium">Tổng số thương hiệu</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-light/80 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-[#3b6d1b] font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-navy">{brandsWithLogo} / {brands.length}</div>
            <div className="text-xs text-navy/60 font-medium">Hãng đã có ảnh Logo</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-gray-light/80 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
            <Package size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-navy">{totalProducts.toLocaleString("vi-VN")}</div>
            <div className="text-xs text-navy/60 font-medium">Sản phẩm gắn nhãn thương hiệu</div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-gray-light/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm thương hiệu theo tên, xuất xứ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-navy/60 hidden sm:inline-block pr-2">
          Hiển thị <strong className="text-navy">{filteredBrands.length}</strong> thương hiệu
        </span>
      </div>

      {/* Brands Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="animate-spin text-brand-green" size={28} />
          <span className="text-xs font-semibold text-navy/60">Đang tải danh sách thương hiệu...</span>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-rose-50 border border-rose-100 text-center p-6 max-w-md mx-auto">
          <AlertCircle size={32} className="text-rose-600 mb-2" />
          <h3 className="text-sm font-bold text-rose-800">Không thể tải thương hiệu</h3>
          <p className="text-xs text-rose-600/80 mt-1">{fetchError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchBrands(true)}
            className="mt-4 text-xs font-bold bg-white hover:bg-rose-100 text-rose-700 border-rose-200"
          >
            Thử lại
          </Button>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white border border-gray-light/80 text-center p-6">
          <Tag size={36} className="text-navy/20 mb-2" />
          <h3 className="text-sm font-bold text-navy">Không tìm thấy thương hiệu nào</h3>
          <p className="text-xs text-navy/60 mt-1 max-w-sm">
            Không có kết quả khớp với từ khóa tìm kiếm &quot;{search}&quot;. Bạn có thể tạo thương hiệu mới ngay bây giờ.
          </p>
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={openCreateModal}
            className="mt-4 text-xs font-bold gap-1.5"
          >
            <Plus size={15} />
            <span>Thêm thương hiệu mới</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <div
              key={brand.slug}
              className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white border border-gray-light/80 shadow-xs hover:shadow-md hover:border-brand-green/40 transition-all"
            >
              {/* Logo Area */}
              <div>
                <div className="relative flex items-center justify-center h-20 w-full rounded-xl bg-[#FAF9F5] border border-gray-light/60 p-3 mb-3 overflow-hidden group-hover:bg-white transition-colors">
                  <BrandCardLogo brand={brand} />
                </div>

                {/* Brand Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-navy text-sm truncate" title={brand.name}>
                      {brand.name}
                    </h4>
                    {brand.country && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-navy/5 text-navy/70 border border-navy/10 shrink-0">
                        {brand.country}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-navy/50 font-mono truncate">
                    slug: {brand.slug}
                  </div>
                  {brand.description && (
                    <p className="text-xs text-navy/60 line-clamp-2 pt-1 font-normal">
                      {brand.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 mt-3 border-t border-gray-light/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/admin/products?category=all&brand=${brand.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green hover:underline"
                  >
                    <Package size={13} />
                    <span>{brand.productCount} sản phẩm</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 rounded-lg text-navy/60 hover:text-navy hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Chỉnh sửa thương hiệu & Đổi Logo"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingBrand(brand);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-navy/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa thương hiệu"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Manage Categories Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openCategoryModal(brand)}
                  className="w-full text-xs font-bold gap-1.5 h-8 bg-[#FAF9F5] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition-colors"
                >
                  <Layers size={13} className="text-amber-600" />
                  <span>Cây danh mục & phân loại</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL THÊM / CHỈNH SỬA THƯƠNG HIỆU & LOGO                             */}
      {/* ===================================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-light max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-light">
              <h3 className="text-base font-extrabold text-navy">
                {editingBrand ? `Chỉnh sửa: ${editingBrand.name}` : "Thêm thương hiệu mới"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-navy/40 hover:text-navy hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Tên thương hiệu <span className="text-rose-600">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="VD: Kaadas, Philips, Bosch..."
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingBrand) {
                      setFormSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  className="text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Mã Slug (URL identifier)
                </label>
                <Input
                  type="text"
                  placeholder="kaadas"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="text-xs font-mono"
                  disabled={Boolean(editingBrand)}
                />
              </div>

              {/* Logo Field with direct R2 upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-navy">
                    Ảnh Logo thương hiệu
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-brand-green hover:underline">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadLogo(file);
                          e.target.value = "";
                        }
                      }}
                    />
                    {uploadingLogo ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={12} />
                        <span>Tải ảnh lên R2</span>
                      </>
                    )}
                  </label>
                </div>
                <Input
                  type="text"
                  placeholder="https://... hoặc /brands/ten-hang.png"
                  value={formLogo}
                  onChange={(e) => setFormLogo(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              {/* Logo Preview */}
              {formLogo && (
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-gray-light flex items-center gap-3">
                  <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formLogo}
                      alt="Logo preview"
                      className="h-full w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-navy/70">
                    <span className="font-bold text-navy">Xem trước Logo</span>
                    <p className="text-[10px] text-navy/50">Logo hiển thị sắc nét trên website</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Xuất xứ / Quốc gia
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: Đức, Nhật Bản..."
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Website (Tùy chọn)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://brand.com"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Mô tả ngắn về hãng (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Thông tin giới thiệu ngắn về thương hiệu..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-light p-2.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="text-xs font-semibold h-9"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={saving}
                  className="text-xs font-bold h-9"
                >
                  {saving ? "Đang lưu..." : editingBrand ? "Cập nhật thương hiệu" : "Lưu thương hiệu mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL QUẢN LÝ CÂY DANH MỤC & PHÂN LOẠI CỦA THƯƠNG HIỆU                */}
      {/* ===================================================================== */}
      {categoryModalOpen && categoryBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-light max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-light shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-navy">
                    Cây danh mục hãng: {categoryBrand.name}
                  </h3>
                  <p className="text-xs text-navy/50">
                    Phân cấp danh mục cha & con áp dụng cho bộ lọc sản phẩm của hãng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="rounded-full p-1 text-navy/40 hover:text-navy hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body: Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Form Add New Category */}
              <form
                onSubmit={handleAddCategory}
                className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-gray-light/80 space-y-3"
              >
                <div className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <FolderPlus size={14} className="text-brand-green" />
                  <span>Thêm danh mục cha mới cho {categoryBrand.name}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    type="text"
                    placeholder="Tên danh mục (VD: Khóa Cửa Gỗ)"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
                    }}
                    className="text-xs h-8"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Slug (VD: cua-go)"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="text-xs font-mono h-8"
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    size="sm"
                    disabled={submittingCat}
                    className="text-xs font-bold h-8"
                  >
                    {submittingCat ? "Đang thêm..." : "+ Thêm danh mục"}
                  </Button>
                </div>
              </form>

              {/* Categories Tree List */}
              {loadingCategories ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <RefreshCw className="animate-spin text-brand-green" size={20} />
                  <span className="text-xs text-navy/60">Đang tải cấu trúc danh mục...</span>
                </div>
              ) : brandCategories.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-gray-light text-navy/50 text-xs">
                  Thương hiệu chưa có danh mục nào. Hãy dùng form phía trên để thêm danh mục cha.
                </div>
              ) : (
                <div className="space-y-3">
                  {brandCategories.map((cat) => (
                    <div
                      key={cat.slug}
                      className="rounded-2xl border border-gray-light bg-white p-4 space-y-3 shadow-xs"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-navy">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-mono text-navy/40 px-1.5 py-0.5 rounded bg-gray-100">
                            slug: {cat.slug}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-bold text-amber-700 bg-amber-50">
                            {cat.subcategories?.length || 0} danh mục con
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveCatForSub(activeCatForSub === cat.slug ? null : cat.slug)
                            }
                            className="text-[11px] font-bold text-brand-green hover:underline px-2 py-1 rounded hover:bg-brand-green/10 transition-colors"
                          >
                            + Thêm mục con
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Xóa danh mục cha"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Add Subcategory Inline Form */}
                      {activeCatForSub === cat.slug && (
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="Tên danh mục con (VD: Khóa Vân Tay)"
                            value={newSubName}
                            onChange={(e) => {
                              setNewSubName(e.target.value);
                              setNewSubSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
                            }}
                            className="text-xs h-7 bg-white"
                          />
                          <Input
                            type="text"
                            placeholder="Slug con (VD: van-tay)"
                            value={newSubSlug}
                            onChange={(e) => setNewSubSlug(e.target.value)}
                            className="text-xs font-mono h-7 bg-white w-36"
                          />
                          <Button
                            type="button"
                            variant="brand"
                            size="sm"
                            disabled={submittingSub}
                            onClick={() => handleAddSubcategory(cat.slug)}
                            className="text-xs font-bold h-7 px-3 shrink-0"
                          >
                            {submittingSub ? "Lưu..." : "Lưu"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveCatForSub(null)}
                            className="text-xs h-7 px-2 shrink-0 text-navy/60"
                          >
                            Hủy
                          </Button>
                        </div>
                      )}

                      {/* Subcategories list pills */}
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-light/50">
                          {cat.subcategories.map((sub) => (
                            <span
                              key={sub.slug}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-navy/80"
                            >
                              <span>{sub.name}</span>
                              <span className="text-[9px] text-navy/40 font-mono">({sub.slug})</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteSubcategory(cat.slug, sub.slug, sub.name)
                                }
                                className="text-navy/40 hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                                title="Xóa danh mục con"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-navy/40 italic">
                          Chưa có danh mục con. Bấm &quot;+ Thêm mục con&quot; để tạo.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-light flex items-center justify-end shrink-0">
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => setCategoryModalOpen(false)}
                className="text-xs font-bold"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa thương hiệu */}
      <ConfirmDialog
        open={deleteModalOpen}
        onOpenChange={(isOpen) => {
          setDeleteModalOpen(isOpen);
          if (!isOpen) setDeletingBrand(null);
        }}
        title="Xác nhận xóa thương hiệu"
        description={`Bạn có chắc chắn muốn xóa thương hiệu "${deletingBrand?.name}" khỏi danh sách quản lý không?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
