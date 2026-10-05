"use client";

import React, { Suspense, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ListFilter, Search, X } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import BrandLogo from "@/components/BrandLogo";
import SocialFloating from "@/components/SocialFloating";
import { getCategoryLabel, SIDEBAR_SECTIONS, buildSidebarSectionsFromBrands } from "@/data/catalog-taxonomy";
import { getProductListKey } from "@/lib/backend/map-product";
import { fetchBrands, fetchProducts } from "@/lib/api/products";
import { filterBrandsForCategory, mapFilterToApiParams } from "@/lib/product-filters";
import type { Brand, Product } from "@/lib/types/product";
import { MAX_PRODUCT_PRICE } from "@/lib/types/product";
import type { CatalogSection } from "@/data/catalog-taxonomy";

const GRID_COLUMNS = 3;
const PAGE_SIZE = GRID_COLUMNS * 7; // 21 sản phẩm = 7 hàng × 3 cột

function getActiveCatalogLabel(
  filter: string,
  sections: CatalogSection[] = SIDEBAR_SECTIONS,
): string {
  if (filter === "all") return "Tất cả sản phẩm";
  for (const section of sections) {
    if (section.categoryId === filter) return section.title;
    const sub = section.subcategories.find((item) => item.id === filter);
    if (sub) return sub.name;
  }
  return getCategoryLabel(filter);
}

