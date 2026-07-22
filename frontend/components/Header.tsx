"use client";

import React, { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";

function HeaderSearchForm({
  autoFocus = false,
  onSubmitted,
}: {
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const href = trimmed
      ? `/products?q=${encodeURIComponent(trimmed)}`
      : "/products";
    router.push(href);
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm sản phẩm, model..."
        className="w-full rounded-xl border border-gray-light bg-neutral py-2.5 pl-10 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-navy/40 focus:border-brand-green"
        aria-label="Tìm kiếm sản phẩm"
      />
    </form>
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

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

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
    { name: "Tin tức", path: "/#news" },
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
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-gray-light bg-cream p-3 shadow-xl"
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
