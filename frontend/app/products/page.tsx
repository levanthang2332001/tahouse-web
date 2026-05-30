"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ChevronDown, 
  Search, 
  CookingPot, 
  LayoutGrid, 
  Fingerprint, 
  Vault, 
  Flame, 
  Wind, 
  Droplets, 
  Droplet, 
  Microwave, 
  Sparkles, 
  Utensils, 
  Layers, 
  CornerDownRight, 
  Database, 
  Trash2, 
  MoveHorizontal, 
  Boxes, 
  DoorClosed, 
  Columns, 
  Shield, 
  Hotel, 
  Crown, 
  Box, 
  Home, 
  Briefcase 
} from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SocialFloating from "@/components/SocialFloating";
import { PRODUCTS, Product } from "@/data/products";

const BRANDS = [
  { id: "kassler", name: "Kassler", logo: <span className="font-sans font-black tracking-wide text-red-600 italic text-[12px] select-none">KASSLER</span> },
  { id: "bosch", name: "Bosch", logo: <span className="font-sans font-black tracking-tighter text-[#0056A8] text-[14px] select-none">BOSCH</span> },
  { id: "sharp", name: "Sharp", logo: <span className="font-sans font-extrabold tracking-tight text-[#E30613] text-[13px] select-none">SHARP</span> },
  { id: "hubert", name: "Hubert", logo: <span className="font-serif font-black tracking-normal text-neutral-800 italic text-[13px] select-none">Hubert</span> },
  { id: "hyundai", name: "Huyndai", logo: <span className="font-sans font-bold tracking-widest text-[#002c5f] italic text-[10px] select-none">HUYNDAI</span> },
  { id: "philips", name: "Philips", logo: <span className="font-sans font-extrabold tracking-widest text-[#0066a1] text-[10px] select-none">PHILIPS</span> },
];

// Define sections and categories structure exactly matching the user's design image
const SIDEBAR_SECTIONS = [
  {
    id: "khoa-dien-tu",
    title: "KHÓA ĐIỆN TỬ",
    icon: Fingerprint,
    categoryId: "lock-parent",
    subcategories: [
      { id: "cua-go", name: "Khóa cửa gỗ", icon: DoorClosed },
      { id: "xingfa-sat", name: "Khóa nhôm kính", icon: Columns },
      { id: "cua-cong", name: "Khóa cửa cổng", icon: Shield },
      { id: "khach-san", name: "Khóa khách sạn", icon: Hotel },
      { id: "dai-sanh", name: "Khóa đại sảnh", icon: Crown },
    ]
  },
  {
    id: "ket-sat-thong-minh",
    title: "KẾT SẮT THÔNG MINH",
    icon: Vault,
    categoryId: "Smart",
    subcategories: [
      { id: "ket-mini", name: "Két mini", icon: Box },
      { id: "ket-gia-dinh", name: "Két gia đình", icon: Home },
      { id: "ket-van-phong", name: "Két văn phòng", icon: Briefcase },
    ]
  },
  {
    id: "thiet-bi-bep",
    title: "THIẾT BỊ BẾP",
    icon: CookingPot,
    categoryId: "Kitchen",
    subcategories: [
      { id: "bep-tu", name: "Bếp từ", icon: Flame },
      { id: "may-hut-mui", name: "Máy hút mùi", icon: Wind },
      { id: "chau-rua", name: "Chậu rửa", icon: Droplets },
      { id: "voi-rua", name: "Vòi rửa", icon: Droplet },
      { id: "lo-nuong", name: "Lò nướng", icon: Microwave },
      { id: "may-rua-chen", name: "Máy rửa chén", icon: Sparkles },
      { id: "thiet-bi-bep-khac", name: "Thiết bị bếp khác", icon: Utensils },
    ]
  },
  {
    id: "phu-kien-tu-bep",
    title: "PHỤ KIỆN TỦ BẾP",
    icon: LayoutGrid,
    categoryId: "Cabinet",
    subcategories: [
      { id: "gia-bat-nang-ha", name: "Giá bát nâng hạ", icon: Layers },
      { id: "ke-goc-lien-hoan", name: "Kệ góc liên hoàn", icon: CornerDownRight },
      { id: "thung-gao", name: "Thùng gạo", icon: Database },
      { id: "thung-rac-am-tu", name: "Thùng rác âm tủ", icon: Trash2 },
      { id: "ray-truot", name: "Ray trượt", icon: MoveHorizontal },
      { id: "phu-kien-khac", name: "Phụ kiện khác", icon: Boxes },
    ]
  },
  {
    id: "loc-nuoc",
    title: "LỌC NƯỚC",
    icon: Droplets,
    categoryId: "Water",
    subcategories: [
      { id: "may-loc-nuoc-ro", name: "Máy lọc nước R.O", icon: Sparkles },
      { id: "may-loc-nuoc-ion-kiem", name: "Máy lọc nước ion kiềm", icon: Droplet },
      { id: "loc-tong-sinh-hoat", name: "Hệ thống lọc tổng", icon: Database },
      { id: "loi-loc-phu-kien", name: "Lõi lọc & Phụ kiện", icon: Boxes },
    ]
  }
];