function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-light bg-white animate-pulse">
      <div className="aspect-[1.35] w-full bg-neutral/45" />
      <div className="flex flex-col gap-2.5 p-4 sm:p-4.5">
        <div className="flex justify-between items-center">
          <div className="h-2.5 w-16 rounded bg-neutral/40" />
          <div className="h-2.5 w-12 rounded bg-neutral/35" />
        </div>
        <div className="h-4.5 w-full rounded bg-neutral/45" />
        <div className="h-4 w-3/4 rounded bg-neutral/45" />
        <div className="space-y-1.5 my-1">
          <div className="h-3 w-4/5 rounded bg-neutral/35" />
          <div className="h-3 w-3/5 rounded bg-neutral/35" />
        </div>
        <div className="h-16 w-full rounded-2xl bg-neutral/30" />
        <div className="h-7 w-full rounded-xl bg-neutral/30" />
        <div className="mt-2 h-10 w-full rounded-xl bg-neutral/40" />
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SIDEBAR_SECTIONS.map((section, index) => [section.id, index === 0])),
  );
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const sidebarSections = useMemo(
    () => buildSidebarSectionsFromBrands(brands),
    [brands],
  );

  useEffect(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      let changed = false;
      sidebarSections.forEach((section, index) => {
        if (next[section.id] === undefined) {
          next[section.id] = index === 0 && Object.keys(prev).length === 0;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [sidebarSections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingScrollToGridRef = useRef(false);

  const scrollToProductGrid = (immediate = false) => {
    const el = gridRef.current;
    if (!el) return;

    const headerOffset = 112;
    const lenis = (
      window as Window & {
        __lenis?: {
          scrollTo: (
            target: HTMLElement | number,
            options?: { offset?: number; immediate?: boolean },
          ) => void;
        };
      }
    ).__lenis;

    if (lenis) {
      lenis.scrollTo(el, { offset: -headerOffset, immediate });
      return;
    }

    const top = window.scrollY + el.getBoundingClientRect().top - headerOffset;
    window.scrollTo({
      top: Math.max(0, top),
      left: 0,
      behavior: immediate ? "auto" : "smooth",
    });
  };

  const handleSubcategoryClick = (subcatId: string) => {
    pendingScrollToGridRef.current = true;
    setFilter(subcatId);
    setSelectedBrand("all");
    setPage(1);
    scrollToProductGrid(false);
  };

  // Sau khi danh mục đổi và sản phẩm render xong → căn lại vị trí lưới (tránh rơi xuống footer)
  useEffect(() => {
    if (!pendingScrollToGridRef.current || loading) return;
    pendingScrollToGridRef.current = false;
    const raf = requestAnimationFrame(() => scrollToProductGrid(true));
    return () => cancelAnimationFrame(raf);
  }, [filter, loading, products]);

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

  const visibleBrands = filterBrandsForCategory(brands, filter);

  // Đổi danh mục → bỏ brand không còn thuộc nhóm đó
  useEffect(() => {
    if (selectedBrand === "all") return;
    const relevant = filterBrandsForCategory(brands, filter);
    if (relevant.some((brand) => brand.slug === selectedBrand)) return;
    setSelectedBrand("all");
  }, [filter, selectedBrand, brands]);

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
      category: apiFilter.category,
      subcategory: apiFilter.subcategory,
      group: apiFilter.group,
      brand: selectedBrand === "all" ? apiFilter.brand : selectedBrand,
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
          const existingKeys = new Set(prev.map((item) => getProductListKey(item)));
          return [
            ...prev,
            ...data.items.filter((item) => !existingKeys.has(getProductListKey(item))),
          ];
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
    if (!isCategorySheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isCategorySheetOpen]);

  const applyCategoryFilter = (nextFilter: string) => {
    pendingScrollToGridRef.current = true;
    setFilter(nextFilter);
    setSelectedBrand("all");
    setPage(1);
    scrollToProductGrid(false);
  };

  const renderCategoryNav = () => (
    <>
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          applyCategoryFilter("all");
          setIsCategorySheetOpen(false);
        }}
        className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors cursor-pointer select-none ${
          filter === "all"
            ? "bg-brand-green/[0.02] text-brand-green font-bold"
            : "hover:bg-neutral/20 text-navy"
        }`}
      >
        <span className="flex items-center gap-3">
          <Search className="text-brand-green shrink-0" size={18} />
          <span
            className={`text-[11px] font-extrabold tracking-wider uppercase transition-colors ${
              filter === "all" ? "text-brand-green" : "text-navy"
            }`}
          >
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

      {sidebarSections.map((section) => {
        const SectionIcon = section.icon;
        const isExpanded = expandedSections[section.id];
        const isParentActive =
          filter === section.categoryId ||
          section.subcategories.some((sub) => filter === sub.id);

        return (
          <div key={section.id} className="flex flex-col">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                toggleSection(section.id);
                applyCategoryFilter(section.categoryId);
              }}
              className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors cursor-pointer select-none ${
                isParentActive ? "bg-brand-green/[0.02]" : "hover:bg-neutral/20"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <SectionIcon className="text-brand-green shrink-0" size={18} />
                <span
                  className={`truncate text-[11px] font-extrabold tracking-wider text-navy uppercase transition-colors ${
                    isParentActive ? "text-brand-green" : "text-navy"
                  }`}
                >
                  {section.title}
                </span>
              </span>
              <ChevronDown
                size={15}
                className={`shrink-0 text-navy/45 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 },
                  }}
                  transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden border-t border-gray-light/20 bg-cream/35"
                >
                  <div className="flex flex-col gap-1 p-2">
                    {section.subcategories.map((sub) => {
                      const SubIcon = sub.icon;
                      const isActive = filter === sub.id;

                      return (
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          key={sub.id}
                          onClick={() => {
                            handleSubcategoryClick(sub.id);
                            setIsCategorySheetOpen(false);
                          }}
                          className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-4.5 py-3 text-left transition-all duration-200 ${
                            isActive
                              ? "bg-brand-green/10 font-bold text-brand-green shadow-xs"
                              : "font-medium text-navy/75 hover:bg-neutral/40 hover:text-brand-green"
                          }`}
                        >
                          <SubIcon className="shrink-0 text-brand-green" size={14} />
                          <span className="text-[13px] tracking-wide">{sub.name}</span>
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
    </>
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

            {/* Brands filter — theo danh mục đang chọn (khóa / bếp / quạt / nước / cửa) */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mr-1 hidden sm:block">
                Thương hiệu:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
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
                {visibleBrands.map((brand) => {
                  const isActive = selectedBrand === brand.slug;
                  return (
                    <button
                      key={brand.id ?? brand.slug}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSelectedBrand(brand.slug);
                        setPage(1);
                      }}
                      className={`cursor-pointer flex items-center justify-center rounded-xl bg-white border px-4 py-2.5 transition-all duration-300 h-12 min-w-[110px] shadow-xs hover:scale-102 hover:shadow-sm ${
                        isActive
                          ? "border-brand-green ring-2 ring-brand-green/10 shadow-sm"
                          : "border-gray-light/60 hover:border-brand-green/30"
                      }`}
                    >
                      <BrandLogo
                        brand={brand}
                        className="h-7 w-auto max-w-[110px] object-contain"
                      />
                    </button>
                  );
                })}
                {visibleBrands.length === 0 && (
                  <span className="text-xs font-medium text-navy/45">
                    Không có thương hiệu cho danh mục này
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <aside className="w-full shrink-0 lg:w-80 lg:sticky lg:top-28">
            {/* Mobile: compact trigger + bottom sheet */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(true)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-light/60 bg-white px-4 py-3.5 text-left shadow-xs"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                    <ListFilter size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-navy/40">
                      Danh mục
                    </span>
                    <span className="block truncate text-sm font-extrabold text-navy">
                      {getActiveCatalogLabel(filter, sidebarSections)}
                    </span>
                  </span>
                </span>
                <ChevronDown size={16} className="shrink-0 text-navy/40" />
              </button>

              <AnimatePresence>
                {isCategorySheetOpen && (
                  <>
                    <motion.button
                      type="button"
                      aria-label="Đóng danh mục"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[60] bg-navy/40"
                      onClick={() => setIsCategorySheetOpen(false)}
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                      className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[85vh] flex-col rounded-t-[28px] bg-cream shadow-2xl"
                    >
                      <div className="flex shrink-0 items-center justify-between border-b border-gray-light/40 px-5 py-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40">
                            Chọn danh mục
                          </p>
                          <p className="text-sm font-extrabold text-navy">
                            {getActiveCatalogLabel(filter, sidebarSections)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCategorySheetOpen(false)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy/70 shadow-xs"
                          aria-label="Đóng"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div
                        data-lenis-prevent
                        className="min-h-0 flex-1 overflow-y-auto divide-y divide-gray-light/35 bg-white"
                      >
                        {renderCategoryNav()}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: sticky accordion */}
            <div
              ref={panelRef}
              data-lenis-prevent
              className="hidden divide-y divide-gray-light/35 overflow-y-auto rounded-3xl border border-gray-light/35 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] invisible-scrollbar lg:block lg:max-h-[calc(100vh-9.5rem)]"
            >
              {renderCategoryNav()}
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="min-w-0 flex-1 [overflow-anchor:none]" ref={gridRef}>
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
                      key={getProductListKey(product, index)}
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
