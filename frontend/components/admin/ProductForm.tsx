"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicListInput } from "@/components/admin/DynamicListInput";
import { KeyValueEditor } from "@/components/admin/KeyValueEditor";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SingleImageUploader, MultiImageUploader } from "@/components/admin/ImageUploader";
import { toast } from "@/components/ui/toast";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";
import { formatProductName } from "@/lib/format-product-name";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

const SECTIONS = [
  { id: "all", label: "Tất cả", icon: LayoutGrid },
  { id: "sec-basic", label: "Cơ bản", icon: Layers },
  { id: "sec-media", label: "Hình ảnh", icon: ImageIcon },
  { id: "sec-pricing", label: "Giá & Khuyến mãi", icon: DollarSign },
  { id: "sec-content", label: "Mô tả", icon: FileText },
  { id: "sec-specs", label: "Thông số", icon: Wrench },
  { id: "sec-faq", label: "Thi công & FAQ", icon: HelpCircle },
];

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeNav, setActiveNav] = useState("all");
  const [viewMode, setViewMode] = useState<"continuous" | "tab">("continuous");

  // Form Fields State
  const [name, setName] = useState(formatProductName(initialData?.name || ""));
  const [id, setId] = useState(initialData?.id || "");
  const [autoSlugSync, setAutoSlugSync] = useState(!isEditing && !initialData?.id);
  const [code, setCode] = useState(formatProductName(initialData?.code || ""));
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [availableBrands, setAvailableBrands] = useState<Array<{ value: string; label: string }>>([]);

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
          if (!initialData?.brand && mapped[0]?.value) {
            setBrand((prev) => prev || mapped[0].value);
          }
        }
      })
      .catch(() => {});
  }, [initialData?.brand]);

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

  // Media (Images) - No raw URLs required, handled through uploaders
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [installationPreview, setInstallationPreview] = useState<string[]>(
    initialData?.installation_preview || [],
  );

  // Content & Features
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.content || initialData?.description || "");
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [priority, setPriority] = useState<number>(initialData?.priority ?? 10);

  // Variants State
  const [hasVariants, setHasVariants] = useState<boolean>(Boolean(initialData?.has_variants));
  const [variants, setVariants] = useState<
    Array<{
      id: string;
      label: string;
      attributes: Record<string, string>;
      price: number;
      originalPrice?: number;
      priceRange: string;
      is_default: boolean;
    }>
  >(initialData?.variants || []);

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
    setDescription(initialData.content || initialData.description || "");
    setFeatures(initialData.features || []);
    setSpecs(initialData.specs || {});
    setTechnologies(initialData.technologies || []);
    setColors(initialData.colors || []);
    setWarranty(initialData.warranty ?? 24);
    setWarrantyText(initialData.warrantyText || "Chính hãng 24 tháng");
    setInstallationManual(initialData.installationManual || []);
    setFaq(initialData.faq || []);
    setPriority(initialData.priority ?? 10);
    setHasVariants(Boolean(initialData.has_variants));
    setVariants(initialData.variants || []);
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

  // 5. Handle Quick Markup Click
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
    { label: "Ảnh đại diện", done: Boolean(imageUrl.trim()) },
    { label: "Giá & Khuyến mãi", done: Boolean(numPrice > 0 || priceRange.trim()) },
    { label: "Mô tả nội dung", done: Boolean(shortDescription.trim() || description.trim()) },
    { label: "Thông số kỹ thuật", done: Boolean(Object.keys(specs).length > 0 || features.length > 0) },
  ];
  const completedCount = completenessItems.filter((item) => item.done).length;
  const completionPercentage = Math.round((completedCount / completenessItems.length) * 100);

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

  const handleScrollToSection = (sectionId: string) => {
    setActiveNav(sectionId);
    if (viewMode === "continuous" && sectionId !== "all") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formatProductName(name.trim());
    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Vui lòng nhập tên sản phẩm hợp lệ (tối thiểu 2 ký tự)");
      document.getElementById("sec-basic")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const cleanId = (id.trim() || slugify(trimmedName)).toLowerCase();
    if (!cleanId) {
      toast.error("Mã ID / Slug không được để trống");
      document.getElementById("sec-basic")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!brand.trim()) {
      toast.error("Vui lòng chọn hoặc nhập tên thương hiệu");
      document.getElementById("sec-sidebar-org")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!category.trim()) {
      toast.error("Vui lòng chọn danh mục chính");
      document.getElementById("sec-sidebar-org")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Price validation
    let parsedPrice: number | null = null;
    if (price.trim()) {
      const p = Number(price.replace(/\D/g, ""));
      if (isNaN(p) || p < 0) {
        toast.error("Giá bán phải là số hợp lệ không âm");
        document.getElementById("sec-pricing")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      parsedPrice = p;
    }

    let parsedOrigPrice: number | undefined = undefined;
    if (originalPrice.trim()) {
      const op = Number(originalPrice.replace(/\D/g, ""));
      if (isNaN(op) || op < 0) {
        toast.error("Giá gốc phải là số hợp lệ không âm");
        document.getElementById("sec-pricing")?.scrollIntoView({ behavior: "smooth" });
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

    const cleanVariants = hasVariants
      ? variants
          .filter((v) => v.label.trim())
          .map((v, idx) => ({
            id: v.id || `v${idx + 1}`,
            label: v.label.trim(),
            attributes: v.attributes || { color: v.label.trim() },
            price: Number(v.price) || 0,
            originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
            priceRange:
              v.priceRange ||
              (v.price ? `${new Intl.NumberFormat("vi-VN").format(v.price)} đ` : ""),
            is_default: Boolean(v.is_default),
          }))
      : [];

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
      has_variants: hasVariants && cleanVariants.length > 0,
      variants: cleanVariants,
      options:
        hasVariants && cleanVariants.length > 0
          ? [
              {
                name: "Màu sắc",
                values: cleanVariants
                  .map((v) => v.attributes?.color || v.label)
                  .filter(Boolean),
              },
            ]
          : [],
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      content: description.trim(),
      priority: Number(priority) || 10,
      images: images.map((img) => img.trim()).filter(Boolean),
      specs: cleanSpecs,
      technologies: technologies.map((t) => t.trim()).filter(Boolean),
      warranty: Number(warranty) >= 0 ? Number(warranty) : 24,
      warrantyText: warrantyText.trim() || "Chính hãng 24 tháng",
      colors: colors.map((c) => c.trim()).filter(Boolean),
      installationManual: installationManual.map((m) => m.trim()).filter(Boolean),
      faq: cleanFaq,
      installation_preview: installationPreview.map((p) => p.trim()).filter(Boolean),
      installation: {
        images: installationPreview.map((p) => p.trim()).filter(Boolean),
        videos: [],
      },
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

  const shouldRenderSection = (secId: string) => {
    if (viewMode === "continuous") return true;
    if (activeNav === "all") return true;
    return activeNav === secId;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Header Bar: Title, Back link, Primary Action Button */}
      <div className="sticky top-16 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-light/80 shadow-xs transition-all">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 text-navy hover:bg-black/5"
              title="Quay lại danh sách sản phẩm"
            >
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-navy tracking-tight">
                {isEditing ? `Chỉnh sửa: ${initialData?.name || name}` : "Thêm Sản Phẩm Mới"}
              </h1>
              {brand && (
                <span className="hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-navy/70 border border-gray-200">
                  {brand}
                </span>
              )}
            </div>
            <p className="text-xs text-navy/50 font-mono mt-0.5">
              {id ? `ID: ${id}` : "Nhập tên sản phẩm để tự động tạo ID chuẩn SEO"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isEditing && (
            <Link href={`/product/${id}`} target="_blank">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="text-xs font-semibold text-navy h-10 px-3.5"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Xem trên web</span>
              </Button>
            </Link>
          )}

          <Button
            type="submit"
            variant="brand"
            size="default"
            disabled={submitting}
            className="text-xs font-bold gap-2 shadow-sm h-10 px-6 cursor-pointer"
          >
            <Save size={15} />
            <span>{submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Quick Navigation Anchor Bar & View Mode Toggle */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-light/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeNav === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleScrollToSection(sec.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2d5a15] text-white shadow-xs"
                    : "text-navy/70 hover:text-navy hover:bg-gray-100/80"
                }`}
              >
                <Icon size={13} className={isSelected ? "text-white" : "text-navy/50"} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-1 self-end md:self-auto shrink-0 bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setViewMode("continuous");
              setActiveNav("all");
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === "continuous"
                ? "bg-white text-navy shadow-2xs font-extrabold"
                : "text-navy/60 hover:text-navy"
            }`}
          >
            Cuộn toàn trang
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("tab");
              if (activeNav === "all") setActiveNav("sec-basic");
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === "tab"
                ? "bg-white text-navy shadow-2xs font-extrabold"
                : "text-navy/60 hover:text-navy"
            }`}
          >
            Lọc theo mục
          </button>
        </div>
      </div>

      {/* 3. Main Form Grid Layout: 8 cols Main Content + 4 cols Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================== CỘT CHÍNH (8 COLS) ===================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* CARD 1: THÔNG TIN CƠ BẢN */}
          {shouldRenderSection("sec-basic") && (
            <Card id="sec-basic" className="scroll-mt-36">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Layers size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
                    <CardDescription className="text-xs">
                      Tên hiển thị sản phẩm, mã model và đường dẫn URL chuẩn SEO.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tên sản phẩm */}
                <div className="space-y-1.5">
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
                    className="font-bold text-sm h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mã Model */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy">
                      Mã Model / Mã SP (Code) <span className="text-rose-600">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="VD: KL-600"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono text-xs h-10"
                    />
                  </div>

                  {/* ID / Slug */}
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
                          <span>{autoSlugSync ? "Đang đồng bộ" : "Tự do chỉnh"}</span>
                        </button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="VD: khoa-kassler-kl-600"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                        setAutoSlugSync(false);
                      }}
                      className="font-mono text-xs h-10 text-navy/80"
                      disabled={isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 2: HÌNH ẢNH SẢN PHẨM (DROPZONE RÕ RÀNG, TỰ ĐỘNG LÊN SERVER, KHÔNG HIỆN URL) */}
          {shouldRenderSection("sec-media") && (
            <Card id="sec-media" className="scroll-mt-36 border-2 border-brand-green/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-green/20 text-[#2d5a15]">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>Hình ảnh sản phẩm (Media)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-green/20 text-[#2d5a15]">
                        Tải lên trực tiếp
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Kéo thả hoặc chọn ảnh từ máy. Máy chủ Cloudflare R2 sẽ tự động tối ưu hóa và lưu trữ (không cần điền URL).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Ảnh đại diện chính */}
                <SingleImageUploader
                  label="1. Ảnh đại diện chính (Primary Image)"
                  description="Ảnh hiển thị trên thẻ sản phẩm, danh mục và ảnh đầu tiên trong trang chi tiết."
                  value={imageUrl}
                  onChange={setImageUrl}
                  brand={brand}
                  category={category}
                  productCode={code}
                  required
                />

                {/* 2. Album ảnh chi tiết */}
                <div className="pt-4 border-t border-gray-light/60">
                  <MultiImageUploader
                    label="2. Album ảnh chi tiết (Gallery Images)"
                    description="Hình ảnh các góc cạnh, chi tiết ruột khóa, phụ kiện hoặc chứng nhận."
                    items={images}
                    onChange={setImages}
                    onSetAsPrimary={setImageUrl}
                    brand={brand}
                    category={category}
                    productCode={code}
                    folder="products"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 3: GIÁ BÁN & KHUYẾN MÃI (SMART AUTO CALCULATION) */}
          {shouldRenderSection("sec-pricing") && (
            <Card id="sec-pricing" className="scroll-mt-36">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Giá bán & Khuyến mãi Tự động</CardTitle>
                    <CardDescription className="text-xs">
                      Nhập giá gốc và % giảm để hệ thống <strong>tự động tính giá bán ưu đãi</strong>, hoặc nhập giá bán để tính % giảm giá.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* 3-Column Pricing Smart Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-gray-light/80">
                  {/* 1. Original Price Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-navy flex items-center gap-1.5">
                      <DollarSign size={14} className="text-navy/60" /> 1. Giá gốc niêm yết
                    </label>
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
                        className="pr-12 text-sm font-bold text-navy bg-white h-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/40">
                        VNĐ
                      </span>
                    </div>

                    {/* Quick markup buttons */}
                    {numPrice > 0 && numOrigPrice === 0 && (
                      <div className="flex items-center gap-1 pt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-navy/50">Tạo giá gốc:</span>
                        {[10, 15, 20, 25, 30].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleApplyQuickMarkup(pct)}
                            className="rounded px-1.5 py-0.5 text-[10.5px] font-bold bg-white hover:bg-brand-green/20 hover:text-[#2d5a15] border border-gray-200 text-navy/70 transition-colors cursor-pointer"
                          >
                            +{pct}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Discount Percentage Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-brand-green flex items-center gap-1.5">
                        <Percent size={14} /> 2. % Khuyến mãi
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
                        className="pr-8 text-sm font-bold text-brand-green bg-white h-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/40">
                        %
                      </span>
                    </div>

                    {/* Quick discount chips */}
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      {[10, 15, 20, 25, 30, 40].map((pct) => (
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
                  </div>

                  {/* 3. Result Sale Price Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-rose-600 flex items-center gap-1.5">
                      <Flame size={14} /> 3. Giá bán ưu đãi (Sale)
                    </label>
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
                        className="pr-12 text-sm font-black text-rose-600 bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-200 h-10"
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
                  </div>
                </div>

                {/* Price Warnings */}
                {numOrigPrice > 0 && numPrice > 0 && numPrice > numOrigPrice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800 font-medium">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Cảnh báo:</strong> Giá bán ưu đãi ({new Intl.NumberFormat("vi-VN").format(numPrice)} đ) đang cao hơn Giá gốc niêm yết ({new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ).
                    </div>
                  </div>
                )}

                {/* Price Range Field & Live Preview Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-navy">
                        Khoảng giá hiển thị (Price Range Text)
                      </label>
                      {numPrice > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPriceRange(`${new Intl.NumberFormat("vi-VN").format(numPrice)} đ`)
                          }
                          className="text-[10.5px] font-bold text-brand-green hover:underline cursor-pointer"
                        >
                          Đồng bộ giá sale
                        </button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="VD: 14.500.000 đ hoặc Liên hệ báo giá"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="rounded-xl bg-[#FAF9F5] border border-gray-light p-3 space-y-1">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-navy/60 flex items-center gap-1">
                      <Sparkles size={12} className="text-brand-green" /> Xem trước hiển thị trên web:
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-rose-600">
                        {numPrice > 0
                          ? `${new Intl.NumberFormat("vi-VN").format(numPrice)} đ`
                          : priceRange || "Liên hệ"}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-xs text-zinc-400 line-through font-bold">
                            {new Intl.NumberFormat("vi-VN").format(numOrigPrice)} đ
                          </span>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            -{discountPercent}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>


              </CardContent>
            </Card>
          )}

          {/* CARD 4: MÔ TẢ & BÀI VIẾT NỘI DUNG */}
          {shouldRenderSection("sec-content") && (
            <Card id="sec-content" className="scroll-mt-36">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <FileText size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Mô tả & Điểm nổi bật</CardTitle>
                    <CardDescription className="text-xs">
                      Mô tả ngắn gọn, bài viết chi tiết và danh sách các tính năng then chốt của sản phẩm.
                    </CardDescription>
                  </div>
                </div>
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
                  label="Bài viết mô tả chi tiết sản phẩm (Detailed Content)"
                  description="Sử dụng thanh công cụ để định dạng in đậm, in nghiêng, chia đoạn, thêm gạch đầu dòng và tiêu đề phụ."
                  placeholder=""
                  value={description}
                  onChange={setDescription}
                  minHeight="min-h-[180px]"
                />

                {/* Features Bullets */}
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
          )}

          {/* CARD 5: THÔNG SỐ KỸ THUẬT & CÔNG NGHỆ */}
          {shouldRenderSection("sec-specs") && (
            <Card id="sec-specs" className="scroll-mt-36">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Thông số kỹ thuật & Công nghệ</CardTitle>
                    <CardDescription className="text-xs">
                      Bảng thông số kỹ thuật chi tiết theo cặp Key-Value, thẻ công nghệ và màu sắc.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Value Specs Editor */}
                <KeyValueEditor
                  label="Bảng thông số kỹ thuật (Specs Key-Value)"
                  description="Thêm các thông số như Xuất xứ, Kích thước, Chất liệu, Nguồn điện, Ruột khóa..."
                  specs={specs}
                  onChange={setSpecs}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-light/60">
                  <DynamicListInput
                    label="Thẻ công nghệ nổi bật (Technologies)"
                    placeholder="VD: Face ID 3D, Chống nước IP65, App Tuya Smart"
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
          )}

          {/* CARD 6: THI CÔNG THỰC TẾ & FAQ */}
          {shouldRenderSection("sec-faq") && (
            <Card id="sec-faq" className="scroll-mt-36">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base">Thi công thực tế & Câu hỏi thường gặp</CardTitle>
                    <CardDescription className="text-xs">
                      Album ảnh công trình thực tế, quy trình lắp đặt tiêu chuẩn và bộ câu hỏi đáp nhanh (FAQ).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ảnh lắp đặt công trình thực tế (Uploader trực quan không cần URL) */}
                <MultiImageUploader
                  label="Ảnh chụp công trình thực tế (Installation Photos)"
                  description="Album ảnh thực tế kỹ thuật viên TA HOUSE thi công lắp đặt tại nhà khách hàng."
                  items={installationPreview}
                  onChange={setInstallationPreview}
                  brand={brand}
                  category={category}
                  productCode={code}
                  folder="jobs"
                />

                {/* Quy trình lắp đặt */}
                <div className="pt-4 border-t border-gray-light/60">
                  <DynamicListInput
                    label="Các bước quy trình lắp đặt (Installation Manual)"
                    description="Các bước kỹ thuật viên thực hiện (Khảo sát đố cửa, Thi công đục lỗ, Lắp đặt, Cài đặt mật mã)."
                    placeholder="VD: Khảo sát thông số đố cửa và độ dày cửa tại công trình..."
                    items={installationManual}
                    onChange={setInstallationManual}
                    addButtonText="Thêm bước"
                  />
                </div>

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
          )}
        </div>

        {/* ===================== CỘT SIDEBAR (4 COLS - STICKY) ===================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">

          {/* SIDEBAR CARD 1: XUẤT BẢN & TIẾN ĐỘ HOÀN THIỆN */}
          <Card className="border-2 border-brand-green/30 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center justify-between">
                <span>Trạng thái & Lưu</span>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    completionPercentage === 100
                      ? "bg-brand-green/20 text-[#2d5a15]"
                      : completionPercentage >= 60
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {completionPercentage}% Hoàn tất
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
              <div className="space-y-1.5 pt-1">
                {completenessItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between text-xs p-1.5 rounded-lg font-semibold transition-colors ${
                      item.done
                        ? "bg-brand-green/10 text-[#2d5a15]"
                        : "bg-gray-50 text-navy/40"
                    }`}
                  >
                    <span>{item.label}</span>
                    <CheckCircle2
                      size={14}
                      className={item.done ? "text-brand-green" : "text-gray-300"}
                    />
                  </div>
                ))}
              </div>

              {/* Big Submit Button */}
              <Button
                type="submit"
                variant="brand"
                size="default"
                disabled={submitting}
                className="w-full text-xs font-bold gap-2 shadow-xs h-11 cursor-pointer mt-2"
              >
                <Save size={16} />
                <span>
                  {submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi sản phẩm" : "Tạo sản phẩm mới"}
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* SIDEBAR CARD 2: PHÂN LOẠI & THƯƠNG HIỆU */}
          <Card id="sec-sidebar-org">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FolderTree size={16} className="text-navy/70" />
                <CardTitle className="text-sm font-black">Phân loại & Thương hiệu</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brand Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-navy">
                    Thương hiệu (Brand) <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomBrand(!isCustomBrand)}
                    className="text-[10.5px] font-bold text-brand-green hover:underline cursor-pointer"
                  >
                    {isCustomBrand ? "Chọn có sẵn" : "Nhập mới"}
                  </button>
                </div>

                {isCustomBrand ? (
                  <Input
                    type="text"
                    placeholder="VD: Kassler hoặc Philips..."
                    value={customBrandName}
                    onChange={(e) => {
                      setCustomBrandName(e.target.value);
                      setBrand(e.target.value);
                    }}
                    className="font-bold text-xs h-9"
                  />
                ) : (
                  <Select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    options={availableBrands}
                  />
                )}
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">
                  Danh mục chính <span className="text-rose-600">*</span>
                </label>
                <Select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    setCategoryName(CATEGORY_LABELS[val] || val);
                  }}
                  options={categorySelectOptions}
                />
              </div>

              {/* Category Name Display */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Tên danh mục hiển thị</label>
                <Input
                  type="text"
                  placeholder="VD: Khóa đại sảnh"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Danh mục phụ (Subcategory slug)</label>
                <Input
                  type="text"
                  placeholder="VD: cua-go hoặc ket-mini (tùy chọn)"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* SIDEBAR CARD 3: CÀI ĐẶT HIỂN THỊ & BẢO HÀNH */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-navy/70" />
                <CardTitle className="text-sm font-black">Cài đặt & Bảo hành</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-navy">Thứ tự ưu tiên (Priority)</label>
                  <span className="text-[10px] text-navy/40">Số nhỏ lên đầu</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="9999"
                  placeholder="10"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) || 10)}
                  className="font-bold text-xs h-9"
                />
              </div>

              {/* Warranty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Thời hạn bảo hành (Số tháng)</label>
                <Input
                  type="number"
                  placeholder="VD: 24"
                  value={warranty}
                  onChange={(e) => setWarranty(Number(e.target.value))}
                  className="font-bold text-xs h-9"
                />
              </div>

              {/* Warranty Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Ghi chú bảo hành</label>
                <Input
                  type="text"
                  placeholder="VD: Chính hãng 24 tháng, tận nhà"
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
