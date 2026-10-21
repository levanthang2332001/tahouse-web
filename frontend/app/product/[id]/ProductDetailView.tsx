"use client";

import React, { useEffect, useState } from "react";
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
  Layers,
  FileText,
  Clock,
  Send,
  HelpCircle,
  CheckCircle2,
  Camera,
  Maximize2,
  MessageCircleQuestion,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import { FormattedText } from "@/components/ui/FormattedText";
import { SiZalo } from "react-icons/si";
import { useApp } from "@/context/AppContext";
import { COMPANY_LEGAL } from "@/data/company-legal";
import content from "@/data/content.json";
import { calculateProductDiscount } from "@/lib/format-price";
import { fetchProduct } from "@/lib/api/products";
import { formatProductName } from "@/lib/format-product-name";
import { recordRecentlyViewed } from "@/lib/recently-viewed";
import { RecentlyViewedProducts, RelatedProducts } from "./ProductRecommendations";
import type { Product } from "@/lib/types/product";

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

function formatTechnology(tech: string): string {
  const dictionary: Record<string, string> = {
    "fingerprint unlock": "Mở bằng vân tay",
    "password unlock": "Mở bằng mật mã",
    "ic card unlock": "Mở bằng thẻ từ",
    "card unlock": "Mở bằng thẻ từ",
    "mechanical key": "Chìa cơ khẩn cấp",
    "doorbell function": "Chuông cửa",
    "app wifi": "Điều khiển qua App (Wi-Fi)",
    "auto lock": "Tự động khóa",
    "face id": "Nhận diện khuôn mặt",
    "alarm": "Cảnh báo an ninh",
  };
  return dictionary[tech.trim().toLowerCase()] ?? tech;
}

