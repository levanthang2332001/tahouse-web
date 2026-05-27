"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SocialFloating from "@/components/SocialFloating";
import { CATEGORIES, PRODUCTS } from "@/data/products";

function ProductListContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") || "all";
  const qParam = searchParams.get("q") || "";
  const [filter, setFilter] = useState(catParam);
  const [search, setSearch] = useState(qParam);

  useEffect(() => {
    setFilter(catParam);
  }, [catParam]);

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  const filteredProducts = useMemo(
    () => {
      const lockSubcategories = ["dai-sanh", "cua-go", "cua-kinh", "xingfa-sat", "cua-cong", "khach-san"];
      return PRODUCTS.filter((product) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "lock-parent" && (lockSubcategories.includes(product.category) || product.category === "Lock")) ||
          product.category === filter;
        const term = search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term);
        return matchesFilter && matchesSearch;
      });
    },
    [filter, search],
  );

  const getCategoryCount = (catId: string) => {
    if (catId === "all") {
      return PRODUCTS.length;
    }
    if (catId === "lock-parent") {
      const lockSubcategories = ["dai-sanh", "cua-go", "cua-kinh", "xingfa-sat", "cua-cong", "khach-san"];
      return PRODUCTS.filter((product) => lockSubcategories.includes(product.category) || product.category === "Lock").length;
    }
    return PRODUCTS.filter((product) => product.category === catId).length;
  };

  return (
    <div className="min-h-screen bg-neutral pb-24 pt-20">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-brand-green" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
              BỘ SƯU TẬP TA HOUSE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-light leading-snug text-navy md:text-5xl">
            Khám phá hệ sinh thái <br />
            <span className="font-semibold italic text-brand-green">thiết bị & khóa thông minh</span>
          </h1>
          <div className="flex flex-col items-stretch justify-between gap-6 pt-4 md:flex-row md:items-center">
            <div className="relative w-full shrink-0 md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                placeholder="Tìm sản phẩm, model..."
                className="w-full rounded-xl border border-gray-light bg-cream py-3.5 pl-12 pr-4 text-xs text-navy transition-all focus:border-brand-green focus:outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left Sidebar Panel */}
          <aside className="w-full shrink-0 lg:w-80 lg:sticky lg:top-28">
            {/* Desktop Vertical Categories with Hierarchy */}
            <div className="hidden rounded-2xl border border-gray-light/60 bg-cream p-6 shadow-sm lg:block">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-navy/40">
                DANH MỤC THIẾT BỊ
              </h2>
              <div className="flex flex-col gap-2.5">
                {/* 1. All Products */}
                <button
                  onClick={() => setFilter("all")}
                  className={`group flex items-center justify-between rounded-xl px-5 py-3.5 text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    filter === "all"
                      ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                      : "text-navy/70 hover:bg-neutral hover:text-brand-green"
                  }`}
                >
                  <span>Tất cả sản phẩm</span>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      filter === "all"
                        ? "bg-white/20 text-white"
                        : "bg-neutral text-navy/40 group-hover:bg-brand-green/10 group-hover:text-brand-green"
                    }`}
                  >
                    {getCategoryCount("all")}
                  </span>
                </button>

                {/* 2. Parent Category: Khóa thông minh */}
                <div className="mt-2 space-y-1.5">
                  <button
                    onClick={() => setFilter("lock-parent")}
                    className={`group flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      filter === "lock-parent"
                        ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                        : "text-navy hover:bg-neutral hover:text-brand-green"
                    }`}
                  >
                    <span>Khóa thông minh</span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        filter === "lock-parent"
                          ? "bg-white/20 text-white"
                          : "bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white"
                      }`}
                    >
                      {getCategoryCount("lock-parent")}
                    </span>
                  </button>

                  {/* Nested Lock Subcategories (Children) */}
                  <div className="ml-6 border-l border-gray-light pl-4 flex flex-col gap-1.5 pt-1.5">
                    {CATEGORIES.filter((category) => 
                      category.id !== "all" && 
                      category.id !== "lock-parent" && 
                      category.id !== "Kitchen" && 
                      category.id !== "Water" && 
                      category.id !== "Cabinet" && 
                      category.id !== "Smart"
                    ).map((category) => {
                      const isActive = filter === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setFilter(category.id)}
                          className={`group flex items-center justify-between rounded-lg px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                            isActive
                              ? "bg-brand-green/10 text-brand-green"
                              : "text-navy/60 hover:text-brand-green"
                          }`}
                        >
                          <span className="truncate pr-1">{category.name}</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-brand-green text-white"
                                : "bg-neutral text-navy/30 group-hover:bg-brand-green/10 group-hover:text-brand-green"
                            }`}
                          >
                            {getCategoryCount(category.id)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Other Categories (Kitchen, Water, Cabinet, Smart) */}
                {CATEGORIES.filter((category) => 
                  category.id === "Kitchen" || 
                  category.id === "Water" || 
                  category.id === "Cabinet" || 
                  category.id === "Smart"
                ).map((category) => {
                  const isActive = filter === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilter(category.id)}
                      className={`group flex items-center justify-between rounded-xl px-5 py-3.5 text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                          : "text-navy/70 hover:bg-neutral hover:text-brand-green"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-neutral text-navy/40 group-hover:bg-brand-green/10 group-hover:text-brand-green"
                        }`}
                      >
                        {getCategoryCount(category.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Horizontal Scrollable Categories */}
            <div className="lg:hidden w-full overflow-hidden mb-2">
              <div className="invisible-scrollbar flex gap-2 overflow-x-auto pb-2 p-1">
                {CATEGORIES.map((category) => {
                  const isActive = filter === category.id;
                  const displayLabel = category.id === "lock-parent" ? "Khóa thông minh (Tất cả)" : category.name;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilter(category.id)}
                      className={`whitespace-nowrap rounded-xl px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                          : "bg-cream border border-gray-light text-navy/60 hover:text-brand-green"
                      }`}
                    >
                      {displayLabel} ({getCategoryCount(category.id)})
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