// Smart subcategory matching helper for existing products
const matchesSubcategory = (product: Product, subcatId: string) => {
  const name = product.name.toLowerCase();
  
  switch (subcatId) {
    // THIẾT BỊ BẾP (category: Kitchen)
    case "bep-tu":
      return product.category === "Kitchen" && name.includes("bếp từ");
    case "may-hut-mui":
      return product.category === "Kitchen" && name.includes("hút mùi");
    case "chau-rua":
      return product.category === "Kitchen" && name.includes("chậu rửa");
    case "voi-rua":
      return product.category === "Kitchen" && name.includes("vòi rửa");
    case "lo-nuong":
      return product.category === "Kitchen" && name.includes("lò nướng");
    case "may-rua-chen":
      return product.category === "Kitchen" && name.includes("rửa chén");
    case "thiet-bi-bep-khac":
      return product.category === "Kitchen" && 
        !name.includes("bếp từ") && 
        !name.includes("hút mùi") && 
        !name.includes("chậu rửa") && 
        !name.includes("vòi rửa") && 
        !name.includes("lò nướng") && 
        !name.includes("rửa chén");

    // PHỤ KIỆN TỦ BẾP (category: Cabinet)
    case "gia-bat-nang-ha":
      return product.category === "Cabinet" && (name.includes("giá bát") || name.includes("nâng hạ"));
    case "ke-goc-lien-hoan":
      return product.category === "Cabinet" && name.includes("góc");
    case "thung-gao":
      return product.category === "Cabinet" && name.includes("gạo");
    case "thung-rac-am-tu":
      return product.category === "Cabinet" && name.includes("rác");
    case "ray-truot":
      return product.category === "Cabinet" && name.includes("ray");
    case "phu-kien-khac":
      return product.category === "Cabinet" && 
        !name.includes("giá bát") && !name.includes("nâng hạ") &&
        !name.includes("góc") && 
        !name.includes("gạo") && 
        !name.includes("rác") && 
        !name.includes("ray");

    // KHÓA ĐIỆN TỬ
    case "cua-go":
      return product.category === "cua-go";
    case "xingfa-sat":
      return product.category === "xingfa-sat" || product.category === "cua-kinh";
    case "cua-cong":
      return product.category === "cua-cong";
    case "khach-san":
      return product.category === "khach-san";
    case "dai-sanh":
      return product.category === "dai-sanh";

    // KẾT SẮT THÔNG MINH
    case "ket-mini":
      return product.category === "Smart" && name.includes("mini");
    case "ket-gia-dinh":
      return product.category === "Smart" && name.includes("gia đình");
    case "ket-van-phong":
      return product.category === "Smart" && name.includes("văn phòng");

    // LỌC NƯỚC (category: Water)
    case "may-loc-nuoc-ro":
      return product.category === "Water" && (name.includes("ro") || name.includes("r.o") || name.includes("smith") || name.includes("lọc nước"));
    case "may-loc-nuoc-ion-kiem":
      return product.category === "Water" && (name.includes("kiềm") || name.includes("ion"));
    case "loc-tong-sinh-hoat":
      return product.category === "Water" && name.includes("tổng");
    case "loi-loc-phu-kien":
      return product.category === "Water" && (name.includes("lõi") || name.includes("phụ kiện"));
    
    default:
      return false;
  }
};

function ProductListContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") || "all";
  const qParam = searchParams.get("q") || "";

  const [prevCatParam, setPrevCatParam] = useState(catParam);
  const [prevQParam, setPrevQParam] = useState(qParam);
  const [filter, setFilter] = useState(catParam);
  const [search, setSearch] = useState(qParam);

  if (catParam !== prevCatParam) {
    setPrevCatParam(catParam);
    setFilter(catParam);
  }
  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearch(qParam);
  }

  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Dual-range price filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(40000000);
  const [tempMinPrice, setTempMinPrice] = useState(0);
  const [tempMaxPrice, setTempMaxPrice] = useState(40000000);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Keep track of which accordion section is expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "khoa-dien-tu": true,
    "ket-sat-thong-minh": false,
    "thiet-bi-bep": true,
    "phu-kien-tu-bep": false,
    "loc-nuoc": false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSubcategoryClick = (subcatId: string) => {
    setFilter(subcatId);
    setSelectedBrand("all");
  };

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let animationFrameId: number;
    let targetScrollTop = panel.scrollTop;
    let currentScrollTop = panel.scrollTop;
    const speed = 0.14; // Smooth scrolling speed factor (higher is faster/snappier)

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = panel.scrollHeight - panel.clientHeight;
      if (maxScroll <= 0) return;

      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;

      // Allow native page scrolling if we are at top/bottom limits
      if ((isScrollingUp && panel.scrollTop === 0) || (isScrollingDown && Math.ceil(panel.scrollTop) >= maxScroll)) {
        return;
      }

      e.preventDefault();
      targetScrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop + e.deltaY * 1.35));

      const animate = () => {
        const diff = targetScrollTop - currentScrollTop;
        if (Math.abs(diff) > 0.5) {
          currentScrollTop += diff * speed;
          panel.scrollTop = currentScrollTop;
          animationFrameId = requestAnimationFrame(animate);
        } else {
          currentScrollTop = targetScrollTop;
          panel.scrollTop = targetScrollTop;
        }
      };

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(animate);
    };

    panel.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      panel.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const filteredProducts = useMemo(
    () => {
      const lockSubcategories = ["dai-sanh", "cua-go", "cua-kinh", "xingfa-sat", "cua-cong", "khach-san"];
      const filtered = PRODUCTS.filter((product) => {
        // Base category filtering with our smart mapping support
        let matchesFilter = false;

        if (filter === "all") {
          matchesFilter = true;
        } else if (filter === "Kitchen") {
          matchesFilter = product.category === "Kitchen";
        } else if (filter === "Cabinet") {
          matchesFilter = product.category === "Cabinet";
        } else if (filter === "lock-parent" || filter === "Lock") {
          matchesFilter = lockSubcategories.includes(product.category) || product.category === "Lock";
        } else if (filter === "Smart") {
          matchesFilter = product.category === "Smart";
        } else if (filter === "Water") {
          matchesFilter = product.category === "Water";
        } else {
          // If filtering by specific subcategory ID
          matchesFilter = matchesSubcategory(product, filter);
        }

        const term = search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term);

        const matchesBrand =
          selectedBrand === "all" ||
          (selectedBrand === "kassler" && (product.code.toLowerCase().includes("kassler") || product.name.toLowerCase().includes("kassler"))) ||
          (selectedBrand === "bosch" && (product.code.toLowerCase().includes("bosch") || product.name.toLowerCase().includes("bosch"))) ||
          (selectedBrand === "sharp" && (product.code.toLowerCase().includes("sharp") || product.name.toLowerCase().includes("sharp"))) ||
          (selectedBrand === "hubert" && (product.code.toLowerCase().includes("hubert") || product.name.toLowerCase().includes("hubert"))) ||
          (selectedBrand === "hyundai" && (
            product.code.toLowerCase().includes("huyndai") || 
            product.name.toLowerCase().includes("huyndai") ||
            product.code.toLowerCase().includes("hyundai") ||
            product.name.toLowerCase().includes("hyundai")
          )) ||
          (selectedBrand === "philips" && (product.code.toLowerCase().includes("philips") || product.name.toLowerCase().includes("philips")));

        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesFilter && matchesSearch && matchesBrand && matchesPrice;
      });

      if (sortBy === "price-asc") {
        return [...filtered].sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-desc") {
        return [...filtered].sort((a, b) => b.price - a.price);
      }
      return filtered;
    },
    [filter, search, selectedBrand, minPrice, maxPrice, sortBy],
  );

  return (
    <div className="min-h-screen bg-neutral pb-24 pt-10">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-brand-green" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
              BỘ SƯU TẬP TA HOUSE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-semibold leading-snug text-navy md:text-5xl">
            Khám phá hệ sinh thái <br />
            <span className="font-bold italic text-brand-green">thiết bị & khóa thông minh</span>
          </h1>
          <div className="flex flex-col items-stretch justify-between gap-6 pt-4 xl:flex-row xl:items-center">
            <div className="relative w-full shrink-0 md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                placeholder="Tìm sản phẩm, model..."
                className="w-full rounded-xl border border-gray-light bg-cream py-3.5 pl-12 pr-4 text-xs text-navy transition-all focus:border-brand-green focus:outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {/* Brands Logo filter bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mr-1 hidden sm:block">
                Thương hiệu:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedBrand("all");
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 h-10 flex items-center justify-center ${
                    selectedBrand === "all"
                      ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                      : "bg-cream border border-gray-light/60 text-navy/60 hover:text-brand-green hover:border-brand-green/30 shadow-xs"
                  }`}
                >
                  Tất cả
                </button>
                {BRANDS.map((brand) => {
                  const isActive = selectedBrand === brand.id;
                  return (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setSelectedBrand(brand.id);
                        setFilter("all");
                      }}
                      className={`cursor-pointer flex items-center justify-center rounded-xl bg-white border px-4 py-2 transition-all duration-300 h-10 min-w-[95px] shadow-xs hover:scale-102 hover:shadow-sm ${
                        isActive
                          ? "border-brand-green ring-2 ring-brand-green/10 shadow-sm"
                          : "border-gray-light/60 hover:border-brand-green/30"
                      }`}
                    >
                      {brand.logo}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left Sidebar Panel */}
          <aside className="w-full shrink-0 lg:w-80 lg:sticky lg:top-28">
            {/* Desktop Vertical Categories with Hierarchy (Unified Card) */}
            <div 
              ref={panelRef}
              data-lenis-prevent
              className="hidden lg:block border border-gray-light/35 rounded-3xl bg-white lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto invisible-scrollbar divide-y divide-gray-light/35 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              {/* 1. Tất cả sản phẩm Row */}
              <button
                onClick={() => {
                  setFilter("all");
                  setSelectedBrand("all");
                }}
                className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors cursor-pointer select-none ${
                  filter === "all"
                    ? "bg-brand-green/[0.02] text-brand-green font-bold"
                    : "hover:bg-neutral/20 text-navy"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Search className="text-brand-green shrink-0" size={18} />
                  <span className={`text-[11px] font-extrabold tracking-wider uppercase transition-colors ${
                    filter === "all" ? "text-brand-green" : "text-navy"
                  }`}>
                    Tất cả sản phẩm
                  </span>
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    filter === "all"
                      ? "bg-brand-green text-white"
                      : "bg-neutral text-navy/40"
                  }`}
                >
                  {PRODUCTS.length}
                </span>
              </button>

              {/* 2. Accordions */}
              {SIDEBAR_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections[section.id];
                const isParentActive = filter === section.categoryId || 
                  section.subcategories.some(sub => filter === sub.id);
                
                return (
                  <div key={section.id} className="flex flex-col">
                    {/* Accordion Header */}
                    <button
                      onClick={() => {
                        toggleSection(section.id);
                        setFilter(section.categoryId);
                        setSelectedBrand("all");
                      }}
                      className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors cursor-pointer select-none ${
                        isParentActive ? "bg-brand-green/[0.02]" : "hover:bg-neutral/20"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <SectionIcon className="text-brand-green shrink-0" size={18} />
                        <span className={`text-[11px] font-extrabold tracking-wider text-navy uppercase transition-colors ${
                          isParentActive ? "text-brand-green" : "text-navy"
                        }`}>
                          {section.title}
                        </span>
                      </span>
                      <ChevronDown
                        size={15}
                        className={`text-navy/45 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Accordion Content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                          }}
                          transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden bg-cream/35 border-t border-gray-light/20"
                        >
                          <div className="p-2 flex flex-col gap-1">
                            {section.subcategories.map((sub) => {
                              const SubIcon = sub.icon;
                              const isActive = filter === sub.id;
                              
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => handleSubcategoryClick(sub.id)}
                                  className={`group flex w-full items-center gap-3 rounded-xl px-4.5 py-3 text-left transition-all duration-200 cursor-pointer ${
                                    isActive
                                      ? "bg-brand-green/10 text-brand-green font-bold shadow-xs"
                                      : "text-navy/75 hover:bg-neutral/40 hover:text-brand-green font-medium"
                                  }`}
                                >
                                  <SubIcon className="text-brand-green shrink-0" size={14} />
                                  <span className="text-[13px] tracking-wide truncate">{sub.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Mobile Horizontal Scrollable Categories with Matching Icons */}
            <div className="lg:hidden w-full overflow-hidden mb-4">
              <div className="invisible-scrollbar flex gap-2.5 overflow-x-auto pb-3 p-1">
                {/* 1. All Products */}
                <button
                  onClick={() => {
                    setFilter("all");
                    setSelectedBrand("all");
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                    filter === "all"
                      ? "bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20"
                      : "bg-white border-gray-light/50 text-navy/70"
                  }`}
                >
                  <Search size={14} className={filter === "all" ? "text-white" : "text-brand-green"} />
                  <span>Tất cả</span>
                </button>

                {/* 2. Main Sections */}
                {SIDEBAR_SECTIONS.map((section) => {
                  const SectionIcon = section.icon;
                  const isActive = filter === section.categoryId || 
                    section.subcategories.some(sub => filter === sub.id);
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setFilter(section.categoryId);
                        setSelectedBrand("all");
                        // Expand this section in desktop in case they resize
                        setExpandedSections(prev => ({
                          ...prev,
                          [section.id]: true
                        }));
                      }}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                        isActive
                          ? "bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20"
                          : "bg-white border-gray-light/50 text-navy/70"
                      }`}
                    >
                      <SectionIcon size={14} className={isActive ? "text-white" : "text-brand-green"} />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="flex-1">
            {/* Grid Header with Counts and Dropdowns */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-[13px] font-semibold text-navy/75 leading-none">
                {filteredProducts.length > 0 ? (
                  <>
                    Hiển thị <span className="text-navy font-extrabold">1–{filteredProducts.length}</span> trong <span className="text-navy font-extrabold">{filteredProducts.length}</span> sản phẩm
                  </>
                ) : (
                  "Hiển thị 0 trong 0 sản phẩm"
                )}
              </div>

              {/* Dropdown Filters matching the screenshot */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Khoảng giá slider dropdown button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!isPriceDropdownOpen) {
                        setTempMinPrice(minPrice);
                        setTempMaxPrice(maxPrice);
                      }
                      setIsPriceDropdownOpen(!isPriceDropdownOpen);
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-300 shadow-xs cursor-pointer select-none ${
                      isPriceDropdownOpen || minPrice > 0 || maxPrice < 40000000
                        ? "border-brand-green text-brand-green bg-brand-green/5"
                        : "border-gray-light/60 bg-white text-navy/80 hover:text-brand-green hover:border-brand-green/30"
                    }`}
                  >
                    <span>
                      {minPrice === 0 && maxPrice === 40000000
                        ? "Khoảng giá"
                        : `Giá: ${(minPrice / 1000000).toFixed(0)}tr – ${(maxPrice / 1000000).toFixed(0)}tr`}
                    </span>
                    <ChevronDown size={13} className={`mt-0.5 shrink-0 transition-transform duration-200 ${
                      isPriceDropdownOpen ? "rotate-180 text-brand-green" : "text-navy/40"
                    }`} />
                  </button>

                  <AnimatePresence>
                    {isPriceDropdownOpen && (
                      <>
                        {/* Invisible overlay backdrop for outside click close */}
                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsPriceDropdownOpen(false)} />
                        
                        {/* Dropdown content */}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 sm:left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-gray-light/80 bg-white p-4.5 shadow-lg flex flex-col"
                        >
                          <span className="text-[11px] font-bold text-navy/50 uppercase tracking-widest mb-3">
                            Chọn khoảng giá
                          </span>

                          {/* Live Min Max Price Labels */}
                          <div className="flex items-center justify-between text-xs text-navy/80 font-bold mb-3 bg-neutral/35 p-2 rounded-xl border border-gray-light/20">
                            <div>
                              <span className="text-navy/45 font-medium block text-[9px] uppercase tracking-wider">Từ:</span>
                              <span className="text-[13px]">{tempMinPrice.toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div className="h-4 w-px bg-gray-light" />
                            <div className="text-right">
                              <span className="text-navy/45 font-medium block text-[9px] uppercase tracking-wider">Đến:</span>
                              <span className="text-[13px]">{tempMaxPrice.toLocaleString("vi-VN")}đ</span>
                            </div>
                          </div>

                          {/* Double-Range Slider Bar Component */}
                          <div className="range-slider-container relative w-full h-8 flex items-center mt-2.5">
                            {/* Track bar background */}
                            <div className="absolute w-full h-1.5 bg-neutral rounded-full pointer-events-none" />
                            
                            {/* Highlighting active slider track bar */}
                            <div 
                              className="absolute h-1.5 bg-brand-green rounded-full pointer-events-none"
                              style={{
                                left: `${(tempMinPrice / 40000000) * 100}%`,
                                right: `${100 - (tempMaxPrice / 40000000) * 100}%`
                              }}
                            />

                            {/* Dual Inputs */}
                            <input 
                              type="range"
                              min={0}
                              max={40000000}
                              step={500000}
                              value={tempMinPrice}
                              onChange={(e) => {
                                const val = Math.min(Number(e.target.value), tempMaxPrice - 1000000);
                                setTempMinPrice(val);
                              }}
                              className="absolute pointer-events-none appearance-none w-full h-1.5 bg-transparent outline-none z-20"
                            />
                            
                            <input 
                              type="range"
                              min={0}
                              max={40000000}
                              step={500000}
                              value={tempMaxPrice}
                              onChange={(e) => {
                                const val = Math.max(Number(e.target.value), tempMinPrice + 1000000);
                                setTempMaxPrice(val);
                              }}
                              className="absolute pointer-events-none appearance-none w-full h-1.5 bg-transparent outline-none z-20"
                            />
                          </div>

                          <div className="text-[10px] text-navy/40 italic text-center mt-1 select-none">
                            Kéo hai nút tròn để lọc theo khoảng giá
                          </div>

                          {/* Reset and Apply Buttons */}
                          <div className="flex items-center gap-2 mt-4.5 pt-3 border-t border-gray-light/35">
                            <button
                              onClick={() => {
                                setTempMinPrice(0);
                                setTempMaxPrice(40000000);
                                setMinPrice(0);
                                setMaxPrice(40000000);
                              }}
                              className="flex-1 rounded-xl border border-gray-light bg-neutral/35 py-2 text-center text-xs font-bold text-navy hover:bg-neutral/70 transition-all cursor-pointer"
                            >
                              Thiết lập lại
                            </button>
                            <button
                              onClick={() => {
                                setMinPrice(tempMinPrice);
                                setMaxPrice(tempMaxPrice);
                                setIsPriceDropdownOpen(false);
                              }}
                              className="flex-1 rounded-xl bg-brand-green py-2 text-center text-xs font-bold text-white hover:bg-lime-dark shadow-xs transition-all cursor-pointer"
                            >
                              Áp dụng
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Sắp xếp dropdown button */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-300 shadow-xs cursor-pointer select-none ${
                      isSortDropdownOpen || sortBy !== "newest"
                        ? "border-brand-green text-brand-green bg-brand-green/5"
                        : "border-gray-light/60 bg-white text-navy/80 hover:text-brand-green hover:border-brand-green/30"
                    }`}
                  >
                    <span>
                      {sortBy === "newest" && "Sắp xếp: Mới nhất"}
                      {sortBy === "price-asc" && "Giá từ thấp tới cao"}
                      {sortBy === "price-desc" && "Giá từ cao tới thấp"}
                    </span>
                    <ChevronDown size={13} className={`mt-0.5 shrink-0 transition-transform duration-200 ${
                      isSortDropdownOpen ? "rotate-180 text-brand-green" : "text-navy/40"
                    }`} />
                  </button>

                  <AnimatePresence>
                    {isSortDropdownOpen && (
                      <>
                        {/* Invisible overlay backdrop for outside click close */}
                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsSortDropdownOpen(false)} />
                        
                        {/* Dropdown content */}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-gray-light/80 bg-white p-2 shadow-lg flex flex-col gap-1"
                        >
                          <button
                            onClick={() => {
                              setSortBy("newest");
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              sortBy === "newest"
                                ? "bg-brand-green/10 text-brand-green"
                                : "text-navy/85 hover:bg-neutral hover:text-brand-green"
                            }`}
                          >
                            Mới nhất
                          </button>
                          <button
                            onClick={() => {
                              setSortBy("price-asc");
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              sortBy === "price-asc"
                                ? "bg-brand-green/10 text-brand-green"
                                : "text-navy/85 hover:bg-neutral hover:text-brand-green"
                            }`}
                          >
                            Giá từ thấp tới cao
                          </button>
                          <button
                            onClick={() => {
                              setSortBy("price-desc");
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              sortBy === "price-desc"
                                ? "bg-brand-green/10 text-brand-green"
                                : "text-navy/85 hover:bg-neutral hover:text-brand-green"
                            }`}
                          >
                            Giá từ cao tới thấp
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-gray-light bg-cream/40 py-28 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                  <Search size={28} />
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold text-navy">
                  Chưa tìm thấy thiết bị phù hợp
                </h3>
                <p className="mx-auto max-w-md text-xs font-medium leading-relaxed text-navy/60">
                  Bạn vui lòng thay đổi từ khóa tìm kiếm hoặc liên hệ hotline để nhận catalog đầy đủ.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductListPage() {
  return (
    <div className="min-h-screen bg-neutral text-navy">
      <Header />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-bold text-brand-green">Đang tải danh mục thiết bị...</div>}>
        <ProductListContent />
      </Suspense>
      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
