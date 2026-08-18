"use client";

import React, { use, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
  Share2,
  Sparkles,
  ShieldCheck,
  Truck,
  Wrench,
  MapPin,
  Star,
  Layers,
  FileText,
  Clock,
  Send,
  HelpCircle,
  CheckCircle2,
  Palette,
  Camera,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Flame,
  Gift,
} from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import { SiZalo } from "react-icons/si";
import { useApp } from "@/context/AppContext";
import { COMPANY_LEGAL } from "@/data/company-legal";
import content from "@/data/content.json";
import { calculateProductDiscount } from "@/lib/format-price";
import { fetchProduct } from "@/lib/api/products";
import { formatProductName } from "@/lib/format-product-name";
import type { Product } from "@/lib/types/product";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatSpecKey(key: string): string {
  const dictionary: Record<string, string> = {
    xuat_xu: "Xuất xứ",
    kich_thuoc: "Kích thước",
    chat_lieu: "Chất liệu",
    vat_lieu: "Vật liệu",
    bao_hanh: "Bảo hành",
    cong_suat: "Công suất",
    nguon_dien: "Nguồn điện",
    do_on: "Độ ồn",
    dung_tich: "Dung tích",
    khoi_luong: "Khối lượng",
    trong_luong: "Trọng lượng",
    mau_sac: "Màu sắc",
    chuc_nang: "Chức năng",
    phuong_thuc_mo: "Phương thức mở",
    dung_luong_pin: "Dung lượng pin",
    do_day_cua: "Độ dày cửa",
    do_cua: "Đố cửa",
  };
  if (dictionary[key]) return dictionary[key];
  if (key.includes("_")) {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return key;
}

function getCategoryInstallWorkflow(product: Product): { steps: string[]; warrantyNote: string } {
  const cat = (product.category || "").toLowerCase();
  const catName = (product.categoryName || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const warrantyVal =
    product.warrantyText ??
    (product.warranty ? `${product.warranty} tháng` : (product.specs?.["Bảo hành"] || "Chính hãng 24-36 tháng"));

  // 1. Khóa điện tử / Khóa thông minh / Khóa vân tay
  if (
    cat.includes("lock") ||
    cat.includes("khoa") ||
    cat.includes("dai-sanh") ||
    cat.includes("nhom-kinh") ||
    cat.includes("cua-go") ||
    cat.includes("khach-san") ||
    cat.includes("face") ||
    catName.includes("khóa") ||
    name.includes("khóa") ||
    name.startsWith("kl-") ||
    brand.includes("kassler")
  ) {
    return {
      steps: [
        "Khảo sát thông số cửa (độ dày cửa, độ rộng đố cửa và chất liệu gỗ, nhôm Xingfa, sắt, kính...) hoàn toàn miễn phí tại công trình.",
        "Kỹ thuật viên chuyên nghiệp TA HOUSE trực tiếp thi công lắp đặt chuẩn xác, căn chỉnh ruột khóa (mortise) và chốt an toàn đóng mở êm ái.",
        "Cài đặt toàn bộ vân tay, mã số chủ, thẻ từ, kết nối App điện thoại hoặc Face ID và hướng dẫn các thành viên gia đình sử dụng thành thạo.",
        "Bàn giao trọn bộ phụ kiện và chìa cơ khẩn cấp, kích hoạt bảo hành điện tử chính hãng và cam kết hỗ trợ kỹ thuật tận nơi 24/7.",
      ],
      warrantyNote: `Khóa thông minh ${product.name} được bảo hành chính hãng ${warrantyVal}. Kích hoạt bảo hành điện tử ngay khi bàn giao, hỗ trợ xử lý kỹ thuật tận nơi và sẵn sàng thay thế linh kiện bo mạch chính hãng.`,
    };
  }

  // 2. Két sắt thông minh
  if (
    cat.includes("smart") ||
    cat.includes("ket-sat") ||
    catName.includes("két") ||
    name.includes("két") ||
    name.includes("valis") ||
    name.includes("safe") ||
    name.startsWith("sbx")
  ) {
    return {
      steps: [
        "Tư vấn lựa chọn kích thước, trọng lượng và vị trí đặt két an toàn (đặt sàn, cố định âm tường hoặc bắt vít âm tủ chống di dời).",
        "Vận chuyển kín đáo, an toàn tận nhà, hỗ trợ đưa vào đúng vị trí theo yêu cầu của gia chủ.",
        "Kỹ thuật viên hỗ trợ cài đặt mã số bảo mật, vân tay 3D, chìa khóa khẩn cấp và kết nối ứng dụng quản lý.",
        "Kích hoạt bảo hành điện tử chính hãng, bảo mật tuyệt đối 100% thông tin khách hàng.",
      ],
      warrantyNote: `Két sắt thông minh ${product.name} được bảo hành chính hãng ${warrantyVal}. Hỗ trợ bảo dưỡng định kỳ và xử lý kỹ thuật tận nhà.`,
    };
  }

  // 3. Thiết bị bếp (Hút mùi, Bếp từ, Máy rửa chén, Lò nướng...)
  if (
    cat.includes("kitchen") ||
    cat.includes("bep") ||
    cat.includes("hut-mui") ||
    cat.includes("may-rua-chen") ||
    cat.includes("lo-nuong") ||
    cat.includes("chau-rua") ||
    catName.includes("bếp") ||
    catName.includes("hút mùi") ||
    catName.includes("máy rửa") ||
    brand.includes("bosch")
  ) {
    return {
      steps: [
        "Khảo sát kích thước khoét đá, khoang tủ bếp, đường cấp thoát nước, đường thoát khí và tải nguồn điện tiêu chuẩn an toàn.",
        "Kỹ thuật viên TA HOUSE tiến hành lắp đặt âm tủ chuẩn xác, đấu nối điện chống giật an toàn, kết nối đường ống và cố định chắc chắn.",
        "Vận hành thử nghiệm toàn diện các cấp độ công suất, kiểm tra độ ồn và hệ thống an toàn phòng cháy.",
        "Hướng dẫn khách hàng sử dụng và vệ sinh định kỳ đúng cách, bàn giao phụ kiện và kích hoạt bảo hành điện tử chính hãng.",
      ],
      warrantyNote: `Thiết bị bếp ${product.name} được bảo hành chính hãng ${warrantyVal}. Hỗ trợ lắp đặt chuẩn an toàn phòng cháy, linh kiện thay thế chính hãng.`,
    };
  }

  // 4. Máy lọc nước / Máy điện giải
  if (
    cat.includes("water") ||
    cat.includes("loc-nuoc") ||
    cat.includes("dien-giai") ||
    catName.includes("lọc nước") ||
    catName.includes("điện giải") ||
    brand.includes("karofi") ||
    brand.includes("ao smith")
  ) {
    return {
      steps: [
        "Khảo sát vị trí lắp đặt (dưới chậu rửa, gầm tủ hoặc tủ đứng), nguồn nước cấp và áp lực nước sinh hoạt.",
        "Kỹ thuật viên tiến hành lắp đặt hệ thống máy, xả rửa màng lọc và kiểm tra chỉ số nước tinh khiết / hydro-ion đạt chuẩn BYT.",
        "Bàn giao trọn bộ phụ kiện, hướng dẫn sử dụng và thiết lập lịch nhắc thay lõi lọc định kỳ tự động.",
        "Kích hoạt bảo hành điện tử chính hãng, hỗ trợ kỹ thuật và kiểm tra chất lượng nước định kỳ tận nhà.",
      ],
      warrantyNote: `Máy lọc nước ${product.name} được bảo hành chính hãng ${warrantyVal}. Cam kết màng lọc và linh kiện chính hãng 100%.`,
    };
  }

  // 5. Cửa & Các sản phẩm khác
  return {
    steps: [
      "Khảo sát đo đạc kích thước ô chờ thực tế tại công trình và tư vấn phương án thi công tối ưu.",
      "Kỹ thuật viên chuyên nghiệp TA HOUSE trực tiếp vận chuyển, lắp dựng và căn chỉnh sản phẩm hoàn chỉnh.",
      "Vận hành thử nghiệm, kiểm tra độ bền chắc, đóng mở kín khít và hoàn thiện thẩm mỹ công trình.",
      "Nghiệm thu, bàn giao sản phẩm, hướng dẫn bảo quản và kích hoạt bảo hành chính hãng.",
    ],
    warrantyNote: `Sản phẩm ${product.name} được bảo hành chính hãng ${warrantyVal}. Hỗ trợ kỹ thuật tận nơi, kích hoạt bảo hành điện tử ngay khi bàn giao.`,
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  return <ProductDetailView key={id} id={id} />;
}

function ProductDetailView({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandSpecs, setExpandSpecs] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { addToRecentlyViewed, setIsChatbotOpen } = useApp();

  useEffect(() => {
    let cancelled = false;

    fetchProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        addToRecentlyViewed(data.id);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        if (error.message === "NOT_FOUND") {
          setNotFound(true);
          setProduct(null);
          setFetchError(false);
          return;
        }
        setProduct(null);
        setNotFound(false);
        setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, addToRecentlyViewed]);

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // Lightbox keyboard shortcut navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setIsZoomedIn(false);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
        setIsZoomedIn(false);
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
        setIsZoomedIn(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral text-navy">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center pb-24 pt-40 text-sm font-bold text-brand-green">
          Đang tải thông tin sản phẩm...
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-neutral text-navy">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 pb-24 pt-40 text-center">
          <h2 className="font-serif text-2xl font-bold">Không thể tải thông tin sản phẩm</h2>
          <p className="text-sm font-semibold text-navy/60">Vui lòng kiểm tra kết nối và thử lại.</p>
          <Link href="/products" className="text-sm font-bold uppercase text-brand-green hover:underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-neutral text-navy">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-40 text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold">{content.detail.notFound.title}</h2>
          <Link href="/products" className="text-sm font-bold uppercase text-brand-green hover:underline">
            {content.detail.notFound.backLink}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Combine product.imageUrl (primary) and product.images (gallery), removing duplicates
  const rawGallery = [
    product.imageUrl,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter((url): url is string => Boolean(url && typeof url === "string" && url.trim().length > 0));

  const galleryImages = Array.from(new Set(rawGallery));
  const heroImage = selectedImage && galleryImages.includes(selectedImage)
    ? selectedImage
    : (product.imageUrl || galleryImages[0] || "");

  const currentGalleryIndex = galleryImages.indexOf(heroImage) >= 0 ? galleryImages.indexOf(heroImage) : 0;

  const specs = product.specs ?? {};
  const features = product.features ?? [];
  const technologies = product.technologies ?? [];
  const colors = product.colors ?? [];
  const installPreviews = (product.installation_preview ?? []).filter(Boolean);
  const installWorkflow = getCategoryInstallWorkflow(product);
  const installSteps =
    product.installationManual && product.installationManual.length > 0
      ? product.installationManual
      : installWorkflow.steps;
  const warrantyNote = installWorkflow.warrantyNote;

  const discountInfo = calculateProductDiscount(
    product.price,
    product.originalPrice,
    product.priceRange,
    product.id,
  );
  const hasNumericPrice = typeof product.price === "number" && product.price > 0;
  const showDiscount = discountInfo.hasDiscount;
  const discountPercent = discountInfo.discountPercent;

  // Genuine blueprint / dimension diagram detection
  const dimensionImage = galleryImages.find((img) => {
    if (img === product.imageUrl) return false;
    const lower = img.toLowerCase();
    return (
      lower.includes("kich-thuoc") ||
      lower.includes("kich_thuoc") ||
      lower.includes("dimension") ||
      lower.includes("ban-ve") ||
      lower.includes("drawing") ||
      lower.includes("blueprint")
    );
  }) ?? null;

  const openLightbox = (images: string[], initialIndex: number = 0) => {
    const validImages = (images || []).filter(
      (img): img is string => typeof img === "string" && img.trim().length > 0
    );
    if (validImages.length === 0) return;
    const safeIndex = Math.max(0, Math.min(initialIndex, validImages.length - 1));
    setLightboxImages(validImages);
    setLightboxIndex(safeIndex);
    setIsZoomedIn(false);
    setLightboxOpen(true);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") {
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    setQuestionSent(true);
    setTimeout(() => {
      setQuestionText("");
      setCustomerPhone("");
      setQuestionSent(false);
    }, 4000);
  };

  const displayName = formatProductName(product.name);

  // Quick key specs summary (similar to Bếp Vũ Sơn ul.info-pro)
  const quickSpecsList: { label: string; value: string }[] = [];
  if (product.brand) quickSpecsList.push({ label: "Thương hiệu", value: product.brand });
  if (product.code) quickSpecsList.push({ label: "Mã Model", value: product.code });
  if (specs["Series"] || specs["Dòng sản phẩm"] || specs["Dòng SP"]) {
    quickSpecsList.push({
      label: "Dòng sản phẩm",
      value: specs["Series"] || specs["Dòng sản phẩm"] || specs["Dòng SP"],
    });
  }
  if (specs["Công suất"] || specs["Công suất hút"] || specs["Công suất tổng"] || specs["cong_suat"]) {
    quickSpecsList.push({
      label: "Công suất",
      value: specs["Công suất"] || specs["Công suất hút"] || specs["Công suất tổng"] || specs["cong_suat"],
    });
  }
  if (
    specs["Kích thước"] ||
    specs["Kích thước sản phẩm"] ||
    specs["Kích thước (HxWxD)"] ||
    specs["Kích thước thân khóa ngoài"] ||
    specs["kich_thuoc"]
  ) {
    quickSpecsList.push({
      label: "Kích thước",
      value:
        specs["Kích thước"] ||
        specs["Kích thước sản phẩm"] ||
        specs["Kích thước (HxWxD)"] ||
        specs["Kích thước thân khóa ngoài"] ||
        specs["kich_thuoc"],
    });
  }
  if (specs["Vật liệu"] || specs["Chất liệu"] || specs["vat_lieu"] || specs["chat_lieu"]) {
    quickSpecsList.push({
      label: "Chất liệu",
      value: specs["Vật liệu"] || specs["Chất liệu"] || specs["vat_lieu"] || specs["chat_lieu"],
    });
  }
  if (specs["Xuất xứ"] || specs["xuat_xu"] || specs["Nơi sản xuất"] || specs["Origin"]) {
    quickSpecsList.push({
      label: "Xuất xứ",
      value: specs["Xuất xứ"] || specs["xuat_xu"] || specs["Nơi sản xuất"] || specs["Origin"],
    });
  }
  const warrantyVal = product.warrantyText ?? (product.warranty ? `${product.warranty} tháng` : (specs["Bảo hành"] || specs["bao_hanh"] || "Chính hãng 24-36 tháng"));
  quickSpecsList.push({ label: "Bảo hành", value: warrantyVal });

  // Full specs table
  const fullSpecsEntries = Object.entries(specs);
  const displayedSpecs = expandSpecs ? fullSpecsEntries : fullSpecsEntries.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-navy antialiased">
      <Header />

      <main className="pb-16 pt-6 md:pt-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-navy/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-green transition-colors">Trang chủ</Link>
            <ChevronRight size={13} className="text-navy/40" />
            <Link href="/products" className="hover:text-brand-green transition-colors">Sản phẩm</Link>
            {product.categoryName && (
              <>
                <ChevronRight size={13} className="text-navy/40" />
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight size={13} className="text-navy/40" />
            <span className="truncate max-w-[280px] sm:max-w-md font-bold text-navy">{displayName}</span>
          </nav>

          {/* TOP SECTION: 3 Columns like Bếp Vũ Sơn (Gallery | Info & Price | Showroom & Commitments) */}
          <section className="rounded-3xl border border-gray-light/60 bg-white p-5 sm:p-7 shadow-sm">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
              
              {/* COL 1: Product Gallery (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col">
                <button
                  type="button"
                  onClick={() => openLightbox(galleryImages, currentGalleryIndex)}
                  className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-light/80 bg-[#FAF9F5] shadow-inner flex items-center justify-center cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-brand-green"
                  title="Nhấn để phóng to ảnh sản phẩm"
                  aria-label="Phóng to ảnh sản phẩm"
                >
                  {showDiscount && (
                    <div className="absolute left-3 top-3 z-10 rounded-lg bg-rose-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md pointer-events-none">
                      Giảm {discountPercent}%
                    </div>
                  )}
                  {product.brand && (
                    <div className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm backdrop-blur-xs border border-gray-light/40 pointer-events-none">
                      {product.brand}
                    </div>
                  )}

                  {/* Zoom hint badge */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-80 backdrop-blur-xs transition-opacity group-hover:opacity-100 shadow-sm pointer-events-none">
                    <Maximize2 size={13} />
                    <span>Phóng to</span>
                  </div>

                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={displayName}
                      fill
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 550px"
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-navy/40">Không có ảnh</div>
                  )}
                </button>

                {/* Thumbnails Strip */}
                {galleryImages.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 invisible-scrollbar">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => {
                          if (heroImage === image) {
                            openLightbox(galleryImages, index);
                          } else {
                            setSelectedImage(image);
                          }
                        }}
                        className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                          heroImage === image
                            ? "border-brand-green shadow-sm scale-102"
                            : "border-gray-light/80 opacity-70 hover:opacity-100"
                        }`}
                        title={heroImage === image ? "Nhấn lần nữa để phóng to" : `Xem ảnh ${index + 1}`}
                        aria-label={`Xem ảnh ${index + 1}`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-contain bg-[#FAF9F5] p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Trust Note under image */}
                <div className="mt-4 flex items-center justify-center gap-4 rounded-xl bg-[#F5F1EA]/60 py-2.5 text-[11px] font-bold text-navy/75 border border-gray-light/50">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-brand-green" /> 100% Chính hãng
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Wrench size={14} className="text-brand-green" /> Khảo sát tận nơi
                  </span>
                </div>
              </div>

              {/* COL 2: Info, Pricing & Action Buttons (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-brand-green/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand-green">
                    {product.categoryName || "Thiết bị cao cấp"}
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 text-[11px] font-bold text-navy/60 hover:text-brand-green transition-colors cursor-pointer"
                  >
                    <Share2 size={13} />
                    {copied ? "Đã sao chép" : "Chia sẻ"}
                  </button>
                </div>

                <h1 className="font-serif text-2xl font-bold leading-snug text-navy md:text-3xl">
                  {displayName}
                </h1>

                {/* Star rating & Model Code */}
                <div className="mt-2.5 mb-4 flex items-center gap-3 text-xs">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-navy/50 font-medium">|</span>
                  <span className="font-semibold text-navy/70">Mã SP: <strong className="text-navy">{product.code}</strong></span>
                </div>

                {/* Price Box */}
                <div className="rounded-2xl bg-[#FAF9F5] border border-gray-light/70 p-4 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-navy/60 mb-1.5">
                    <span className="flex items-center gap-1.5 text-navy/70">
                      <Flame size={14} className="text-rose-600 fill-rose-600" />
                      <span>{hasNumericPrice ? (showDiscount ? "Giá Ưu Đãi Hôm Nay" : "Giá Niêm Yết") : "Báo Giá Ưu Đãi"}</span>
                    </span>
                    {showDiscount && discountInfo.formattedSavedAmount && (
                      <span className="rounded-md bg-rose-50 border border-rose-200/60 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        Tiết kiệm {discountInfo.formattedSavedAmount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-2xl font-black text-rose-600 sm:text-3xl tracking-tight leading-none">
                      {discountInfo.formattedCurrentPrice}
                    </span>
                    {showDiscount && (
                      <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-black text-white">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  {showDiscount && discountInfo.formattedOriginalPrice && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-navy/55 border-t border-gray-light/50 pt-2">
                      <span>Giá gốc niêm yết:</span>
                      <span className="text-sm font-bold text-zinc-400 line-through">
                        {discountInfo.formattedOriginalPrice}
                      </span>
                    </div>
                  )}

                  {/* PROMO GIFT / PERK STRIP (Tông cam ấm áp) */}
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-xs font-bold text-amber-800">
                    <Gift size={14} className="text-amber-600 shrink-0" />
                    <span>Tặng gói tư vấn, khảo sát đố cửa & công lắp đặt tận nơi</span>
                  </div>
                </div>

                {/* Available Colors if present */}
                {colors.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-navy/70 flex items-center gap-1">
                      <Palette size={13} className="text-brand-green" /> Màu sắc:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {colors.map((color, i) => (
                        <span key={i} className="rounded-md bg-white border border-gray-light px-2 py-0.5 font-bold text-navy">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Highlights / Specs Summary (ul.info-pro) */}
                <div className="mb-6 rounded-2xl bg-[#F8F7F3]/70 border border-gray-light/60 p-4">
                  <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-navy flex items-center gap-1.5">
                    <Layers size={14} className="text-brand-green" /> Thông số nổi bật
                  </h3>
                  <ul className="space-y-1.5 text-xs text-navy/90">
                    {quickSpecsList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-green mt-1.5 shrink-0" />
                        <span>
                          <strong className="font-semibold text-navy">{item.label}:</strong> {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons (Zalo, SĐT Hotline & Bot tư vấn AI) */}
                <div className="space-y-2.5 mt-auto">
                  <a
                    href={COMPANY_LEGAL.zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 rounded-xl bg-[#0068ff] py-3.5 px-4 text-center text-white shadow-md shadow-[#0068ff]/25 transition-transform active:scale-[0.99] hover:bg-[#0056d6] cursor-pointer"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                      <SiZalo className="h-4.5 w-4.5 text-[#0068ff]" />
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-sm font-black uppercase tracking-wider">Tư vấn qua Zalo</span>
                      <span className="text-[10px] font-medium text-white/85">(Khảo sát & Báo giá tận nơi)</span>
                    </div>
                  </a>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${COMPANY_LEGAL.phoneTel}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      <Phone size={14} className="text-white" />
                      <span>Gọi {COMPANY_LEGAL.phone}</span>
                    </a>
                    <button
                      onClick={() => setIsChatbotOpen(true)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-green/30 bg-brand-green/10 py-3 text-xs font-bold text-brand-green hover:bg-brand-green/20 transition-colors cursor-pointer"
                    >
                      <Sparkles size={14} className="text-brand-green animate-pulse" />
                      <span>Bot tư vấn AI</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* COL 3: Showroom & Service Commitments (lg:col-span-3) */}
              <div className="lg:col-span-3 flex flex-col gap-4 border-t border-gray-light/60 pt-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                {/* Showroom Box */}
                <div className="rounded-2xl border border-gray-light/70 bg-[#FAF9F5] p-4">
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-navy">
                    <MapPin size={15} className="text-brand-green shrink-0" />
                    <span>Showroom Trải Nghiệm</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-navy/90 mb-2">
                    {COMPANY_LEGAL.address}
                  </p>
                  <div className="space-y-2 text-[11px] text-navy/70 border-t border-gray-light/50 pt-2.5">
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="text-brand-green shrink-0" />
                      <span>{COMPANY_LEGAL.workingHours}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone size={13} className="text-brand-green shrink-0" />
                      <span className="font-semibold text-navy/80">Hotline:</span>
                      <a
                        href={`tel:${COMPANY_LEGAL.phoneTel}`}
                        className="font-extrabold text-rose-600 hover:underline"
                      >
                        {COMPANY_LEGAL.phone}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Commitments Box */}
                <div className="rounded-2xl border border-gray-light/70 bg-[#FAF9F5] p-4 flex-1">
                  <div className="mb-3 text-xs font-black uppercase tracking-wider text-navy">
                    Chính Sách & Cam Kết
                  </div>
                  <ul className="space-y-2.5 text-xs text-navy/85">
                    <li className="flex items-start gap-2">
                      <ShieldCheck size={16} className="text-brand-green shrink-0 mt-0.5" />
                      <span><strong>100% Chính hãng:</strong> Đầy đủ CO/CQ, bảo hành điện tử.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Wrench size={16} className="text-brand-green shrink-0 mt-0.5" />
                      <span><strong>Khảo sát & Lắp đặt:</strong> Kỹ thuật viên tay nghề cao tận nơi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Truck size={16} className="text-brand-green shrink-0 mt-0.5" />
                      <span><strong>Giao hàng an toàn:</strong> Đóng gói chuẩn hãng, ship toàn quốc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-green shrink-0 mt-0.5" />
                      <span><strong>Hỗ trợ trọn đời:</strong> Linh kiện thay thế chính hãng.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </section>

          {/* BOTTOM SECTION: 2 Columns (Article on Left 68% | Specifications on Right 32%) */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
            
            {/* LEFT COLUMN: Detailed Article, Features & Installation (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* SECTION: Đặc điểm nổi bật */}
              <section className="rounded-3xl border border-gray-light/60 bg-white p-6 sm:p-8 shadow-sm">
                <div className="border-b border-gray-light/60 pb-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-navy flex items-center gap-2">
                    <FileText size={20} className="text-brand-green" />
                    Đặc điểm nổi bật <span className="text-brand-green">{displayName}</span>
                  </h2>
                </div>

                {/* Article Intro */}
                <div className="prose max-w-none text-sm leading-relaxed text-navy/90 space-y-4">
                  {product.description ? (
                    <p className="font-medium text-base text-navy leading-relaxed">
                      {product.description}
                    </p>
                  ) : (
                    <p className="font-medium">
                      <strong>{displayName}</strong> là dòng sản phẩm cao cấp phân phối chính hãng bởi {COMPANY_LEGAL.tradeName}. 
                      Sản phẩm được thiết kế tỉ mỉ, kết hợp công nghệ hiện đại mang lại sự tiện nghi, an toàn và nâng tầm không gian sống của gia đình bạn.
                    </p>
                  )}

                  {/* Highlights Grid */}
                  {features.length > 0 && (
                    <div className="my-6">
                      <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-navy">
                        Tính năng và công nghệ vượt trội:
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-xl border border-gray-light/60 bg-[#FAF9F5] p-3.5"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
                              <Check size={14} strokeWidth={2.6} />
                            </div>
                            <span className="text-xs font-bold leading-snug text-navy/90">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Product Technologies */}
                  {technologies.length > 0 && (
                    <div className="my-6 rounded-2xl bg-brand-green/5 border border-brand-green/20 p-5">
                      <h3 className="mb-3 text-sm font-bold text-navy uppercase tracking-wider">
                        Công nghệ & Tiêu chuẩn vận hành:
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-navy/85">
                        {technologies.map((tech, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-white/80 rounded-lg p-2 border border-brand-green/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                            <span className="truncate">{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: Đánh giá tổng quan */}
                <div className="mt-8 border-t border-gray-light/60 pt-6">
                  <h3 className="mb-3 text-base font-bold uppercase tracking-tight text-navy">
                    Đánh giá tổng quan & Giá trị sử dụng
                  </h3>
                  <p className="text-xs sm:text-sm font-normal leading-relaxed text-navy/80">
                    Sản phẩm <strong>{displayName}</strong> mang lại trải nghiệm tiện ích vượt bậc, tính bền bỉ và đẳng cấp cho ngôi nhà. 
                    Mọi chi tiết đều được hoàn thiện tinh xảo từ các vật liệu tiêu chuẩn cao, vận hành êm ái, tiết kiệm năng lượng và thân thiện với người dùng. 
                    Đây là sự đầu tư xứng đáng cho một không gian sống tiện nghi, bền vững.
                  </p>
                </div>

                {/* Real Installation Photos (Clickable for zoom) */}
                {installPreviews.length > 0 && (
                  <div className="mt-8 border-t border-gray-light/60 pt-6">
                    <h3 className="mb-4 text-base font-bold uppercase tracking-tight text-navy flex items-center gap-2">
                      <Camera size={18} className="text-brand-green" />
                      Hình ảnh thi công & Lắp đặt thực tế (Nhấn để phóng to)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {installPreviews.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => openLightbox(installPreviews, i)}
                          className="group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-light/70 bg-[#FAF9F5] cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-brand-green shadow-xs transition-all hover:border-brand-green/50"
                          title="Nhấn để phóng to ảnh lắp đặt"
                          aria-label={`Phóng to ảnh thi công ${i + 1}`}
                        >
                          <Image
                            src={imgUrl}
                            alt={`${displayName} lắp đặt thực tế ${i + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
                            <span className="opacity-0 group-hover:opacity-100 rounded-lg bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs transition-opacity flex items-center gap-1 shadow-sm">
                              <Maximize2 size={12} /> Phóng to
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION: Lắp đặt & Bảo hành */}
              <section className="rounded-3xl border border-gray-light/60 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold uppercase tracking-tight text-navy mb-4 flex items-center gap-2">
                  <Wrench size={18} className="text-brand-green" />
                  Quy trình Khảo sát & Lắp đặt của {COMPANY_LEGAL.tradeName}
                </h2>
                <div className="space-y-3 text-xs sm:text-sm font-normal text-navy/85 leading-relaxed">
                  {installSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-brand-green font-bold text-[11px]">
                        {idx + 1}
                      </div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#F8F7F3]/70 border border-gray-light/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-brand-green" /> Chính sách bảo hành & Hỗ trợ kỹ thuật
                  </h4>
                  <p className="text-xs text-navy/80 leading-relaxed">
                    {warrantyNote}
                  </p>
                </div>
              </section>

              {/* SECTION: Đánh giá & Nhận xét từ khách hàng */}
              <section className="rounded-3xl border border-gray-light/60 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold uppercase tracking-tight text-navy mb-6 flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-400" />
                  Đánh giá & Nhận xét từ khách hàng
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 items-center bg-[#FAF9F5] p-5 rounded-2xl border border-gray-light/60 mb-6">
                  <div className="sm:col-span-4 text-center sm:border-r border-gray-light/60 sm:pr-4">
                    <div className="text-4xl font-black text-navy">5.0</div>
                    <div className="flex justify-center text-amber-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="fill-amber-400" />
                      ))}
                    </div>
                    <div className="text-[11px] font-semibold text-navy/60">(100% khách hàng hài lòng)</div>
                  </div>

                  <div className="sm:col-span-8 space-y-1.5 text-xs text-navy/70">
                    <div className="flex items-center gap-2">
                      <span className="w-10 font-bold">5 sao</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full w-full" />
                      </div>
                      <span className="w-8 text-right font-semibold">100%</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <span className="w-10 font-bold">4 sao</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-200" />
                      <span className="w-8 text-right font-semibold">0%</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <span className="w-10 font-bold">3 sao</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-200" />
                      <span className="w-8 text-right font-semibold">0%</span>
                    </div>
                  </div>
                </div>

                {/* Form hỏi đáp / yêu cầu tư vấn nhanh */}
                <form onSubmit={handleSendQuestion} className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-navy">
                    Gửi câu hỏi hoặc yêu cầu tư vấn về sản phẩm:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Số điện thoại của bạn..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="rounded-xl border border-gray-light bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-green focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Nội dung cần tư vấn (ví dụ: kích thước lắp đặt, báo giá combo...)"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="rounded-xl border border-gray-light bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-green focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {questionSent ? (
                      <span className="text-xs font-bold text-brand-green flex items-center gap-1">
                        <CheckCircle2 size={14} /> Cảm ơn bạn! Chuyên viên sẽ liên hệ ngay trong ít phút.
                      </span>
                    ) : (
                      <span className="text-[11px] text-navy/50">Thông tin của bạn được bảo mật tuyệt đối.</span>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-brand-green px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-lime-dark transition-colors shadow-sm cursor-pointer"
                    >
                      <Send size={13} /> Gửi yêu cầu
                    </button>
                  </div>
                </form>
              </section>

            </div>

            {/* RIGHT COLUMN: Technical Specifications Box like Bếp Vũ Sơn (lg:col-span-4) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                
                {/* Main Specs Box */}
                <div className="rounded-3xl border border-gray-light/80 bg-white shadow-sm overflow-hidden">
                  <div className="bg-navy px-5 py-4 text-white">
                    <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <Layers size={16} className="text-brand-green" />
                      Thông số kỹ thuật
                    </h2>
                    <p className="text-[11px] text-white/70 truncate mt-0.5">{displayName}</p>
                  </div>

                  {/* Zebra Striped Table */}
                  <div className="divide-y divide-gray-light/60 text-xs">
                    {/* Fixed Primary Specs */}
                    <div className="flex justify-between p-3.5 bg-[#FAF9F5]">
                      <span className="font-semibold text-navy/70">Thương hiệu:</span>
                      <span className="font-extrabold text-navy text-right">{product.brand || "Chính hãng"}</span>
                    </div>
                    <div className="flex justify-between p-3.5 bg-white">
                      <span className="font-semibold text-navy/70">Mã sản phẩm:</span>
                      <span className="font-extrabold text-navy text-right">{product.code}</span>
                    </div>
                    <div className="flex justify-between p-3.5 bg-[#FAF9F5]">
                      <span className="font-semibold text-navy/70">Phân loại:</span>
                      <span className="font-extrabold text-navy text-right">{product.categoryName || "Thiết bị cao cấp"}</span>
                    </div>
                    <div className="flex justify-between p-3.5 bg-white">
                      <span className="font-semibold text-navy/70">Thời hạn bảo hành:</span>
                      <span className="font-extrabold text-brand-green text-right">{warrantyVal}</span>
                    </div>

                    {/* Dynamic Specs from product.specs with clean key formatting */}
                    {displayedSpecs.map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`flex items-start justify-between p-3.5 gap-3 text-xs ${
                          idx % 2 === 0 ? "bg-[#FAF9F5]" : "bg-white"
                        }`}
                      >
                        <span className="font-semibold text-navy/70 shrink-0 max-w-[45%] break-words">
                          {formatSpecKey(key)}:
                        </span>
                        <span className="font-extrabold text-navy text-right break-words min-w-0">
                          {val}
                        </span>
                      </div>
                    ))}

                    {fullSpecsEntries.length === 0 && (
                      <div className="p-4 text-center text-xs text-navy/60">
                        Thông số đang được cập nhật. Vui lòng liên hệ hotline để nhận catalog kỹ thuật chi tiết.
                      </div>
                    )}
                  </div>

                  {/* Expand / Collapse Button if many specs */}
                  {fullSpecsEntries.length > 10 && (
                    <div className="p-3 border-t border-gray-light/60 bg-[#FAF9F5] text-center">
                      <button
                        type="button"
                        onClick={() => setExpandSpecs(!expandSpecs)}
                        className="text-xs font-bold text-brand-green hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        {expandSpecs ? "Thu gọn thông số ▲" : "Xem thêm tất cả thông số ▼"}
                      </button>
                    </div>
                  )}

                  {/* Genuine Technical Drawing / Blueprint only if available (Clickable for zoom) */}
                  {dimensionImage && (
                    <div className="p-4 border-t border-gray-light/60 bg-white">
                      <div className="text-[11px] font-bold text-navy/70 mb-2 uppercase tracking-wider">
                        Bản vẽ kích thước kỹ thuật (Nhấn để phóng to):
                      </div>
                      <button
                        type="button"
                        onClick={() => openLightbox([dimensionImage], 0)}
                        className="group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-light/70 bg-[#FAF9F5] cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-brand-green shadow-xs transition-all hover:border-brand-green/50"
                        title="Nhấn để phóng to bản vẽ kích thước"
                        aria-label="Phóng to bản vẽ kích thước kỹ thuật"
                      >
                        <Image
                          src={dimensionImage}
                          alt={`Kích thước kỹ thuật ${displayName}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 30vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
                          <span className="opacity-0 group-hover:opacity-100 rounded-lg bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs transition-opacity flex items-center gap-1 shadow-sm">
                            <Maximize2 size={12} /> Phóng to bản vẽ
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Consultation Card */}
                <div className="rounded-3xl border border-brand-green/30 bg-brand-green/5 p-5 text-center">
                  <HelpCircle size={28} className="mx-auto text-brand-green mb-2" />
                  <h4 className="text-sm font-black uppercase text-navy">Bạn cần tư vấn kích thước & lắp đặt?</h4>
                  <p className="text-xs text-navy/75 my-2 leading-relaxed">
                    Kỹ thuật viên TA HOUSE hỗ trợ khảo sát kích thước thực tế và lên phương án thi công hoàn toàn miễn phí.
                  </p>
                  <a
                    href={`tel:${COMPANY_LEGAL.phoneTel}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-green transition-colors mt-2 cursor-pointer"
                  >
                    <Phone size={13} /> Hotline {COMPANY_LEGAL.phone}
                  </a>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FULLSCREEN LIGHTBOX IMAGE ZOOM MODAL (PORTAL TRỰC TIẾP VÀO BODY) */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {lightboxOpen && lightboxImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-lenis-prevent="true"
                onClick={() => {
                  setLightboxOpen(false);
                  setIsZoomedIn(false);
                }}
                className="fixed inset-0 z-[999999] flex h-screen h-[100dvh] w-screen max-h-[100dvh] flex-col justify-between overflow-hidden bg-black/95 p-3 sm:p-5 backdrop-blur-md select-none cursor-pointer"
              >
                {/* Top Bar */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-11 shrink-0 items-center justify-between text-white border-b border-white/10 pb-2 cursor-default"
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <h3 className="text-sm sm:text-base font-bold truncate text-white">
                      {displayName}
                    </h3>
                    <span className="text-xs text-white/60 font-semibold">
                      Ảnh {lightboxIndex + 1} / {lightboxImages.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Zoom Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsZoomedIn(!isZoomedIn)}
                      className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
                      title={isZoomedIn ? "Thu nhỏ (100%)" : "Phóng to (180%)"}
                    >
                      {isZoomedIn ? (
                        <>
                          <ZoomOut size={15} /> <span className="hidden sm:inline">100%</span>
                        </>
                      ) : (
                        <>
                          <ZoomIn size={15} /> <span className="hidden sm:inline">Phóng to</span>
                        </>
                      )}
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxOpen(false);
                        setIsZoomedIn(false);
                      }}
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      aria-label="Đóng"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Center Area with Main Zoomed Image */}
                <div className="relative flex-1 min-h-0 w-full flex items-center justify-center my-2 overflow-hidden">
                  {/* Prev Button */}
                  {lightboxImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
                        setIsZoomedIn(false);
                      }}
                      className="absolute left-2 sm:left-4 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black hover:scale-110 transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-lg"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={22} />
                    </button>
                  )}

                  {/* Main Image Stage Card */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomedIn(!isZoomedIn);
                    }}
                    className={`relative flex h-full max-h-[calc(100dvh-150px)] w-full max-w-4xl items-center justify-center overflow-hidden rounded-3xl bg-white/95 p-3 sm:p-6 shadow-2xl transition-all duration-300 ${
                      isZoomedIn ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                    title={isZoomedIn ? "Nhấn để thu nhỏ" : "Nhấn để phóng to"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lightboxImages[lightboxIndex] || lightboxImages[0] || heroImage}
                      alt={`${displayName} phóng to`}
                      className={`h-auto max-h-full w-auto max-w-full object-contain transition-transform duration-300 select-none ${
                        isZoomedIn ? "scale-175" : "scale-100"
                      }`}
                    />
                  </div>

                  {/* Next Button */}
                  {lightboxImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
                        setIsZoomedIn(false);
                      }}
                      className="absolute right-2 sm:right-4 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black hover:scale-110 transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-lg"
                      aria-label="Ảnh kế tiếp"
                    >
                      <ChevronRight size={22} />
                    </button>
                  )}
                </div>

                {/* Bottom Thumbnails Strip */}
                {lightboxImages.length > 1 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-15 shrink-0 justify-center gap-2 overflow-x-auto pt-1 invisible-scrollbar border-t border-white/10 cursor-default"
                  >
                    {lightboxImages.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => {
                          setLightboxIndex(idx);
                          setIsZoomedIn(false);
                        }}
                        className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer bg-white p-1 ${
                          lightboxIndex === idx
                            ? "border-brand-green scale-105 shadow-md shadow-brand-green/30"
                            : "border-white/30 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
