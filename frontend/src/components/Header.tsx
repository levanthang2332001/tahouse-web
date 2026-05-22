"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingCart } from "lucide-react";

function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Giải pháp", path: "/products?cat=Kitchen" },
    { name: "Dự án", path: "/products?cat=Lock" },
    { name: "Tin tức", path: "/#news" },
    { name: "Liên hệ", path: "/contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className={`w-full fixed top-0 left-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-500 ease-out h-20 ${
      isScrolled 
        ? "bg-[#fcfbf9]/80 border-gray-200/30 shadow-[0_8px_30px_rgba(0,0,0,0.03)]" 
        : "bg-[#fcfbf9] border-gray-100 shadow-none"
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between relative">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-end leading-none select-none">
            <span className="text-[#769b52] text-3xl tracking-tight font-medium group-hover:opacity-80 transition-opacity">
              TA
            </span>
            <span className="text-gray-900 text-3xl tracking-tight font-medium ml-1 group-hover:text-[#769b52] transition-colors">
              HOUSE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => {
            const isHome = link.path === "/";
            const isActive = isHome 
              ? pathname === "/" && !searchParams.toString()
              : pathname === link.path.split("?")[0] && 
                (link.path.includes("?") 
                  ? searchParams.get("cat") === new URLSearchParams(link.path.split("?")[1]).get("cat") 
                  : true);

            return (
              <Link 
                key={link.name} 
                href={link.path}
                className={`text-xs uppercase tracking-wider font-medium transition-colors duration-300 ${
                  isActive 
                    ? "text-[#769b52]" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Search Trigger */}
          <div className="relative">
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none p-1 cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-md p-3 shadow-xl z-50"
                >
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Tìm thiết bị bếp, khóa..."
                      className="flex-1 bg-[#faf9f6] border border-gray-200 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#769b52]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="bg-[#769b52] hover:bg-[#658744] text-white text-xs px-4 py-2 font-medium transition-all"
                    >
                      Tìm
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Icon (showcase catalog feel) */}
          <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors relative p-1">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-white text-gray-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-gray-200 font-medium">
              0
            </span>
          </Link>

          {/* CTA Button */}
          <Link 
            href="/contact" 
            className="bg-[#769b52] hover:bg-[#658744] text-white text-xs uppercase tracking-wider px-6 py-3 transition-colors font-medium rounded-sm"
          >
            Tư vấn ngay
          </Link>
        </div>

        {/* Mobile Header Buttons */}
        <div className="flex lg:hidden items-center gap-4">
          <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors relative p-1">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-white text-gray-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-gray-200 font-medium">
              0
            </span>
          </Link>
          
          <button 
            className="text-gray-600 hover:text-gray-900 p-1.5 rounded focus:outline-none cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-20 left-0 w-full bg-[#fcfbf9] border-b border-gray-200 px-6 py-6 flex flex-col gap-6 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Tìm thiết bị bếp, khóa..."
                className="flex-1 bg-white border border-gray-200 rounded px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#769b52]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#769b52] hover:bg-[#658744] text-white text-xs px-4 py-2.5 font-medium transition-all"
              >
                Tìm
              </button>
            </form>

            {/* Mobile Links */}
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.path}
                  className="text-xs uppercase tracking-wider text-gray-700 hover:text-[#769b52] transition-colors py-2 border-b border-gray-100 font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Contact Details */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Hotline: 0938 824 479</span>
                <span>Zalo: 0938 824 479</span>
              </div>
              <Link 
                href="/contact"
                className="bg-[#769b52] text-white text-center py-3.5 rounded-sm font-medium uppercase tracking-wider text-xs shadow-sm hover:bg-[#658744] transition-colors"
              >
                Gửi Yêu Cầu Tư Vấn
              </Link>
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
      <Suspense fallback={
        <header className="w-full bg-[#fcfbf9] fixed top-0 left-0 z-50 border-b border-gray-100 h-20">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#769b52] text-3xl tracking-tight font-medium">TA</span>
              <span className="text-gray-900 text-3xl tracking-tight font-medium ml-1">HOUSE</span>
            </div>
            <div className="w-5 h-5 border-2 border-[#769b52] border-t-transparent rounded-full animate-spin" />
          </div>
        </header>
      }>
        <HeaderContent />
      </Suspense>
      {/* Spacer to preserve document flow since the header is position: fixed */}
      <div className="h-20 w-full shrink-0" />
    </>
  );
}
