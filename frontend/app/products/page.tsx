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
    () =>
      PRODUCTS.filter((product) => {
        const matchesFilter = filter === "all" || product.category === filter;
        const term = search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(term) ||
          product.code.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term);
        return matchesFilter && matchesSearch;
      }),
    [filter, search],
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-lime" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-lime">
              BỘ SƯU TẬP TA HOUSE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-light leading-snug text-[#1a1a1a] md:text-5xl">
            Khám phá hệ sinh thái <br />
            <span className="font-semibold italic text-lime">thiết bị & khóa thông minh</span>
          </h1>
          <div className="flex flex-col items-stretch justify-between gap-6 pt-6 lg:flex-row lg:items-center">
            <div className="relative w-full shrink-0 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                placeholder="Tìm sản phẩm, model..."
                className="w-full rounded-xl border border-black/10 bg-white py-3.5 pl-12 pr-4 text-xs text-[#1a1a1a] transition-all focus:border-lime focus:outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="invisible-scrollbar flex w-full gap-1.5 overflow-x-auto rounded-xl bg-[#f7f4eb] p-1 lg:w-auto">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    filter === category.id
                      ? "bg-lime text-white shadow-md shadow-lime/20"
                      : "text-zinc-500 hover:text-[#1a1a1a]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-black/10 bg-[#f7f4eb]/40 py-28 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 text-lime">
              <Search size={28} />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold text-[#1a1a1a]">
              Chưa tìm thấy thiết bị phù hợp
            </h3>
            <p className="mx-auto max-w-md text-xs font-medium leading-relaxed text-zinc-500">
              Bạn vui lòng thay đổi từ khóa tìm kiếm hoặc liên hệ hotline để nhận catalog đầy đủ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductListPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a]">
      <Header />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-bold text-lime">Đang tải danh mục thiết bị...</div>}>
        <ProductListContent />
      </Suspense>
      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
