"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingCart, X } from "lucide-react";

function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "#categories" },
    { name: "Giải pháp", path: "#solutions" },
    { name: "Tin tức", path: "#news" },
    { name: "Liên hệ", path: "#contact" },
  ];

  return (
    <header
      className={`fixed left-0 top-0 z-50 h-20 w-full border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-500 ease-out ${
        isScrolled
          ? "border-gray-200/30 bg-[#fcfbf9]/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
          : "border-gray-100 bg-[#fcfbf9] shadow-none"
      }`}
    >
      <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex items-end leading-none">
            <span className="text-3xl font-medium tracking-tight text-[#769b52] transition-opacity group-hover:opacity-80">
              TA
            </span>
            <span className="ml-1 text-3xl font-medium tracking-tight text-gray-900 transition-colors group-hover:text-[#769b52]">
              HOUSE
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="text-xs font-medium uppercase tracking-wider text-gray-600 transition-colors duration-300 hover:text-gray-900"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className="cursor-pointer p-1 text-gray-600 transition-colors hover:text-gray-900"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" />
          </button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-12 top-16 z-50 mt-3 w-80 rounded-md border border-gray-200 bg-white p-3 shadow-xl"
              >
                <div className="rounded bg-[#faf9f6] px-3 py-2 text-xs text-gray-500">
                  Ô tìm kiếm demo cho `frontend-2`.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Link href="#categories" className="relative p-1 text-gray-600 transition-colors hover:text-gray-900">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-white text-[10px] font-medium text-gray-600">
              0
            </span>
          </Link>
          <Link
            href="#contact"
            className="rounded-sm bg-[#769b52] px-6 py-3 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#658744]"
          >
            Tư vấn ngay
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <Link href="#categories" className="relative p-1 text-gray-600 transition-colors hover:text-gray-900">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-white text-[10px] font-medium text-gray-600">
              0
            </span>
          </Link>
          <button
            className="cursor-pointer rounded p-1.5 text-gray-600"
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
            className="absolute left-0 top-20 flex max-h-[calc(100vh-5rem)] w-full flex-col gap-6 overflow-y-auto border-b border-gray-200 bg-[#fcfbf9] px-6 py-6 shadow-xl lg:hidden"
          >
            <div className="rounded border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-500">
              Ô tìm kiếm demo cho `frontend-2`.
            </div>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="border-b border-gray-100 py-2 text-xs font-medium uppercase tracking-wider text-gray-700 transition-colors hover:text-[#769b52]"
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
          <header className="fixed left-0 top-0 z-50 h-20 w-full border-b border-gray-100 bg-[#fcfbf9]">
            <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-medium tracking-tight text-[#769b52]">TA</span>
                <span className="ml-1 text-3xl font-medium tracking-tight text-gray-900">HOUSE</span>
              </div>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#769b52] border-t-transparent" />
            </div>
          </header>
        }
      >
        <HeaderContent />
      </Suspense>
      <div className="h-20 w-full shrink-0" />
    </>
  );
}
