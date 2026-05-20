"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, Lock, RefreshCw, Sun, Moon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, CATEGORIES } from "@/data/products";

export default function Header() {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    updateFilters,
    compareList,
    theme,
    toggleTheme,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Monitor scroll for header background animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, []);

  const handleCategorySelect = (slug: string) => {
    updateFilters({ category: slug });
    setIsProductDropdownOpen(false);
    closeMobileMenu();

    const productsSection = document.getElementById("products-listing");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?category=${slug}`);
      setTimeout(() => {
        document.getElementById("products-listing")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  // Filter search results for autocompletion
  const filteredSuggestions =
    searchQuery.trim() === ""
      ? []
      : PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);

  const headerBg = isScrolled
    ? "bg-[var(--background)]/90 backdrop-blur-lg border-b border-gold/15 shadow-lg shadow-black/10"
    : "bg-transparent border-b border-transparent";

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={closeMobileMenu}>
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gold/40 bg-luxury-dark group-hover:border-gold transition-all duration-300">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gold group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-lg bg-gold/10 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-widest text-white group-hover:text-gold transition-colors duration-300">
                KASSLER<span className="text-gold font-light text-[10px] align-super ml-0.5">®</span>
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link href="/" className="text-sm font-medium text-zinc-300 hover:text-gold transition-colors whitespace-nowrap">
                Trang chủ
              </Link>

              {/* Dropdown Sản Phẩm */}
              <div
                className="relative"
                onMouseEnter={() => setIsProductDropdownOpen(true)}
                onMouseLeave={() => setIsProductDropdownOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-zinc-300 hover:text-gold transition-colors focus:outline-none py-2 whitespace-nowrap">
                  Sản phẩm
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProductDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <div
                  className={`absolute left-0 top-full w-64 bg-[var(--dark-bg)] border border-gold/20 rounded-xl shadow-2xl p-3 backdrop-blur-xl z-50 transition-all duration-200 origin-top ${
                    isProductDropdownOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategorySelect(cat.slug)}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-gold hover:bg-gold/5 transition-all duration-150 flex items-center justify-between group"
                      >
                        {cat.name}
                        <span className="w-1.5 h-1.5 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="#testimonials" className="text-sm font-medium text-zinc-300 hover:text-gold transition-colors whitespace-nowrap">
                Ý kiến khách hàng
              </Link>
              <Link href="#faq" className="text-sm font-medium text-zinc-300 hover:text-gold transition-colors whitespace-nowrap">
                Hỏi đáp
              </Link>
              <Link href="#contact" className="text-sm font-medium text-zinc-300 hover:text-gold transition-colors whitespace-nowrap">
                Liên hệ
              </Link>
            </nav>

            {/* ── Desktop Search ── */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-sm relative" ref={searchRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm, mã khóa..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-900/60 border border-gold/15 hover:border-gold/30 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />

                {/* Search suggestions */}
                {searchFocused && searchQuery.trim() !== "" && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--dark-bg)] border border-gold/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl z-50">
                    {filteredSuggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-800/60">
                          Gợi ý tìm kiếm
                        </div>
                        {filteredSuggestions.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.id}`}
                            onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold/5 transition-colors border-b border-zinc-900/40 last:border-0"
                          >
                            <div className="w-9 h-9 bg-zinc-900 rounded-lg border border-gold/15 flex items-center justify-center shrink-0">
                              <Lock className="w-4 h-4 text-gold/60" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-white truncate">{prod.name}</p>
                              <p className="text-xs text-gold font-mono">{prod.code}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-zinc-500">
                        Không tìm thấy &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Compare badge */}
              {compareList.length > 0 && (
                <button
                  onClick={() => document.getElementById("compare-drawer")?.scrollIntoView({ behavior: "smooth" })}
                  className="relative p-2 rounded-full hover:bg-zinc-900/60 text-zinc-300 hover:text-gold transition-all"
                  title="So sánh sản phẩm"
                >
                  <RefreshCw className="w-5 h-5 animate-spin-slow" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-[#050505] text-[9px] font-bold rounded-full flex items-center justify-center">
                    {compareList.length}
                  </span>
                </button>
              )}

              {/* Mobile search toggle */}
              <button
                onClick={() => setIsMobileSearchOpen((v) => !v)}
                className="lg:hidden p-2 rounded-full hover:bg-zinc-900/60 text-zinc-300 hover:text-gold transition-all"
                title="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-zinc-900/60 text-zinc-300 hover:text-gold transition-all duration-300 cursor-pointer"
                title={theme === "dark" ? "Giao diện Sáng" : "Giao diện Tối"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gold" />
                ) : (
                  <Moon className="w-5 h-5 text-amber-700" />
                )}
              </button>

              {/* Desktop CTA */}
              <Link
                href="#contact"
                className="hidden md:inline-flex items-center justify-center px-4 py-2 lg:px-5 lg:py-2.5 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs lg:text-sm font-bold uppercase tracking-wider rounded-full shadow-lg shadow-gold/10 hover:shadow-gold/20 hover:brightness-105 active:scale-98 transition-all whitespace-nowrap"
              >
                Liên hệ tư vấn
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/60 focus:outline-none transition-colors ml-0.5"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Inline Search Bar — slides down below header */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileSearchOpen ? "max-h-20 opacity-100 pb-3" : "max-h-0 opacity-0"
            }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm, mã khóa..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-900/70 border border-gold/20 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-gold transition-all"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[80vw] max-w-[320px] z-50 lg:hidden flex flex-col bg-[#0a0a0c] border-l border-gold/15 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 shrink-0">
          <span className="text-sm font-bold text-white tracking-wider uppercase">Menu</span>
          <button
            onClick={closeMobileMenu}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <nav className="flex flex-col p-4 gap-1">

            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center px-3 py-3 rounded-xl text-base font-semibold text-white hover:text-gold hover:bg-gold/5 transition-all"
            >
              Trang chủ
            </Link>

            {/* Category accordion */}
            <div className="mt-1">
              <p className="px-3 pb-2 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                Danh mục sản phẩm
              </p>
              <div className="flex flex-col gap-0.5 pl-2 border-l border-gold/20 ml-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-gold hover:bg-gold/5 transition-all"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800/60 my-2" />

            <Link
              href="#testimonials"
              onClick={closeMobileMenu}
              className="flex items-center px-3 py-3 rounded-xl text-base font-semibold text-white hover:text-gold hover:bg-gold/5 transition-all"
            >
              Ý kiến khách hàng
            </Link>
            <Link
              href="#faq"
              onClick={closeMobileMenu}
              className="flex items-center px-3 py-3 rounded-xl text-base font-semibold text-white hover:text-gold hover:bg-gold/5 transition-all"
            >
              Hỏi đáp
            </Link>
            <Link
              href="#contact"
              onClick={closeMobileMenu}
              className="flex items-center px-3 py-3 rounded-xl text-base font-semibold text-white hover:text-gold hover:bg-gold/5 transition-all"
            >
              Liên hệ
            </Link>

            <div className="h-px bg-zinc-800/60 my-2" />

            {/* Theme toggle */}
            <button
              onClick={() => { toggleTheme(); closeMobileMenu(); }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-semibold text-zinc-300 hover:text-gold hover:bg-gold/5 transition-all cursor-pointer"
            >
              {theme === "dark" ? (
                <><Sun className="w-5 h-5 text-gold shrink-0" /> Giao diện Sáng</>
              ) : (
                <><Moon className="w-5 h-5 text-amber-700 shrink-0" /> Giao diện Tối</>
              )}
            </button>
          </nav>
        </div>

        {/* Drawer Footer CTA */}
        <div className="shrink-0 p-4 border-t border-zinc-800/60">
          <Link
            href="#contact"
            onClick={closeMobileMenu}
            className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:brightness-105 transition-all"
          >
            Liên hệ tư vấn ngay
          </Link>
        </div>
      </div>
    </>
  );
}