// Drops an editor section (heading + everything until the next heading of the same or higher level)
function removeHtmlSection(html: string, headingPattern: RegExp): string {
  const headings = [...html.matchAll(/<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const headingText = (inner: string) => inner.replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;| /gi, " ");
  const startIdx = headings.findIndex((h) => headingPattern.test(headingText(h[2])));
  if (startIdx === -1) return html;
  const start = headings[startIdx];
  const level = Number(start[1]);
  const next = headings.slice(startIdx + 1).find((h) => Number(h[1]) <= level);
  const from = start.index ?? 0;
  const to = next?.index ?? html.length;
  return html.slice(0, from) + html.slice(to);
}

// Answers only restate what the page already promises or what the product's own specs say
function buildFaq(product: Product, warrantyVal: string): { question: string; answer: string }[] {
  if (product.faq && product.faq.length > 0) return product.faq;

  const specs = product.specs ?? {};
  const findSpec = (label: string) => {
    const key = Object.keys(specs).find((k) => formatSpecKey(k).toLowerCase() === label.toLowerCase());
    return key ? specs[key] : undefined;
  };
  const doorThickness = findSpec("Độ dày cửa");
  const emergencyPower = findSpec("Nguồn điện khẩn cấp");
  const items: { question: string; answer: string }[] = [];

  if (doorThickness) {
    items.push({
      question: "Cửa nhà tôi có lắp được sản phẩm này không?",
      answer: `Sản phẩm phù hợp với cửa có độ dày ${doorThickness}${findSpec("Đố cửa") ? `, đố cửa ${findSpec("Đố cửa")}` : ""}. Kỹ thuật viên ${COMPANY_LEGAL.tradeName} khảo sát miễn phí tại công trình để xác nhận trước khi lắp đặt.`,
    });
  }
  if (emergencyPower) {
    items.push({
      question: "Khi hết pin thì mở khóa thế nào?",
      answer: `Khóa có nguồn điện khẩn cấp qua ${emergencyPower}. Ngoài ra bạn được bàn giao chìa cơ khẩn cấp khi lắp đặt.`,
    });
  }
  items.push(
    {
      question: "Có khảo sát và lắp đặt tận nơi không?",
      answer: `Có. ${COMPANY_LEGAL.tradeName} khảo sát miễn phí tại công trình, kỹ thuật viên trực tiếp lắp đặt, căn chỉnh và hướng dẫn sử dụng khi bàn giao.`,
    },
    {
      question: "Sản phẩm được bảo hành bao lâu?",
      answer: `Bảo hành chính hãng ${warrantyVal}, kích hoạt bảo hành điện tử ngay khi bàn giao và hỗ trợ kỹ thuật tận nơi.`,
    },
    {
      question: "Tôi có thể xem sản phẩm trực tiếp ở đâu?",
      answer: `Showroom tại ${COMPANY_LEGAL.address}, mở cửa ${COMPANY_LEGAL.workingHours}. Hotline: ${COMPANY_LEGAL.phone}.`,
    },
  );
  return items;
}

// Admin often stores several colors in one entry ("Đen, Đồng"), so split them into separate options
function splitColors(colors: string[]): string[] {
  const parts = colors
    .flatMap((entry) => entry.split(/\s*[,/;|+]\s*|\s+và\s+/i))
    .map((c) => c.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

// Longest names first so "Vàng đồng" wins over "Vàng" / "Đồng"
const COLOR_SWATCHES: [string, string][] = [
  ["vàng hồng", "#b76e79"],
  ["rose gold", "#b76e79"],
  ["vàng đồng", "#c8a96b"],
  ["đồng đỏ", "#a0522d"],
  ["champagne", "#c8a96b"],
  ["mạ vàng", "#d4af37"],
  ["cà phê", "#6f4e37"],
  ["titan", "#878681"],
  ["inox", "#c7ccd1"],
  ["vàng", "#d4af37"],
  ["đồng", "#b87333"],
  ["đen", "#1f2328"],
  ["trắng", "#ffffff"],
  ["bạc", "#c0c0c0"],
  ["xám", "#8a8f98"],
  ["ghi", "#9ca3af"],
  ["nâu", "#6b4226"],
  ["đỏ", "#c0392b"],
  ["xanh", "#2e6da4"],
];

function colorSwatch(name: string): string | null {
  const lower = name.toLowerCase();
  return COLOR_SWATCHES.find(([key]) => lower.includes(key))?.[1] ?? null;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-start gap-2.5 text-lg font-bold leading-snug text-navy sm:text-xl">
      <span className="mt-0.5 shrink-0 text-brand-green">{icon}</span>
      <span className="min-w-0">{children}</span>
    </h2>
  );
}

function getCategoryInstallWorkflow(product: Product): { steps: string[]; warrantyNote: string } {
  const cat = (product.category || "").toLowerCase();
  const catName = (product.categoryName || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  // Product names already carry their category ("Khóa đại sảnh…"), so notes use the name alone
  const productLabel = formatProductName(product.name);
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
      warrantyNote: `${productLabel} được bảo hành chính hãng ${warrantyVal}. Kích hoạt bảo hành điện tử ngay khi bàn giao, hỗ trợ xử lý kỹ thuật tận nơi và sẵn sàng thay thế linh kiện bo mạch chính hãng.`,
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
      warrantyNote: `${productLabel} được bảo hành chính hãng ${warrantyVal}. Hỗ trợ bảo dưỡng định kỳ và xử lý kỹ thuật tận nhà.`,
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
      warrantyNote: `${productLabel} được bảo hành chính hãng ${warrantyVal}. Hỗ trợ lắp đặt chuẩn an toàn phòng cháy, linh kiện thay thế chính hãng.`,
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
      warrantyNote: `${productLabel} được bảo hành chính hãng ${warrantyVal}. Cam kết màng lọc và linh kiện chính hãng 100%.`,
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
    warrantyNote: `${productLabel} được bảo hành chính hãng ${warrantyVal}. Hỗ trợ kỹ thuật tận nơi, kích hoạt bảo hành điện tử ngay khi bàn giao.`,
  };
}

function getDefaultVariantId(product: Product | null): string | null {
  return product?.variants?.find((v) => v.is_default)?.id || product?.variants?.[0]?.id || null;
}

export default function ProductDetailView({
  id,
  initialProduct = null,
}: {
  id: string;
  /** Rendered on the server when the backend answered; otherwise the client fetches it */
  initialProduct?: Product | null;
}) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandSpecs, setExpandSpecs] = useState(false);
  const [expandArticle, setExpandArticle] = useState(false);
  const articleRef = React.useRef<HTMLElement>(null);
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

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() =>
    getDefaultVariantId(initialProduct),
  );

  const { addToRecentlyViewed, setIsChatbotOpen } = useApp();

  useEffect(() => {
    if (initialProduct) {
      addToRecentlyViewed(initialProduct.id);
      recordRecentlyViewed(initialProduct);
      return;
    }

    let cancelled = false;

    fetchProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setSelectedVariantId(getDefaultVariantId(data));
        addToRecentlyViewed(data.id);
        recordRecentlyViewed(data);
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
  }, [id, initialProduct, addToRecentlyViewed]);

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
  const colors = splitColors(product.colors ?? []);
  const installPreviews = (product.installation_preview ?? []).filter(Boolean);
  const installWorkflow = getCategoryInstallWorkflow(product);
  const installSteps =
    product.installationManual && product.installationManual.length > 0
      ? product.installationManual
      : installWorkflow.steps;
  const warrantyNote = installWorkflow.warrantyNote;

  const hasVariants = Boolean(product.has_variants && product.variants && product.variants.length > 0);
  const activeVariant = hasVariants
    ? (product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0] || null)
    : null;

  const currentPrice = activeVariant?.price !== undefined && activeVariant.price > 0
    ? activeVariant.price
    : product.price;

  const currentPriceRange = activeVariant?.priceRange || product.priceRange;

  const discountInfo = calculateProductDiscount(
    currentPrice,
    product.originalPrice,
    currentPriceRange,
    product.id,
  );
  const hasNumericPrice = typeof currentPrice === "number" && currentPrice > 0;
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

  // No lead API yet: hand the question to Zalo so it actually reaches the sales team
  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;
    const message = [
      `Xin chào TA HOUSE, tôi cần tư vấn sản phẩm ${formatProductName(product.name)} (Mã: ${product.code}).`,
      questionText.trim() && `Nội dung: ${questionText.trim()}`,
      `SĐT liên hệ: ${customerPhone.trim()}`,
      typeof window !== "undefined" ? window.location.href : "",
    ]
      .filter(Boolean)
      .join("\n");
    // Start the copy while this tab still has focus, then open Zalo in the same user gesture
    navigator.clipboard?.writeText(message).catch(() => {});
    window.open(COMPANY_LEGAL.zaloUrl, "_blank", "noopener,noreferrer");
    setQuestionSent(true);
    setTimeout(() => {
      setQuestionText("");
      setCustomerPhone("");
      setQuestionSent(false);
    }, 8000);
  };

  const displayName = formatProductName(product.name);

  // Quick key specs summary (similar to Bếp Vũ Sơn ul.info-pro)
  const quickSpecsList: { label: string; value: string }[] = [];
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
  const faqItems = buildFaq(product, warrantyVal);

  // Full specs table
  const fullSpecsEntries = Object.entries(specs);
  const displayedSpecs = expandSpecs ? fullSpecsEntries : fullSpecsEntries.slice(0, 10);

  // The specs table already lists these, so drop the duplicated block from the editor article
  const rawArticle = product.content || product.description || "";
  const articleContent =
    fullSpecsEntries.length > 0 ? removeHtmlSection(rawArticle, /thông số kỹ thuật/i) : rawArticle;
  const isLongArticle = articleContent.replace(/<[^>]+>/g, "").length > 900;

  const toggleArticle = () => {
    if (expandArticle && articleRef.current && articleRef.current.getBoundingClientRect().top < 0) {
      articleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setExpandArticle(!expandArticle);
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] pb-[calc(76px+env(safe-area-inset-bottom))] text-navy antialiased lg:pb-0">
      <Header />

      <main className="pb-16 pt-6 md:pt-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex flex-wrap items-center gap-x-1.5 text-sm font-medium text-navy/70 sm:mb-6" aria-label="Breadcrumb">
            <Link href="/" className="py-1.5 hover:text-brand-green transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="text-navy/40" />
            <Link href="/products" className="py-1.5 hover:text-brand-green transition-colors">Sản phẩm</Link>
            {product.categoryName && (
              <>
                <ChevronRight size={14} className="text-navy/40" />
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="py-1.5 hover:text-brand-green transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="text-navy/40" />
            <span className="truncate max-w-[280px] py-1.5 sm:max-w-md font-semibold text-navy">{displayName}</span>
          </nav>

          {/* TOP SECTION: 3 Columns like Bếp Vũ Sơn (Gallery | Info & Price | Showroom & Commitments) */}
          <section className="rounded-3xl border border-gray-light/60 bg-white p-4 sm:p-7 shadow-sm">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
              
              {/* COL 1: Product Gallery (lg:col-span-6) */}
              <div className="lg:col-span-6 flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => openLightbox(galleryImages, currentGalleryIndex)}
                  className="group relative aspect-[4/3] max-h-[420px] w-full overflow-hidden rounded-2xl border border-gray-light/80 bg-white flex items-center justify-center cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-brand-green"
                  title="Nhấn để phóng to ảnh sản phẩm"
                  aria-label="Phóng to ảnh sản phẩm"
                >
                  {/* Zoom hint badge */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white opacity-80 backdrop-blur-xs transition-opacity group-hover:opacity-100 shadow-sm pointer-events-none">
                    <Maximize2 size={13} />
                    <span>Phóng to</span>
                  </div>

                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={displayName}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 550px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105 pointer-events-none"
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
                          alt={`${displayName} ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-contain bg-[#FAF9F5] p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Real installation photos: strongest proof, kept right next to the product gallery */}
                {installPreviews.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-gray-light/60 bg-[#FAF9F5] p-3">
                    <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-navy">
                      <Camera size={16} className="text-brand-green" />
                      Ảnh lắp đặt thực tế
                      <span className="font-normal text-navy/70">({installPreviews.length})</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {installPreviews.slice(0, 4).map((imgUrl, i) => {
                        const remaining = installPreviews.length - 4;
                        const showMore = i === 3 && remaining > 0;
                        return (
                          <button
                            key={imgUrl}
                            type="button"
                            onClick={() => openLightbox(installPreviews, i)}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-gray-light/70 bg-[#EFEBE3] cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-brand-green"
                            aria-label={showMore ? `Xem thêm ${remaining} ảnh lắp đặt` : `Phóng to ảnh lắp đặt ${i + 1}`}
                          >
                            <Image
                              src={imgUrl}
                              alt={`${displayName} lắp đặt thực tế ${i + 1}`}
                              fill
                              sizes="(max-width: 1024px) 25vw, 140px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            {showMore && (
                              <span className="absolute inset-0 flex items-center justify-center bg-navy/60 text-sm font-bold text-white">
                                +{remaining}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* COL 2: Info, Pricing & Action Buttons (lg:col-span-6) — one column, read top to bottom */}
              <div className="lg:col-span-6 flex min-w-0 flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#4d8a22]">
                    {[product.brand, product.categoryName || "Thiết bị cao cấp"].filter(Boolean).join(" · ")}
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="-mr-2 flex min-h-11 items-center gap-1.5 px-2 text-sm font-medium text-navy/70 hover:text-brand-green transition-colors cursor-pointer"
                  >
                    <Share2 size={15} />
                    {copied ? "Đã sao chép" : "Chia sẻ"}
                  </button>
                </div>

                <h1 className="text-[22px] font-bold leading-snug text-navy md:text-2xl">
                  {displayName}
                </h1>
                <p className="mt-1.5 text-sm text-navy/70">
                  Mã SP: <strong className="font-semibold text-navy">{product.code}</strong>
                </p>

                {/* Price */}
                <div className="mt-4 rounded-2xl border border-gray-light/70 bg-[#FAF9F5] px-4 py-3.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-2xl font-extrabold tracking-tight text-[#c0283a] sm:text-[26px]">
                      {discountInfo.formattedCurrentPrice}
                    </span>
                    {showDiscount && discountInfo.formattedOriginalPrice && (
                      <span className="text-base text-navy/50 line-through">{discountInfo.formattedOriginalPrice}</span>
                    )}
                    {showDiscount && (
                      <span className="rounded-md bg-[#c0283a] px-2 py-0.5 text-xs font-bold text-white">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  {showDiscount && discountInfo.formattedSavedAmount ? (
                    <p className="mt-1 text-sm text-navy/70">
                      Tiết kiệm <strong className="font-semibold text-[#c0283a]">{discountInfo.formattedSavedAmount}</strong>
                    </p>
                  ) : (
                    !hasNumericPrice && <p className="mt-1 text-sm text-navy/70">Liên hệ để nhận báo giá ưu đãi</p>
                  )}
                </div>

                {/* Quick specs as a plain checklist */}
                {quickSpecsList.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-navy/85">
                    {quickSpecsList.map((item) => (
                      <li key={item.label} className="flex items-start gap-2">
                        <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand-green" />
                        <span className="min-w-0 break-words">
                          <span className="text-navy/70">{item.label}:</span>{" "}
                          <span className="font-medium text-navy">{item.value}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Available Variants or Colors */}
                {hasVariants && product.variants && product.variants.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <span className="text-sm font-semibold text-navy">Phiên bản / Màu sắc:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = activeVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all cursor-pointer border ${
                              isSelected
                                ? "border-brand-green bg-brand-green/10 text-navy shadow-xs ring-1 ring-brand-green"
                                : "border-gray-light/80 bg-white text-navy/80 hover:border-brand-green/50 hover:bg-neutral/40"
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-brand-green" : "bg-gray-400"}`} />
                            <span>{v.label}</span>
                            {v.price > 0 && (
                              <span className="text-xs font-semibold text-[#c0283a] bg-[#c0283a]/5 px-1.5 py-0.5 rounded-md">
                                {new Intl.NumberFormat("vi-VN").format(v.price)} đ
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : colors.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-navy">Màu sắc:</span>
                    <ul className="flex flex-wrap gap-2" aria-label="Màu sắc có sẵn">
                      {colors.map((color) => {
                        const swatch = colorSwatch(color);
                        return (
                          <li
                            key={color}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-gray-light bg-white px-3 font-medium text-navy"
                          >
                            {swatch && (
                              <span
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 rounded-full border border-navy/15 shadow-inner"
                                style={{ backgroundColor: swatch }}
                              />
                            )}
                            {color}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {/* Action Buttons (Zalo, SĐT Hotline & Bot tư vấn AI) */}
                <div className="mt-5 space-y-2.5">
                  <a
                    href={COMPANY_LEGAL.zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 rounded-xl bg-[#0068ff] py-3 px-4 text-center text-white shadow-md shadow-[#0068ff]/25 transition-transform active:scale-[0.99] hover:bg-[#0056d6] cursor-pointer"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                      <SiZalo className="h-4.5 w-4.5 text-[#0068ff]" />
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-base font-bold">Tư vấn qua Zalo</span>
                      <span className="mt-0.5 text-xs text-white/90">Miễn phí khảo sát & lắp đặt tận nơi</span>
                    </div>
                  </a>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${COMPANY_LEGAL.phoneTel}`}
                      className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#c0283a]/40 bg-white px-2 text-sm font-semibold text-[#c0283a] hover:bg-[#c0283a]/5 transition-colors cursor-pointer"
                    >
                      <Phone size={15} />
                      <span>Gọi {COMPANY_LEGAL.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsChatbotOpen(true)}
                      className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-brand-green/40 bg-white px-2 text-sm font-semibold text-[#4d8a22] hover:bg-brand-green/10 transition-colors cursor-pointer"
                    >
                      <Sparkles size={15} />
                      <span>Bot tư vấn AI</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Service commitments: one scannable strip under the gallery and buy box */}
            <ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3.5 border-t border-gray-light/60 pt-6 min-[520px]:grid-cols-2 min-[520px]:gap-y-4 lg:grid-cols-4">
              {[
                { icon: ShieldCheck, title: "100% Chính hãng", text: "Đầy đủ CO/CQ, bảo hành điện tử" },
                { icon: Wrench, title: "Khảo sát & lắp đặt", text: "Kỹ thuật viên tận nơi, miễn phí khảo sát" },
                { icon: Truck, title: "Giao hàng an toàn", text: "Đóng gói chuẩn hãng, ship toàn quốc" },
                { icon: CheckCircle2, title: "Hỗ trợ trọn đời", text: "Linh kiện thay thế chính hãng" },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-[#3f741b]">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">{title}</p>
                    <p className="text-sm leading-snug text-navy/70">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* BOTTOM SECTION: 2 Columns (Article on Left 68% | Specifications on Right 32%) */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          
            {/* LEFT COLUMN: Detailed Article, Features & Installation (lg:col-span-8) */}
            <div className="lg:col-span-8 min-w-0 space-y-8">
            
              {/* SECTION: Đặc điểm nổi bật — scannable summary first, full article collapsed below */}
              <section ref={articleRef} className="scroll-mt-24 rounded-3xl border border-gray-light/60 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <SectionTitle icon={<FileText size={20} />}>
                    Tổng quan sản phẩm
                  </SectionTitle>
                </div>

                {/* Quick summary: features as a compact checklist */}
                {features.length > 0 && (
                  <div className="rounded-2xl bg-[#FAF9F5] border border-gray-light/60 p-4 sm:p-5">
                    <h3 className="mb-3 text-base font-bold text-navy">Tính năng chính</h3>
                    <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-[#4d8a22]">
                            <Check size={13} strokeWidth={2.8} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <FormattedText content={feature} className="text-sm leading-normal text-navy/90" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies as light chips */}
                {technologies.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2.5 text-sm font-semibold text-navy/80">Công nghệ & tiêu chuẩn vận hành</h3>
                    <div className="flex flex-wrap gap-2">
                      {technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/25 bg-brand-green/5 px-3 py-1.5 text-sm text-navy/85"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                          {formatTechnology(tech)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full article (collapsed when long) */}
                <div className={features.length > 0 || technologies.length > 0 ? "mt-8 border-t border-gray-light/60 pt-6" : ""}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/70">Mô tả chi tiết</p>
                  {articleContent ? (
                    <div className="relative">
                      <div
                        id="product-article"
                        className={`max-w-[70ch] overflow-hidden transition-[max-height] duration-500 ${
                          isLongArticle && !expandArticle ? "max-h-[440px]" : "max-h-none"
                        }`}
                      >
                        <FormattedText
                          content={articleContent}
                          className="text-navy [&_li>strong:first-child]:block [&_li>strong:first-child]:text-navy"
                        />
                      </div>
                      {isLongArticle && !expandArticle && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-white/0" />
                      )}
                    </div>
                  ) : (
                    <p className="max-w-[70ch] text-base leading-relaxed text-navy/90">
                      <strong className="font-semibold">{displayName}</strong> là dòng sản phẩm cao cấp phân phối chính hãng bởi {COMPANY_LEGAL.tradeName}. 
                      Sản phẩm được thiết kế tỉ mỉ, kết hợp công nghệ hiện đại mang lại sự tiện nghi, an toàn và nâng tầm không gian sống của gia đình bạn.
                    </p>
                  )}
                  {isLongArticle && (
                    <button
                      type="button"
                      onClick={toggleArticle}
                      aria-expanded={expandArticle}
                      aria-controls="product-article"
                      className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-gray-light bg-white px-4 text-sm font-semibold text-navy hover:border-brand-green hover:text-[#3f741b] transition-colors cursor-pointer"
                    >
                      {expandArticle ? "Thu gọn" : "Đọc tiếp mô tả"}
                      <ChevronRight size={16} className={`transition-transform ${expandArticle ? "-rotate-90" : "rotate-90"}`} />
                    </button>
                  )}
                </div>
              </section>

              {/* SECTION: Lắp đặt & Bảo hành */}
              <section className="rounded-3xl border border-gray-light/60 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-5">
                  <SectionTitle icon={<Wrench size={20} />}>
                    Quy trình khảo sát & lắp đặt của {COMPANY_LEGAL.tradeName}
                  </SectionTitle>
                </div>
                <ol className="space-y-3.5 text-sm leading-relaxed text-navy/85 sm:text-[15px]">
                  {installSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-xs font-bold text-[#3f741b]">
                        {idx + 1}
                      </span>
                      <p className="min-w-0">{step}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 rounded-2xl bg-[#F8F7F3]/70 border border-gray-light/60 p-4">
                  <h3 className="text-sm font-bold text-navy mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-brand-green" /> Chính sách bảo hành & hỗ trợ kỹ thuật
                  </h3>
                  <p className="text-sm text-navy/80 leading-relaxed">
                    {warrantyNote}
                  </p>
                </div>
              </section>

              {/* SECTION: FAQ */}
              {faqItems.length > 0 && (
                <section className="rounded-3xl border border-gray-light/60 bg-white p-5 sm:p-8 shadow-sm">
                  <div className="mb-4">
                    <SectionTitle icon={<MessageCircleQuestion size={20} />}>Câu hỏi thường gặp</SectionTitle>
                  </div>
                  <div className="divide-y divide-gray-light/70 border-y border-gray-light/70">
                    {faqItems.map((item, idx) => (
                      <details key={idx} className="group" open={idx === 0}>
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-semibold text-navy [&::-webkit-details-marker]:hidden">
                          {item.question}
                          <ChevronRight size={18} className="shrink-0 text-navy/60 transition-transform group-open:rotate-90" />
                        </summary>
                        <p className="pb-4 pr-8 text-sm leading-relaxed text-navy/80">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION: Gửi câu hỏi tư vấn (chuyển tiếp qua Zalo) */}
              <section className="rounded-3xl border border-gray-light/60 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-2">
                  <SectionTitle icon={<HelpCircle size={20} />}>
                    Gửi câu hỏi về sản phẩm
                  </SectionTitle>
                </div>
                <p className="mb-5 text-sm text-navy/75">
                  Để lại số điện thoại và nội dung, chúng tôi mở Zalo với tin nhắn soạn sẵn để bạn gửi ngay cho chuyên viên.
                </p>

                <form onSubmit={handleSendQuestion} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-navy">Số điện thoại</span>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        pattern="[0-9 +().-]{9,15}"
                        title="Vui lòng nhập số điện thoại hợp lệ"
                        placeholder="Ví dụ: 0904 992 267"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="h-11 w-full rounded-xl border border-gray-light bg-white px-3.5 text-base text-navy placeholder:text-navy/45 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 sm:text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-navy">Nội dung cần tư vấn</span>
                      <input
                        type="text"
                        placeholder="Kích thước cửa, báo giá combo..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="h-11 w-full rounded-xl border border-gray-light bg-white px-3.5 text-base text-navy placeholder:text-navy/45 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 sm:text-sm"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {questionSent ? (
                      <span className="text-sm font-medium text-[#3f741b] flex items-start gap-1.5" role="status">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> Đã chép nội dung. Dán (Ctrl/⌘ + V) vào khung chat Zalo vừa mở để gửi.
                      </span>
                    ) : (
                      <span className="text-sm text-navy/70">Thông tin của bạn được bảo mật tuyệt đối.</span>
                    )}
                    <button
                      type="submit"
                      className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0068ff] px-5 text-sm font-semibold text-white hover:bg-[#0056d6] transition-colors shadow-sm cursor-pointer"
                    >
                      <Send size={15} /> Gửi qua Zalo
                    </button>
                  </div>
                </form>
              </section>

            </div>

            {/* RIGHT COLUMN: Technical Specifications Box like Bếp Vũ Sơn (lg:col-span-4) — shown before the article on mobile */}
            <div className="order-first min-w-0 lg:order-none lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-24">
              
                {/* Main Specs Box */}
                <div className="rounded-3xl border border-gray-light/80 bg-white shadow-sm overflow-hidden">
                  <div className="bg-navy px-5 py-4 text-white">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Layers size={18} className="text-brand-green" />
                      Thông số kỹ thuật
                    </h2>
                    <p className="text-xs text-white/75 truncate mt-0.5">{displayName}</p>
                  </div>

                  {/* Zebra Striped Table */}
                  <dl className="divide-y divide-gray-light/60 text-sm">
                    {[
                      { label: "Thương hiệu", value: product.brand || "Chính hãng" },
                      { label: "Mã sản phẩm", value: product.code },
                      { label: "Phân loại", value: product.categoryName || "Thiết bị cao cấp" },
                      { label: "Thời hạn bảo hành", value: warrantyVal, highlight: true },
                      // Dynamic Specs from product.specs with clean key formatting
                      ...displayedSpecs.map(([key, val]) => ({ label: formatSpecKey(key), value: val })),
                    ].map((row, idx) => (
                      <div
                        key={`${row.label}-${idx}`}
                        className={`flex items-start justify-between gap-3 px-4 py-3 ${idx % 2 === 0 ? "bg-[#FAF9F5]" : "bg-white"}`}
                      >
                        <dt className="max-w-[45%] shrink-0 break-words text-navy/75">{row.label}</dt>
                        <dd className={`min-w-0 break-words text-right font-semibold ${"highlight" in row && row.highlight ? "text-[#3f741b]" : "text-navy"}`}>
                          {row.value}
                        </dd>
                      </div>
                    ))}

                    {fullSpecsEntries.length === 0 && (
                      <div className="p-4 text-center text-sm text-navy/70">
                        Thông số đang được cập nhật. Vui lòng liên hệ hotline để nhận catalog kỹ thuật chi tiết.
                      </div>
                    )}
                  </dl>

                  {/* Expand / Collapse Button if many specs */}
                  {fullSpecsEntries.length > 10 && (
                    <div className="border-t border-gray-light/60 bg-[#FAF9F5] text-center">
                      <button
                        type="button"
                        onClick={() => setExpandSpecs(!expandSpecs)}
                        aria-expanded={expandSpecs}
                        className="flex min-h-11 w-full items-center justify-center gap-1 text-sm font-semibold text-[#3f741b] hover:underline cursor-pointer"
                      >
                        {expandSpecs ? "Thu gọn thông số ▲" : `Xem tất cả ${fullSpecsEntries.length} thông số ▼`}
                      </button>
                    </div>
                  )}

                  {/* Genuine Technical Drawing / Blueprint only if available (Clickable for zoom) */}
                  {dimensionImage && (
                    <div className="p-4 border-t border-gray-light/60 bg-white">
                      <h3 className="mb-2 text-sm font-semibold text-navy">
                        Bản vẽ kích thước kỹ thuật
                      </h3>
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
                          <span className="opacity-0 group-hover:opacity-100 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs transition-opacity flex items-center gap-1 shadow-sm">
                            <Maximize2 size={12} /> Phóng to bản vẽ
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Showroom + consultation: one place for "come see it / call us" */}
                <div className="rounded-3xl border border-brand-green/30 bg-brand-green/5 p-5">
                  <h3 className="flex items-center gap-2 text-base font-bold text-navy">
                    <MapPin size={18} className="shrink-0 text-brand-green" />
                    Xem tận tay tại showroom
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/80">
                    Trải nghiệm sản phẩm thực tế, hoặc để kỹ thuật viên {COMPANY_LEGAL.tradeName} khảo sát kích thước tại nhà hoàn toàn miễn phí.
                  </p>
                  <dl className="mt-3 space-y-2 border-t border-brand-green/20 pt-3 text-sm text-navy/80">
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">Địa chỉ</dt>
                      <MapPin size={15} className="mt-0.5 shrink-0 text-brand-green" aria-hidden="true" />
                      <dd>{COMPANY_LEGAL.address}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">Giờ mở cửa</dt>
                      <Clock size={15} className="mt-0.5 shrink-0 text-brand-green" aria-hidden="true" />
                      <dd>{COMPANY_LEGAL.workingHours}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${COMPANY_LEGAL.phoneTel}`}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-navy px-3 text-sm font-semibold text-white hover:bg-[#0b3c54] transition-colors"
                    >
                      <Phone size={15} /> {COMPANY_LEGAL.phone}
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_LEGAL.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-navy/20 bg-white px-3 text-sm font-semibold text-navy hover:border-brand-green hover:text-[#3f741b] transition-colors"
                    >
                      <MapPin size={15} /> Chỉ đường
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Recommendations: keep shoppers browsing instead of ending at the form */}
          <div className="mt-14 space-y-12">
            <RelatedProducts product={product} />
            <RecentlyViewedProducts currentId={product.id} />
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
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-[#c0283a] transition-colors cursor-pointer"
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

      {/* Sticky contact bar on mobile: keeps price + primary actions reachable on a long page */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-light/70 bg-white/95 px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(6,43,61,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-navy/70">{displayName}</p>
            <p className="truncate text-lg font-extrabold leading-tight text-[#c0283a]">{discountInfo.formattedCurrentPrice}</p>
          </div>
          <a
            href={`tel:${COMPANY_LEGAL.phoneTel}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c0283a]/40 text-[#c0283a]"
            aria-label={`Gọi hotline ${COMPANY_LEGAL.phone}`}
          >
            <Phone size={20} />
          </a>
          <a
            href={COMPANY_LEGAL.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#0068ff] px-4 text-sm font-semibold text-white"
          >
            <SiZalo className="h-5 w-5" />
            Tư vấn Zalo
          </a>
        </div>
      </div>

      <SocialFloating className="hidden lg:flex" />
      <AIChatbot launcherClassName="bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:right-6" />
    </div>
  );
}
