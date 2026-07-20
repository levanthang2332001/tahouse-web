"use client";

import React, { Suspense, startTransition, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ChevronDown, 
  Search, 
  Fingerprint, 
  Vault, 
  DoorClosed, 
  Columns, 
  Shield, 
  Hotel, 
  Crown, 
  Box, 
  Home, 
  Briefcase,
} from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import BrandLogo from "@/components/BrandLogo";
import SocialFloating from "@/components/SocialFloating";
import { fetchBrands, fetchProducts } from "@/lib/api/products";
import { mapFilterToApiParams } from "@/lib/product-filters";
import type { Brand, Product } from "@/lib/types/product";
import { MAX_PRODUCT_PRICE } from "@/lib/types/product";

const GRID_COLUMNS = 3;
const PAGE_SIZE = GRID_COLUMNS * 7; // 21 sản phẩm = 7 hàng × 3 cột

function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-light bg-white animate-pulse">
      <div className="aspect-[1.4] w-full bg-neutral/45" />
      <div className="flex flex-col gap-3 p-4.5">
        <div className="h-2 w-16 rounded bg-neutral/40" />
        <div className="h-4 w-full rounded bg-neutral/45" />
        <div className="h-3 w-4/5 rounded bg-neutral/35" />
        <div className="h-3 w-3/5 rounded bg-neutral/35" />
        <div className="mt-2 h-5 w-24 rounded bg-neutral/45" />
        <div className="mt-4 h-10 w-full rounded-xl bg-neutral/40" />
      </div>
    </div>
  );
}

function isUnfilteredCatalogView(
  filter: string,
  selectedBrand: string,
  debouncedSearch: string,
  minPrice: number,
  maxPrice: number,
) {
  return (
    filter === "all" &&
    selectedBrand === "all" &&
    !debouncedSearch.trim() &&
    minPrice === 0 &&
    maxPrice === MAX_PRODUCT_PRICE
  );
}

