"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Flame,
  Layers,
  FileText,
  Wrench,
  HelpCircle,
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicListInput } from "@/components/admin/DynamicListInput";
import { KeyValueEditor } from "@/components/admin/KeyValueEditor";
import { toast } from "@/components/ui/toast";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";
import { formatProductName } from "@/lib/format-product-name";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Form Fields State
  const [name, setName] = useState(formatProductName(initialData?.name || ""));
  const [id, setId] = useState(initialData?.id || "");
  const [code, setCode] = useState(formatProductName(initialData?.code || ""));
  const [brand, setBrand] = useState(initialData?.brand || "Kassler");
  const [availableBrands, setAvailableBrands] = useState<Array<{ value: string; label: string }>>([
    { value: "Kassler", label: "Kassler" },
    { value: "Bosch", label: "Bosch" },
    { value: "Philips", label: "Philips" },
    { value: "Eurogold", label: "Eurogold" },
    { value: "Karofi", label: "Karofi" },
    { value: "Malloca", label: "Malloca" },
    { value: "Hubert", label: "Hubert" },
    { value: "Hyundai", label: "Hyundai" },
    { value: "Sharp", label: "Sharp" },
    { value: "Fanlight", label: "Fanlight" },
    { value: "Hafele", label: "Hafele" },
    { value: "Kaff", label: "Kaff" },
    { value: "Grob", label: "Grob" },
    { value: "HD Door", label: "HD Door" },
    { value: "GrandX", label: "GrandX" },
    { value: "Nobinox", label: "Nobinox" },
  ]);

  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState("");

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data: Array<{ name: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((b) => ({
            value: b.name,
            label: b.name,
          }));
          setAvailableBrands(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const [category, setCategory] = useState(initialData?.category || "dai-sanh");
  const [categoryName, setCategoryName] = useState(
    initialData?.categoryName || CATEGORY_LABELS[initialData?.category || "dai-sanh"] || "Khóa đại sảnh",
  );
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
  const [subcategoryName, setSubcategoryName] = useState(initialData?.subcategoryName || "");

  // Pricing State
  const [price, setPrice] = useState<string>(
    initialData?.price !== undefined && initialData?.price !== null ? String(initialData.price) : "",
  );
  const [originalPrice, setOriginalPrice] = useState<string>(
    initialData?.originalPrice !== undefined && initialData?.originalPrice !== null
      ? String(initialData.originalPrice)
      : "",
  );
  const [priceRange, setPriceRange] = useState(initialData?.priceRange || "");

  // Media
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [installationPreview, setInstallationPreview] = useState<string[]>(
    initialData?.installation_preview || [],
  );

  // Content & Features
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);

  // Specs & Tech
  const [specs, setSpecs] = useState<Record<string, string>>(initialData?.specs || {});
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || []);
  const [colors, setColors] = useState<string[]>(initialData?.colors || []);
  const [warranty, setWarranty] = useState<number>(initialData?.warranty ?? 24);
  const [warrantyText, setWarrantyText] = useState(initialData?.warrantyText || "Chính hãng 24 tháng");

  // Workflow & FAQ
  const [installationManual, setInstallationManual] = useState<string[]>(
    initialData?.installationManual || [],
  );
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>(
    initialData?.faq || [],
  );

  // Synchronize state if initialData changes during prop update
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData && initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setName(formatProductName(initialData.name || ""));
    setId(initialData.id || "");
    setCode(formatProductName(initialData.code || ""));
    setBrand(initialData.brand || "Kassler");
    setCategory(initialData.category || "dai-sanh");
    setCategoryName(
      initialData.categoryName ||
        CATEGORY_LABELS[initialData.category || "dai-sanh"] ||
        "Khóa đại sảnh",
    );
    setSubcategory(initialData.subcategory || "");
    setSubcategoryName(initialData.subcategoryName || "");
    setPrice(
      initialData.price !== undefined && initialData.price !== null
        ? String(initialData.price)
        : "",
    );
    setOriginalPrice(
      initialData.originalPrice !== undefined &&
        initialData.originalPrice !== null
        ? String(initialData.originalPrice)
        : "",
    );
    setPriceRange(initialData.priceRange || "");
    setImageUrl(initialData.imageUrl || "");
    setImages(initialData.images || []);
    setInstallationPreview(initialData.installation_preview || []);
    setShortDescription(initialData.shortDescription || "");
    setDescription(initialData.description || "");
    setFeatures(initialData.features || []);
    setSpecs(initialData.specs || {});
    setTechnologies(initialData.technologies || []);
    setColors(initialData.colors || []);
    setWarranty(initialData.warranty ?? 24);
    setWarrantyText(initialData.warrantyText || "Chính hãng 24 tháng");
    setInstallationManual(initialData.installationManual || []);
    setFaq(initialData.faq || []);
  }

  // Calculations for live discount feedback
  const numPrice = Number(price) || 0;
  const numOrigPrice = Number(originalPrice) || 0;
  const hasDiscount = numOrigPrice > numPrice && numPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
    : 0;
  const savedAmount = hasDiscount ? numOrigPrice - numPrice : 0;

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaq([...faq, { question: "", answer: "" }]);
  };
  const handleUpdateFaq = (index: number, key: "question" | "answer", val: string) => {
    const next = [...faq];
    next[index][key] = val;
    setFaq(next);
  };
  const handleRemoveFaq = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formatProductName(name.trim());
    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Vui lòng nhập tên sản phẩm hợp lệ (tối thiểu 2 ký tự)");
      setActiveTab("general");
      return;
    }

    const cleanId = (id.trim() || slugify(trimmedName)).toLowerCase();
    if (!cleanId) {
      toast.error("Mã ID / Slug không được để trống");
      setActiveTab("general");
      return;
    }

    if (!brand.trim()) {
      toast.error("Vui lòng chọn hoặc nhập tên thương hiệu");
      setActiveTab("general");
      return;
    }

    if (!category.trim()) {
      toast.error("Vui lòng chọn danh mục chính");
      setActiveTab("general");
      return;
    }

    // Price validation
    let parsedPrice: number | null = null;
    if (price.trim()) {
      const p = Number(price);
      if (isNaN(p) || p < 0) {
        toast.error("Giá bán phải là số hợp lệ không âm");
        setActiveTab("pricing");
        return;
      }
      parsedPrice = p;
    }

    let parsedOrigPrice: number | undefined = undefined;
    if (originalPrice.trim()) {
      const op = Number(originalPrice);
      if (isNaN(op) || op < 0) {
        toast.error("Giá gốc phải là số hợp lệ không âm");
        setActiveTab("pricing");
        return;
      }
      parsedOrigPrice = op;
    }

    if (parsedOrigPrice && parsedPrice && parsedOrigPrice < parsedPrice) {
      toast.warning("Lưu ý: Giá gốc đang nhỏ hơn giá bán ưu đãi");
    }

    setSubmitting(true);

    const cleanSpecs = Object.fromEntries(
      Object.entries(specs).filter(
        ([k, v]) => typeof k === "string" && k.trim() && typeof v === "string" && v.trim(),
      ),
    );

    const cleanFaq = faq
      .filter((f) => f.question.trim() || f.answer.trim())
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));

    const payload: Partial<Product> = {
      id: cleanId,
      code: formatProductName(code.trim() || cleanId.toUpperCase().slice(0, 8)),
      name: trimmedName,
      brand: brand.trim(),
      brandSlug: slugify(brand),
      category: category.trim(),
      categoryName: categoryName.trim() || CATEGORY_LABELS[category] || category,
      subcategory: subcategory.trim() || undefined,
      subcategoryName: subcategoryName.trim() || undefined,
      imageUrl: imageUrl.trim() || "/images/placeholder-product.png",
      price: parsedPrice,
      originalPrice: parsedOrigPrice,
      priceRange:
        priceRange.trim() ||
        (parsedPrice !== null ? `${new Intl.NumberFormat("vi-VN").format(parsedPrice)} đ` : "Liên hệ"),
      features: features.map((f) => f.trim()).filter(Boolean),
      has_variants: false,
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      images: images.map((img) => img.trim()).filter(Boolean),
      specs: cleanSpecs,
      technologies: technologies.map((t) => t.trim()).filter(Boolean),
      warranty: Number(warranty) >= 0 ? Number(warranty) : 24,
      warrantyText: warrantyText.trim() || "Chính hãng 24 tháng",
      colors: colors.map((c) => c.trim()).filter(Boolean),
      installationManual: installationManual.map((m) => m.trim()).filter(Boolean),
      faq: cleanFaq,
      installation_preview: installationPreview.map((p) => p.trim()).filter(Boolean),
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${encodeURIComponent(initialData?.id || id)}`
        : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Lỗi khi lưu sản phẩm");
        return;
      }

      toast.success(
        isEditing
          ? `Đã cập nhật sản phẩm: ${payload.name}`
          : `Đã tạo mới sản phẩm: ${payload.name}`,
      );

      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  const categorySelectOptions = Object.entries(CATEGORY_LABELS).map(([slug, lbl]) => ({
    value: slug,
    label: lbl,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-light/70 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 text-navy"
            >
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-navy tracking-tight">
              {isEditing ? `Chỉnh sửa: ${initialData?.name || name}` : "Thêm Sản Phẩm Mới"}
            </h1>
            <p className="text-xs text-navy/50 font-mono">
              {id ? `ID: ${id}` : "Nhập tên để tự tạo ID"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <Link href={`/product/${id}`} target="_blank">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="text-xs font-semibold text-navy"
              >
                <ExternalLink size={14} />
                <span>Xem trên web</span>
              </Button>
            </Link>
          )}

          <Button
            type="submit"
            variant="brand"
            size="default"
            disabled={submitting}
            className="text-xs font-bold gap-1.5 shadow-xs"
          >
            <Save size={15} />
            <span>{submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs Form Structure */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="general" className="gap-1.5">
            <Layers size={14} /> Thông tin chung
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5">
            <DollarSign size={14} /> Giá & Khuyến mãi
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5">
            <ImageIcon size={14} /> Hình ảnh & Media
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5">
            <FileText size={14} /> Mô tả & Điểm nổi bật
          </TabsTrigger>
          <TabsTrigger value="specs" className="gap-1.5">
            <Wrench size={14} /> Thông số & Kỹ thuật
          </TabsTrigger>
          <TabsTrigger value="extra" className="gap-1.5">
            <HelpCircle size={14} /> Lắp đặt & FAQ
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN CHUNG */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Tên hiển thị, mã model, phân loại danh mục và thương hiệu sản phẩm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-navy">
                    Tên sản phẩm <span className="text-rose-600">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: Khóa Điện Tử Kassler KL-600 Face ID Cao Cấp"
                    value={name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setName(newName);
                      if (!isEditing && newName.trim()) {
                        setId(slugify(newName));
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">
                    Mã Model / Mã SP (Code) <span className="text-rose-600">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: KL-600"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">
                    ID / Slug đường dẫn URL <span className="text-rose-600">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: khoa-kassler-kl-600"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={isEditing}
                    className={isEditing ? "bg-gray-100 font-mono text-xs cursor-not-allowed" : "font-mono text-xs"}
                  />
                  {isEditing && (
                    <span className="text-[10px] text-navy/40">ID cố định khi chỉnh sửa để bảo toàn liên kết SEO.</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy">Thương hiệu (Brand)</label>
                    <Link
                      href="/admin/brands"
                      target="_blank"
                      className="text-[11px] text-brand-green font-bold hover:underline inline-flex items-center gap-1"
                      title="Mở trang Quản lý thương hiệu để xem hoặc đổi logo"
                    >
                      <span>Quản lý logo</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>

                  {!isCustomBrand ? (
                    <Select
                      value={brand}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomBrand(true);
                          setCustomBrandName("");
                        } else {
                          setBrand(e.target.value);
                        }
                      }}
                      className="text-xs font-semibold"
                      options={[
                        ...availableBrands,
                        { value: "__custom__", label: "➕ Nhập thương hiệu mới khác..." },
                      ]}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Nhập tên thương hiệu mới..."
                          value={customBrandName}
                          onChange={(e) => {
                            setCustomBrandName(e.target.value);
                            setBrand(e.target.value);
                          }}
                          className="text-xs font-semibold"
                          autoFocus
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCustomBrand(false);
                            setBrand(availableBrands[0]?.value || "Kassler");
                          }}
                          className="text-xs whitespace-nowrap h-10 px-3 shrink-0"
                        >
                          Chọn từ danh sách
                        </Button>
                      </div>
                      <p className="text-[10px] text-brand-green font-medium">
                        Thương hiệu mới này sẽ được tự động ghi nhận vào hệ thống khi tạo sản phẩm.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">Danh mục chính (Category)</label>
                  <Select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      if (CATEGORY_LABELS[newCat]) {
                        setCategoryName(CATEGORY_LABELS[newCat]);
                      }
                    }}
                    options={categorySelectOptions}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">Tên hiển thị danh mục</label>
                  <Input
                    type="text"
                    placeholder="VD: Khóa đại sảnh"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">Danh mục phụ (Subcategory slug)</label>
                  <Input
                    type="text"
                    placeholder="VD: cua-go hoặc ket-mini (tùy chọn)"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GIÁ & KHUYẾN MÃI */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Giá & Khuyến mãi</CardTitle>
              <CardDescription>
                Thiết lập giá bán ưu đãi và giá gốc niêm yết. Hệ thống sẽ tự động tính phần trăm giảm giá và hiển thị số tiền tiết kiệm trên giao diện.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                      <Flame size={14} className="text-rose-600" /> Giá bán ưu đãi (VND)
                    </label>
                    {numPrice > 0 && (
                      <span className="text-xs font-black text-rose-600">
                        {new Intl.NumberFormat("vi-VN").format(numPrice)} đ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 14.500.000"
                      value={price ? new Intl.NumberFormat("vi-VN").format(Number(price.replace(/\D/g, ""))) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPrice(raw);
                      }}
                      className="pr-12 text-sm font-bold text-navy"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/40">
                      VNĐ
                    </span>
                  </div>
                  {numPrice > 0 ? (
                    <div className="rounded-lg bg-rose-50 border border-rose-200/60 px-2.5 py-1.5 text-xs font-bold text-rose-700 flex items-center justify-between">
                      <span>Số tiền hiển thị:</span>
                      <span className="text-sm font-black">{new Intl.NumberFormat("vi-VN").format(numPrice)} đ</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-navy/50">
                      Giá thực tế bán cho khách hàng (VD: 14.500.000 đ).
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy">
                      Giá gốc niêm yết (VND)
                    </label>
                    {numOrigPrice > 0 && (
                      <span className="text-xs font-bold text-zinc-500 line-through">
                        {new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 18.000.000"
                      value={originalPrice ? new Intl.NumberFormat("vi-VN").format(Number(originalPrice.replace(/\D/g, ""))) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setOriginalPrice(raw);
                      }}
                      className="pr-12 text-sm font-bold text-navy"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/40">
                      VNĐ
                    </span>
                  </div>

                  {numPrice > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-navy/50 uppercase">Gợi ý giá gốc:</span>
                      {[10, 15, 20, 25, 30].map((pct) => {
                        const calcOrig = Math.round((numPrice * (1 + pct / 100)) / 10000) * 10000;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setOriginalPrice(String(calcOrig))}
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-[#FAF9F5] hover:bg-brand-green/15 hover:text-brand-green border border-gray-light text-navy/70 transition-colors cursor-pointer"
                            title={`Đặt giá gốc cao hơn ${pct}%: ${new Intl.NumberFormat("vi-VN").format(calcOrig)} đ`}
                          >
                            +{pct}%
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {numOrigPrice > 0 ? (
                    <div className="rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-navy/70 flex items-center justify-between">
                      <span>Giá niêm yết:</span>
                      <span className="text-xs font-bold text-zinc-500 line-through">{new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-navy/50">
                      Giá niêm yết gạch ngang để hiển thị ưu đãi giảm giá (VD: 18.000.000 đ).
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-navy">
                    Text khoảng giá hiển thị (Price Range)
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: 14.500.000 đ hoặc Liên hệ báo giá"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  />
                  <span className="text-[11px] text-navy/50">
                    Nếu để trống, hệ thống sẽ tự động định dạng từ giá bán ưu đãi.
                  </span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl bg-[#FAF9F5] border border-gray-light/80 p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-navy/60 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brand-green" /> Xem trước hiển thị giá trên website:
                </div>
                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <span className="text-2xl font-black text-rose-600">
                    {numPrice > 0 ? `${new Intl.NumberFormat("vi-VN").format(numPrice)} đ` : (priceRange || "Liên hệ")}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-black text-white">
                        -{discountPercent}%
                      </span>
                      <span className="text-xs text-zinc-400 line-through font-semibold">
                        {new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ
                      </span>
                      <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-700">
                        Tiết kiệm {new Intl.NumberFormat("vi-VN").format(savedAmount)} đ
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: HÌNH ẢNH & MEDIA */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh & Album sản phẩm</CardTitle>
              <CardDescription>
                Cung cấp đường dẫn hình ảnh đại diện, album chi tiết và ảnh chụp thực tế tại công trình.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy">
                  Ảnh đại diện chính (Primary Image URL) <span className="text-rose-600">*</span>
                </label>
                <div className="flex gap-4 items-start">
                  <Input
                    type="text"
                    placeholder="VD: https://... hoặc /images/products/kl-600.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-light bg-[#FAF9F5] flex items-center justify-center">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-[10px] text-navy/40 font-bold">No Image</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <DynamicListInput
                label="Album ảnh chi tiết (Gallery Images)"
                description="Nhập URL các hình ảnh chi tiết của sản phẩm và nhấn Thêm."
                placeholder="https://... hoặc /images/products/kl-600-angle.png"
                items={images}
                onChange={setImages}
                addButtonText="Thêm ảnh"
              />

              {/* Gallery Preview Strip */}
              {images.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold text-navy/60 uppercase tracking-wider">
                    Xem trước Album ({images.length} ảnh):
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-light bg-[#FAF9F5]"
                      >
                        <Image
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Installation Preview Gallery */}
              <div className="pt-4 border-t border-gray-light/60">
                <DynamicListInput
                  label="Ảnh lắp đặt thực tế công trình (Installation Preview)"
                  description="Album ảnh thực tế kỹ thuật viên TA HOUSE thi công tại nhà khách hàng."
                  placeholder="https://... hoặc /images/jobs/kl-600-real.jpg"
                  items={installationPreview}
                  onChange={setInstallationPreview}
                  addButtonText="Thêm ảnh thi công"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: MÔ TẢ & ĐIỂM NỔI BẬT */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung & Điểm nổi bật</CardTitle>
              <CardDescription>
                Mô tả ngắn, bài viết chi tiết và danh sách các tính năng nổi bật của sản phẩm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Mô tả ngắn (Short Description)</label>
                <Textarea
                  placeholder="Tóm tắt ngắn gọn 1-2 câu về sản phẩm..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="min-h-[70px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Bài viết mô tả chi tiết (Description)</label>
                <Textarea
                  placeholder="Nội dung giới thiệu chi tiết, công năng, vật liệu và trải nghiệm sản phẩm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[140px]"
                />
              </div>

              <DynamicListInput
                label="Danh sách điểm nổi bật (Features Bullets)"
                description="Các gạch đầu dòng tính năng then chốt (hiển thị trên thẻ sản phẩm và chi tiết)."
                placeholder="VD: Mở khóa bằng Face ID 3D nhận diện khuôn mặt siêu nhạy"
                items={features}
                onChange={setFeatures}
                addButtonText="Thêm đặc điểm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: THÔNG SỐ & KỸ THUẬT */}
        <TabsContent value="specs">
          <Card>
            <CardHeader>
              <CardTitle>Thông số kỹ thuật & Công nghệ</CardTitle>
              <CardDescription>
                Cấu hình thông số kỹ thuật chi tiết theo cặp Key-Value, thẻ công nghệ, màu sắc và thời gian bảo hành.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Value Specs Editor */}
              <KeyValueEditor
                label="Bảng thông số kỹ thuật (Specs Key-Value)"
                description="Thêm các thông số như Xuất xứ, Kích thước, Chất liệu, Công suất, Bảo hành..."
                specs={specs}
                onChange={setSpecs}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-light/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">Bảo hành (Số tháng)</label>
                  <Input
                    type="number"
                    placeholder="VD: 24"
                    value={warranty}
                    onChange={(e) => setWarranty(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy">Ghi chú bảo hành (Warranty Text)</label>
                  <Input
                    type="text"
                    placeholder="VD: Chính hãng 24 tháng, hỗ trợ tận nhà"
                    value={warrantyText}
                    onChange={(e) => setWarrantyText(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DynamicListInput
                  label="Thẻ công nghệ nổi bật (Technologies)"
                  placeholder="VD: Face ID 3D, Chống nước IP65, Kết nối Tuya App"
                  items={technologies}
                  onChange={setTechnologies}
                  addButtonText="Thêm công nghệ"
                />

                <DynamicListInput
                  label="Tùy chọn màu sắc (Colors)"
                  placeholder="VD: Đen Titan, Đồng Cổ, Vàng Champagne"
                  items={colors}
                  onChange={setColors}
                  addButtonText="Thêm màu"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: LẮP ĐẶT & FAQ */}
        <TabsContent value="extra">
          <Card>
            <CardHeader>
              <CardTitle>Quy trình Lắp đặt & Câu hỏi thường gặp</CardTitle>
              <CardDescription>
                Cấu hình các bước lắp đặt tiêu chuẩn và bộ câu hỏi đáp nhanh (FAQ).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DynamicListInput
                label="Các bước quy trình lắp đặt (Installation Manual)"
                description="Các bước kỹ thuật viên thực hiện (Khảo sát, Thi công, Cài đặt, Nghiệm thu)."
                placeholder="VD: Khảo sát thông số đố cửa và độ dày cửa tại công trình..."
                items={installationManual}
                onChange={setInstallationManual}
                addButtonText="Thêm bước"
              />

              {/* FAQ Builder */}
              <div className="space-y-3 pt-4 border-t border-gray-light/60">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-navy">
                      Câu hỏi thường gặp (FAQ Q&A)
                    </label>
                    <p className="text-[11px] text-navy/50">
                      Thêm các câu hỏi và câu trả lời giải đáp thắc mắc cho khách hàng.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddFaq}
                    className="text-xs font-bold"
                  >
                    <Plus size={14} />
                    <span>Thêm câu hỏi</span>
                  </Button>
                </div>

                {faq.length === 0 ? (
                  <div className="text-xs text-navy/40 italic p-3 bg-[#FAF9F5] rounded-xl text-center">
                    Chưa có câu hỏi FAQ nào được cấu hình.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faq.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-gray-light/70 bg-[#FAF9F5] p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-navy uppercase">
                            Câu hỏi #{idx + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFaq(idx)}
                            className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                        <Input
                          type="text"
                          placeholder="Nhập câu hỏi..."
                          value={item.question}
                          onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                          className="bg-white text-xs font-bold"
                        />
                        <Textarea
                          placeholder="Nhập câu trả lời..."
                          value={item.answer}
                          onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                          className="bg-white text-xs min-h-[60px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
