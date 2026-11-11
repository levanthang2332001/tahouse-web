"use client";

import React, { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types/product";
import { formatProductPrice } from "@/lib/format-price";

function HeaderSearchForm({
  autoFocus = false,
  onSubmitted,
}: {
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [totalSuggestions, setTotalSuggestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setTotalSuggestions(0);
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  // Live search debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setShowDropdown(true);

      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(trimmed)}&limit=6`,
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSuggestions(data.items || []);
          setTotalSuggestions(data.total || 0);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowDropdown(false);
    const trimmed = query.trim();
    const href = trimmed
      ? `/products?q=${encodeURIComponent(trimmed)}`
      : "/products";
    router.push(href);
    onSubmitted?.();
  };

  const handleSelectProduct = (productId: string) => {
    setShowDropdown(false);
    onSubmitted?.();
    router.push(`/product/${productId}`);
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    onSubmitted?.();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products",
    );
  };

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="relative w-full overflow-hidden rounded-2xl border-2 border-navy/20 bg-white shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="flex items-center pl-4 pr-2 py-2 bg-white">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setShowDropdown(true);
          }}
          placeholder="Tìm sản phẩm, model..."
          className="w-full bg-transparent text-sm font-semibold text-navy placeholder:text-navy/45 outline-none border-none py-1 focus:outline-none"
          aria-label="Tìm kiếm sản phẩm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            className="p-1.5 text-navy/40 hover:text-navy cursor-pointer mr-1.5 shrink-0"
            title="Xóa tìm kiếm"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="shrink-0 flex items-center justify-center rounded-xl bg-brand-green p-2 text-white shadow-xs hover:bg-[#68a83a] transition-all cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Gợi ý sản phẩm gắn liền trực tiếp với ô search (không tách rời, có data-lenis-prevent để scroll mượt) */}
      <AnimatePresence>
        {showDropdown && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            data-lenis-prevent
            className="border-t border-gray-light/60 bg-white flex flex-col"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2.5 py-6 text-xs font-semibold text-navy/65">
                <Loader2 className="h-4 w-4 animate-spin text-brand-green" />
                <span>Đang tìm sản phẩm...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div data-lenis-prevent className="flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-light/50 bg-cream/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-navy/60">
                  <span>Gợi ý sản phẩm</span>
                  <span className="rounded-md bg-brand-green/10 px-2 py-0.5 text-brand-green font-bold text-[10px]">
                    {totalSuggestions} kết quả
                  </span>
                </div>
                <div
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                  className="max-h-[340px] overflow-y-auto overscroll-contain divide-y divide-gray-light/35 [touch-action:pan-y]"
                >
                  {suggestions.map((item) => {
                    const priceText = formatProductPrice(
                      item.price,
                      item.priceRange,
                    );
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectProduct(item.id)}
                        className="group flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-neutral/60 cursor-pointer"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-light/70 bg-white">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-contain p-1 transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-neutral/40 text-[9px] text-navy/40">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-bold text-navy transition-colors group-hover:text-brand-green">
                            {item.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-navy/55">
                            {item.brand && (
                              <span className="font-semibold text-brand-green">
                                {item.brand}
                              </span>
                            )}
                            {item.code && (
                              <span className="font-mono text-navy/40">
                                #{item.code}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs font-extrabold text-[#c0283a]">
                            {priceText}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="border-t border-gray-light/60 bg-neutral/30 px-4 py-2.5 text-center text-xs font-bold text-brand-green transition-colors hover:bg-brand-green/10 cursor-pointer"
                >
                  Xem tất cả kết quả cho &ldquo;{query.trim()}&rdquo; &rarr;
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-medium text-navy/50">
                Không tìm thấy sản phẩm phù hợp cho &ldquo;{query.trim()}&rdquo;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeaderContent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (path: string) => {
    if (path === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (!searchOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Giải pháp", path: "/#solutions" },
    { name: "Cửa hàng", path: "/#store" },
    { name: "Liên hệ", path: "/#contact" },
  ];

  return (
    <header
      className={`fixed left-0 top-0 z-50 h-24 w-full border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-500 ease-out ${
        isScrolled
          ? "border-gray-light/30 bg-cream/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
          : "border-gray-light bg-cream shadow-none"
      }`}
    >
      <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          onClick={() => handleNavClick("/")}
          className="group flex items-center gap-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logoTA2.svg"
            alt="TA House Logo"
            className="h-14 w-auto object-contain transition-opacity group-hover:opacity-80"
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => handleNavClick(link.path)}
              className="text-sm font-semibold uppercase tracking-wider text-navy/70 transition-colors duration-300 hover:text-brand-green"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <div ref={desktopSearchRef} className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="cursor-pointer p-1 text-navy/70 transition-colors hover:text-brand-green"
              aria-label="Tìm kiếm"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  data-lenis-prevent
                  className="absolute right-0 top-11 z-50 w-[380px] sm:w-[460px]"
                >
                  <HeaderSearchForm
                    autoFocus
                    onSubmitted={() => setSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/#contact"
            className="rounded-full bg-brand-green px-6 py-3 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-lime-dark"
          >
            Tư vấn ngay
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <button
            type="button"
            className="cursor-pointer rounded p-1.5 text-navy/70"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            data-lenis-prevent
            className="absolute left-0 top-24 flex max-h-[calc(100vh-5rem)] w-full flex-col gap-6 overflow-y-auto border-b border-gray-light bg-cream px-6 py-6 shadow-xl lg:hidden"
          >
            <HeaderSearchForm
              autoFocus
              onSubmitted={() => setIsOpen(false)}
            />
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className="border-b border-gray-light/30 py-2 text-sm font-semibold uppercase tracking-wider text-navy/80 transition-colors hover:text-brand-green"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function Header() {
  return (
    <>
      <Suspense
        fallback={
          <header className="fixed left-0 top-0 z-50 h-24 w-full border-b border-gray-light bg-cream">
            <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logoTA2.svg"
                  alt="TA House Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
            </div>
          </header>
        }
      >
        <HeaderContent />
      </Suspense>
      <div className="h-24 w-full shrink-0" />
    </>
  );
}