// Define sections and categories structure exactly matching the user's design image
const SIDEBAR_SECTIONS = [
  {
    id: "khoa-dien-tu",
    title: "KHÓA ĐIỆN TỬ",
    icon: Fingerprint,
    categoryId: "lock-parent",
    subcategories: [
      { id: "cua-go", name: "Khóa cửa gỗ", icon: DoorClosed },
      { id: "cua-kinh", name: "Khóa cửa kính", icon: DoorClosed },
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
  }
];

function ProductListContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") || "all";
  const qParam = searchParams.get("q") || "";

  const [prevCatParam, setPrevCatParam] = useState(catParam);
  const [prevQParam, setPrevQParam] = useState(qParam);
  const [filter, setFilter] = useState(catParam);
  const [search, setSearch] = useState(qParam);
  const [page, setPage] = useState(1);

  if (catParam !== prevCatParam) {
    setPrevCatParam(catParam);
    setFilter(catParam);
    setPage(1);
  }
  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearch(qParam);
    setPage(1);
  }

  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(qParam);

  // Dual-range price filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRODUCT_PRICE);
  const [tempMinPrice, setTempMinPrice] = useState(0);
  const [tempMaxPrice, setTempMaxPrice] = useState(MAX_PRODUCT_PRICE);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Keep track of which accordion section is expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "khoa-dien-tu": true,
    "ket-sat-thong-minh": false,
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
    setPage(1);
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (search !== prev) {
          setPage(1);
        }
        return search;
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const apiFilter = mapFilterToApiParams(filter);
    const isLoadMore = page > 1;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      startTransition(() => {
        setLoading(true);
        setFetchError(null);
      });
    }

    fetchProducts({
      page,
      limit: PAGE_SIZE,
      ...apiFilter,
      brand: selectedBrand === "all" ? undefined : selectedBrand,
      search: debouncedSearch.trim() || undefined,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < MAX_PRODUCT_PRICE ? maxPrice : undefined,
      sortBy,
    })
      .then((data) => {
        if (cancelled) return;

        const maxPage = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
        if (page > maxPage) {
          setPage(maxPage);
          return;
        }

        setProducts((prev) => {
          if (page === 1) return data.items;
          const existingIds = new Set(prev.map((item) => item.id));
          return [...prev, ...data.items.filter((item) => !existingIds.has(item.id))];
        });
        setTotal(data.total);

        if (
          isUnfilteredCatalogView(
            filter,
            selectedBrand,
            debouncedSearch,
            minPrice,
            maxPrice,
          )
        ) {
          setCatalogTotal(data.total);
        } else if (catalogTotal === 0) {
          fetchProducts({ page: 1, limit: 1 })
            .then((catalog) => {
              if (!cancelled) setCatalogTotal(catalog.total);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (page === 1) {
          setProducts([]);
          setTotal(0);
        }
        setFetchError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, filter, selectedBrand, debouncedSearch, minPrice, maxPrice, sortBy]);

  const remaining = Math.max(0, total - products.length);
  const hasMore = remaining > 0;

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    setPage((prev) => prev + 1);
  };

  const gridPlaceholders =
    products.length > 0
      ? (GRID_COLUMNS - (products.length % GRID_COLUMNS)) % GRID_COLUMNS
      : 0;

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
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 h-10 flex items-center justify-center ${
                    selectedBrand === "all"
                      ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                      : "bg-cream border border-gray-light/60 text-navy/60 hover:text-brand-green hover:border-brand-green/30 shadow-xs"
                  }`}
                >
                  Tất cả
                </button>
                {brands.map((brand) => {
                  const isActive = selectedBrand === brand.slug;
                  return (
                    <button
                      key={brand.slug}
                      onClick={() => {
                        setSelectedBrand(brand.slug);
                        setFilter("all");
                        setPage(1);
                      }}
                      className={`cursor-pointer flex items-center justify-center rounded-xl bg-white border px-4 py-2 transition-all duration-300 h-10 min-w-[95px] shadow-xs hover:scale-102 hover:shadow-sm ${
                        isActive
                          ? "border-brand-green ring-2 ring-brand-green/10 shadow-sm"
                          : "border-gray-light/60 hover:border-brand-green/30"
                      }`}
                    >
                      <BrandLogo brand={brand} />
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
                  setPage(1);
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
                  {catalogTotal || total}
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
                        setPage(1);
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
                    setPage(1);
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
                        setPage(1);
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
          <div className="flex-1" ref={gridRef}>
            {/* Grid Header with Counts and Dropdowns */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-[13px] font-semibold text-navy/75 leading-none">
                {loading && products.length === 0 ? (
                  "Đang tải sản phẩm..."
                ) : total > 0 ? (
                  <>
                    Hiển thị <span className="text-navy font-extrabold">{products.length}</span> trong <span className="text-navy font-extrabold">{total}</span> sản phẩm
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
                      isPriceDropdownOpen || minPrice > 0 || maxPrice < MAX_PRODUCT_PRICE
                        ? "border-brand-green text-brand-green bg-brand-green/5"
                        : "border-gray-light/60 bg-white text-navy/80 hover:text-brand-green hover:border-brand-green/30"
                    }`}
                  >
                    <span>
                      {minPrice === 0 && maxPrice === MAX_PRODUCT_PRICE
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
                                left: `${(tempMinPrice / MAX_PRODUCT_PRICE) * 100}%`,
                                right: `${100 - (tempMaxPrice / MAX_PRODUCT_PRICE) * 100}%`
                              }}
                            />

                            {/* Dual Inputs */}
                            <input 
                              type="range"
                              min={0}
                              max={MAX_PRODUCT_PRICE}
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
                              max={MAX_PRODUCT_PRICE}
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
                                setTempMaxPrice(MAX_PRODUCT_PRICE);
                                setMinPrice(0);
                                setMaxPrice(MAX_PRODUCT_PRICE);
                                setPage(1);
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
                                setPage(1);
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
                              setPage(1);
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
                              setPage(1);
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
                              setPage(1);
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

            {fetchError && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {fetchError}
              </div>
            )}

            <div
              className={`grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 md:items-stretch ${
                loading && products.length > 0 ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {loading && products.length === 0 ? (
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ProductCardSkeleton key={`skeleton-${index}`} />
                ))
              ) : (
                <>
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < GRID_COLUMNS}
                    />
                  ))}
                  {Array.from({ length: gridPlaceholders }).map((_, index) => (
                    <div
                      key={`grid-placeholder-${index}`}
                      className="hidden md:block"
                      aria-hidden="true"
                    />
                  ))}
                </>
              )}
            </div>

            {hasMore && (
              <div className="mt-12">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading || loadingMore}
                  className="group flex min-h-14 w-full items-center justify-center rounded-2xl border border-brand-green/35 bg-brand-green/8 px-6 text-[15px] font-black tracking-wide text-lime-dark shadow-sm shadow-brand-green/5 transition-all hover:-translate-y-0.5 hover:border-brand-green/60 hover:bg-brand-green/12 hover:text-lime-dark hover:shadow-md hover:shadow-brand-green/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loadingMore ? "Đang tải..." : `Xem thêm (${remaining})`}
                </button>
              </div>
            )}

            {!loading && products.length === 0 && !fetchError && (
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
