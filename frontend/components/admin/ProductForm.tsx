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
  Percent,
  Calculator,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicListInput } from "@/components/admin/DynamicListInput";
import { KeyValueEditor } from "@/components/admin/KeyValueEditor";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
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
  const [autoSlugSync, setAutoSlugSync] = useState(!isEditing && !initialData?.id);
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

  // Auto-calculated discount percent state
  const initialDiscountPct =
    initialData?.originalPrice && initialData?.price && initialData.originalPrice > initialData.price
      ? String(Math.round(((initialData.originalPrice - initialData.price) / initialData.originalPrice) * 100))
      : "";
  const [discountPercentInput, setDiscountPercentInput] = useState<string>(initialDiscountPct);

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
    if (initialData.originalPrice && initialData.price && initialData.originalPrice > initialData.price) {
      setDiscountPercentInput(
        String(Math.round(((initialData.originalPrice - initialData.price) / initialData.originalPrice) * 100)),
      );
    }
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

  // Live numerical values for discount calculations
  const numPrice = Number(price.replace(/\D/g, "")) || 0;
  const numOrigPrice = Number(originalPrice.replace(/\D/g, "")) || 0;
  const numDiscountPct = Number(discountPercentInput.replace(/\D/g, "")) || 0;
  const hasDiscount = numOrigPrice > numPrice && numPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
    : 0;
  const savedAmount = hasDiscount ? numOrigPrice - numPrice : 0;

  // 1. Handle Original Price Change
  const handleOriginalPriceChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    setOriginalPrice(raw);
    const orig = Number(raw) || 0;

    // If discount % is already set, auto-calculate sale price
    if (numDiscountPct > 0 && orig > 0) {
      const calcSale = Math.round((orig * (1 - numDiscountPct / 100)) / 10000) * 10000;
      setPrice(String(calcSale));
      if (!priceRange || priceRange.includes("đ")) {
        setPriceRange(`${new Intl.NumberFormat("vi-VN").format(calcSale)} đ`);
      }
    } else if (orig > 0 && numPrice > 0 && orig > numPrice) {
      const calcPct = Math.round(((orig - numPrice) / orig) * 100);
      setDiscountPercentInput(String(calcPct));
    }
  };

  // 2. Handle Discount % Input Change
  const handleDiscountPercentChange = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (Number(clean) > 99) clean = "99";
    setDiscountPercentInput(clean);

    const pct = Number(clean) || 0;
    if (numOrigPrice > 0) {
      if (pct > 0) {
        const calcSale = Math.round((numOrigPrice * (1 - pct / 100)) / 10000) * 10000;
        setPrice(String(calcSale));
        if (!priceRange || priceRange.includes("đ")) {
          setPriceRange(`${new Intl.NumberFormat("vi-VN").format(calcSale)} đ`);
        }
      } else {
        setPrice(String(numOrigPrice));
        if (!priceRange || priceRange.includes("đ")) {
          setPriceRange(`${new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ`);
        }
      }
    }
  };

  // 3. Handle Quick Discount Chip Click
  const handleApplyQuickDiscount = (pct: number) => {
    setDiscountPercentInput(String(pct));
    if (numOrigPrice > 0) {
      const calcSale = Math.round((numOrigPrice * (1 - pct / 100)) / 10000) * 10000;
      setPrice(String(calcSale));
      if (!priceRange || priceRange.includes("đ")) {
        setPriceRange(`${new Intl.NumberFormat("vi-VN").format(calcSale)} đ`);
      }
      toast.info(`Đã tự động tính giá sale giảm ${pct}%: ${new Intl.NumberFormat("vi-VN").format(calcSale)} đ`);
    } else {
      toast.warning("Vui lòng nhập Giá gốc trước để hệ thống tự động tính giá sale");
    }
  };

  // 4. Handle Direct Sale Price Change
  const handlePriceChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    setPrice(raw);
    const sale = Number(raw) || 0;

    if (!priceRange || priceRange.includes("đ")) {
      setPriceRange(sale > 0 ? `${new Intl.NumberFormat("vi-VN").format(sale)} đ` : "");
    }

    if (numOrigPrice > 0 && sale > 0 && numOrigPrice > sale) {
      const calcPct = Math.round(((numOrigPrice - sale) / numOrigPrice) * 100);
      setDiscountPercentInput(String(calcPct));
    } else if (sale >= numOrigPrice && numOrigPrice > 0) {
      setDiscountPercentInput("");
    }
  };

  // 5. Handle Quick Markup Click (From Sale Price -> Calculate Original Price)
  const handleApplyQuickMarkup = (pct: number) => {
    if (numPrice > 0) {
      const calcOrig = Math.round((numPrice * (1 + pct / 100)) / 10000) * 10000;
      setOriginalPrice(String(calcOrig));
      const calcPct = Math.round(((calcOrig - numPrice) / calcOrig) * 100);
      setDiscountPercentInput(String(calcPct));
      toast.info(`Đã tính giá gốc (+${pct}%): ${new Intl.NumberFormat("vi-VN").format(calcOrig)} đ`);
    } else {
      toast.warning("Vui lòng nhập Giá bán trước để tạo giá gốc");
    }
  };

  // Form Completeness Calculation
  const completenessItems = [
    { label: "Thông tin cơ bản", done: Boolean(name.trim() && id.trim()) },
    { label: "Giá & Khuyến mãi", done: Boolean(numPrice > 0 || priceRange.trim()) },
    { label: "Ảnh sản phẩm", done: Boolean(imageUrl.trim()) },
    { label: "Mô tả nội dung", done: Boolean(shortDescription.trim() || description.trim()) },
    { label: "Thông số kỹ thuật", done: Boolean(Object.keys(specs).length > 0 || features.length > 0) },
  ];
  const completedCount = completenessItems.filter((item) => item.done).length;
  const completionPercentage = Math.round((completedCount / completenessItems.length) * 100);

  // Tab steps array
  const TAB_STEPS = [
    { id: "general", label: "Thông tin chung", icon: Layers },
    { id: "pricing", label: "Giá & Khuyến mãi", icon: DollarSign },
    { id: "media", label: "Hình ảnh & Media", icon: ImageIcon },
    { id: "content", label: "Mô tả & Tính năng", icon: FileText },
    { id: "specs", label: "Thông số kỹ thuật", icon: Wrench },
    { id: "extra", label: "Lắp đặt & FAQ", icon: HelpCircle },
  ];

  const currentTabIndex = TAB_STEPS.findIndex((t) => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? TAB_STEPS[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < TAB_STEPS.length - 1 ? TAB_STEPS[currentTabIndex + 1] : null;

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
      const p = Number(price.replace(/\D/g, ""));
      if (isNaN(p) || p < 0) {
        toast.error("Giá bán phải là số hợp lệ không âm");
        setActiveTab("pricing");
        return;
      }
      parsedPrice = p;
    }

    let parsedOrigPrice: number | undefined = undefined;
    if (originalPrice.trim()) {
      const op = Number(originalPrice.replace(/\D/g, ""));
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
      {/* 1. Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-light/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 text-navy hover:bg-black/5"
            >
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-navy tracking-tight">
              {isEditing ? `Chỉnh sửa: ${initialData?.name || name}` : "Thêm Sản Phẩm Mới"}
            </h1>
            <p className="text-xs text-navy/50 font-mono">
              {id ? `ID: ${id}` : "Nhập tên sản phẩm để tự động tạo ID chuẩn SEO"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {isEditing && (
            <Link href={`/product/${id}`} target="_blank">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="text-xs font-semibold text-navy h-10"
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
            className="text-xs font-bold gap-1.5 shadow-xs h-10 px-5"
          >
            <Save size={15} />
            <span>{submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Form Completeness Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-light/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy">Độ hoàn thiện thông tin sản phẩm:</span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                completionPercentage === 100
                  ? "bg-brand-green/20 text-[#2d5a15]"
                  : completionPercentage >= 60
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {completionPercentage}%
            </span>
          </div>
          <span className="text-[11px] text-navy/50 font-medium">
            {completedCount}/{completenessItems.length} mục đã hoàn tất
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completionPercentage === 100
                ? "bg-brand-green"
                : completionPercentage >= 60
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${Math.max(completionPercentage, 5)}%` }}
          />
        </div>

        {/* Checklist chips */}
        <div className="flex flex-wrap gap-2 pt-0.5">
          {completenessItems.map((item) => (
            <div
              key={item.label}
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                item.done
                  ? "bg-brand-green/10 text-[#2d5a15] border border-brand-green/20"
                  : "bg-gray-50 text-navy/40 border border-gray-200/60"
              }`}
            >
              <CheckCircle2 size={12} className={item.done ? "text-brand-green" : "text-gray-300"} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto p-1 bg-white border border-gray-light/80 rounded-2xl">
          {TAB_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className="gap-1.5 text-xs font-bold data-[state=active]:bg-brand-green data-[state=active]:text-navy rounded-xl py-2 px-3.5"
              >
                <Icon size={14} />
                <span>{step.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* TAB 1: THÔNG TIN CHUNG */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Tên hiển thị, mã model, phân loại danh mục và thương hiệu sản phẩm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy">
                      Tên sản phẩm <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[11px] text-navy/40">{name.length} ký tự</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="VD: Khóa Điện Tử Kassler KL-600 Face ID Cao Cấp"
                    value={name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setName(newName);
                      if (autoSlugSync && !isEditing && newName.trim()) {
                        setId(slugify(newName));
                      }
                    }}
                    required
                    className="font-semibold"
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
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy">
                      ID / Slug đường dẫn URL <span className="text-rose-600">*</span>
                    </label>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setAutoSlugSync(!autoSlugSync);
                          if (!autoSlugSync && name.trim()) {
                            setId(slugify(name));
                          }
                        }}
                        className="text-[10.5px] font-bold text-brand-green hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {autoSlugSync ? <Lock size={11} /> : <Unlock size={11} />}
                        <span>{autoSlugSync ? "Đang đồng bộ tự động" : "Tự do chỉnh sửa"}</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="VD: khoa-kassler-kl-600"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                        setAutoSlugSync(false);
                      }}
                      disabled={isEditing}
                      className={
                        isEditing
                          ? "bg-gray-100 font-mono text-xs cursor-not-allowed"
                          : "font-mono text-xs"
                      }
                    />
                  </div>
                  {isEditing && (
                    <span className="text-[10px] text-navy/40">
                      ID cố định khi chỉnh sửa để bảo toàn liên kết SEO website.
                    </span>
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
                      <span>Quản lý logo hãng</span>
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

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-gray-light/60 flex items-center justify-between">
                <span className="text-xs text-navy/40 font-medium">Bước 1 / 6: Thông tin cơ bản</span>
                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveTab("pricing")}
                  className="text-xs font-bold gap-1.5"
                >
                  <span>Tiếp tục: Cấu hình giá & Khuyến mãi</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GIÁ & KHUYẾN MÃI (SMART AUTO CALCULATION) */}
        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-brand-green" />
                <CardTitle>Cấu hình Giá & Tính toán Khuyến mãi Tự động</CardTitle>
              </div>
              <CardDescription>
                Nhập giá gốc và % khuyến mãi để hệ thống <strong>tự động tính giá bán ưu đãi</strong>, hoặc nhập giá bán ưu đãi để tự động tính % giảm giá.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* 3-Column Pricing Smart Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-gray-light/80">
                
                {/* 1. Original Price Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-navy flex items-center gap-1.5">
                      <DollarSign size={14} className="text-navy/60" /> 1. Giá gốc niêm yết (VND)
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 18.000.000"
                      value={
                        originalPrice
                          ? new Intl.NumberFormat("vi-VN").format(Number(originalPrice.replace(/\D/g, "")))
                          : ""
                      }
                      onChange={(e) => handleOriginalPriceChange(e.target.value)}
                      className="pr-12 text-sm font-bold text-navy bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/40">
                      VNĐ
                    </span>
                  </div>

                  {/* Quick markup buttons (if sale price already entered) */}
                  {numPrice > 0 && numOrigPrice === 0 && (
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-navy/50">Tạo giá gốc:</span>
                      {[10, 15, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleApplyQuickMarkup(pct)}
                          className="rounded px-1.5 py-0.5 text-[10.5px] font-bold bg-white hover:bg-brand-green/20 hover:text-[#2d5a15] border border-gray-200 text-navy/70 transition-colors cursor-pointer"
                          title={`Tính giá gốc cao hơn ${pct}%`}
                        >
                          +{pct}%
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10.5px] text-navy/50 block">
                    Giá niêm yết ban đầu trước khi áp dụng khuyến mãi.
                  </span>
                </div>

                {/* 2. Discount Percentage Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-brand-green flex items-center gap-1.5">
                      <Percent size={14} /> 2. % Khuyến mãi / Giảm giá
                    </label>
                    {discountPercent > 0 && (
                      <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 20"
                      value={discountPercentInput}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="pr-8 text-sm font-bold text-brand-green bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/40">
                      %
                    </span>
                  </div>

                  {/* Quick discount chips */}
                  <div className="flex items-center gap-1 pt-1 flex-wrap">
                    {[5, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleApplyQuickDiscount(pct)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer border ${
                          numDiscountPct === pct
                            ? "bg-brand-green text-navy border-brand-green font-extrabold"
                            : "bg-white hover:bg-brand-green/15 hover:text-brand-green border-gray-200 text-navy/70"
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>
                  <span className="text-[10.5px] text-navy/50 block">
                    Nhập % hoặc bấm nút trên để <strong>auto tính giá sale</strong>.
                  </span>
                </div>

                {/* 3. Result Sale Price Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-rose-600 flex items-center gap-1.5">
                      <Flame size={14} /> 3. Giá bán ưu đãi (Giá Sale)
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 14.500.000"
                      value={
                        price
                          ? new Intl.NumberFormat("vi-VN").format(Number(price.replace(/\D/g, "")))
                          : ""
                      }
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="pr-12 text-sm font-black text-rose-600 bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-200"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-600/60">
                      VNĐ
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-700 flex items-center justify-between">
                      <span>Tiết kiệm:</span>
                      <span className="font-extrabold">
                        {new Intl.NumberFormat("vi-VN").format(savedAmount)} đ
                      </span>
                    </div>
                  )}

                  <span className="text-[10.5px] text-navy/50 block">
                    Giá thực tế khách hàng thanh toán trên website.
                  </span>
                </div>
              </div>

              {/* Warnings if pricing is inverted */}
              {numOrigPrice > 0 && numPrice > 0 && numPrice > numOrigPrice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800 font-medium">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Cảnh báo:</strong> Giá bán ưu đãi ({new Intl.NumberFormat("vi-VN").format(numPrice)} đ) đang cao hơn Giá gốc niêm yết ({new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ). Vui lòng kiểm tra lại.
                  </div>
                </div>
              )}

              {/* Price Range Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-navy">
                    Chuỗi khoảng giá hiển thị (Price Range Text)
                  </label>
                  {numPrice > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPriceRange(`${new Intl.NumberFormat("vi-VN").format(numPrice)} đ`)
                      }
                      className="text-[10.5px] font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      Đồng bộ theo Giá sale
                    </button>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="VD: 14.500.000 đ hoặc Liên hệ báo giá"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                />
                <span className="text-[11px] text-navy/50">
                  Chuỗi văn bản hiển thị trên danh sách sản phẩm (VD: 14.500.000 đ).
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl bg-gradient-to-r from-[#FAF9F5] to-white border border-gray-light/90 p-4 sm:p-5 space-y-2 shadow-xs">
                <div className="text-xs font-extrabold uppercase tracking-wider text-navy/60 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-green" /> Xem trước hiển thị giá trên Website:
                </div>
                <div className="flex flex-wrap items-baseline gap-3 pt-2">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                    {numPrice > 0
                      ? `${new Intl.NumberFormat("vi-VN").format(numPrice)} đ`
                      : priceRange || "Liên hệ"}
                  </span>

                  {hasDiscount && (
                    <>
                      <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-black text-white shadow-xs">
                        -{discountPercent}%
                      </span>
                      <span className="text-sm sm:text-base text-zinc-400 line-through font-bold">
                        {new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ
                      </span>
                      <span className="rounded-lg bg-rose-100/70 border border-rose-300/60 px-2.5 py-1 text-xs font-bold text-rose-800">
                        Tiết kiệm {new Intl.NumberFormat("vi-VN").format(savedAmount)} đ
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-gray-light/60 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("general")}
                  className="text-xs font-semibold gap-1.5 text-navy"
                >
                  <ChevronLeft size={14} />
                  <span>Quay lại: Thông tin chung</span>
                </Button>

                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveTab("media")}
                  className="text-xs font-bold gap-1.5"
                >
                  <span>Tiếp tục: Hình ảnh & Album</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: HÌNH ẢNH & MEDIA */}
        <TabsContent value="media" className="mt-4">
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
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-light bg-[#FAF9F5] flex items-center justify-center shadow-xs">
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
                addButtonText="Thêm ảnh chi tiết"
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
                        className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-light bg-[#FAF9F5] shadow-xs"
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

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-gray-light/60 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("pricing")}
                  className="text-xs font-semibold gap-1.5 text-navy"
                >
                  <ChevronLeft size={14} />
                  <span>Quay lại: Giá & Khuyến mãi</span>
                </Button>

                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveTab("content")}
                  className="text-xs font-bold gap-1.5"
                >
                  <span>Tiếp tục: Mô tả & Tính năng</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: MÔ TẢ & ĐIỂM NỔI BẬT */}
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung & Điểm nổi bật</CardTitle>
              <CardDescription>
                Mô tả ngắn, bài viết chi tiết và danh sách các tính năng nổi bật của sản phẩm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Mô tả ngắn (Short Description)</label>
                <Textarea
                  placeholder="Tóm tắt ngắn gọn 1-2 câu về sản phẩm (hiển thị trên thẻ chia sẻ & tóm tắt đầu trang)..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="min-h-[70px] text-xs"
                />
              </div>

              {/* Rich Text Editor for Detailed Description */}
              <RichTextEditor
                label="Bài viết mô tả chi tiết sản phẩm (Detailed Description)"
                description="Sử dụng thanh công cụ để định dạng in đậm, in nghiêng, chia đoạn, thêm gạch đầu dòng và tiêu đề phụ."
                placeholder=""
                value={description}
                onChange={setDescription}
                minHeight="min-h-[180px]"
              />
              <DynamicListInput
                label="Danh sách điểm nổi bật (Features Bullets)"
                description="Các gạch đầu dòng tính năng then chốt (hiển thị trên thẻ sản phẩm và chi tiết)."
                placeholder="VD: Mở khóa bằng Face ID 3D nhận diện khuôn mặt siêu nhạy"
                items={features}
                onChange={setFeatures}
                addButtonText="Thêm đặc điểm"
              />

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-gray-light/60 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("media")}
                  className="text-xs font-semibold gap-1.5 text-navy"
                >
                  <ChevronLeft size={14} />
                  <span>Quay lại: Hình ảnh & Album</span>
                </Button>

                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveTab("specs")}
                  className="text-xs font-bold gap-1.5"
                >
                  <span>Tiếp tục: Thông số kỹ thuật</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: THÔNG SỐ & KỸ THUẬT */}
        <TabsContent value="specs" className="mt-4">
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

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-gray-light/60 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("content")}
                  className="text-xs font-semibold gap-1.5 text-navy"
                >
                  <ChevronLeft size={14} />
                  <span>Quay lại: Mô tả & Tính năng</span>
                </Button>

                <Button
                  type="button"
                  variant="brand"
                  size="sm"
                  onClick={() => setActiveTab("extra")}
                  className="text-xs font-bold gap-1.5"
                >
                  <span>Tiếp tục: Lắp đặt & FAQ</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: LẮP ĐẶT & FAQ */}
        <TabsContent value="extra" className="mt-4">
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

              {/* Step Navigation Footer */}
              <div className="pt-4 border-t border-gray-light/60 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("specs")}
                  className="text-xs font-semibold gap-1.5 text-navy"
                >
                  <ChevronLeft size={14} />
                  <span>Quay lại: Thông số kỹ thuật</span>
                </Button>

                <Button
                  type="submit"
                  variant="brand"
                  size="default"
                  disabled={submitting}
                  className="text-xs font-bold gap-1.5 shadow-sm px-6 h-10"
                >
                  <Save size={15} />
                  <span>{submitting ? "Đang lưu..." : isEditing ? "Hoàn tất & Lưu thay đổi" : "Hoàn tất & Tạo sản phẩm"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
