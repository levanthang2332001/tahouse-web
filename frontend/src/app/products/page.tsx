"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloating from "@/components/SocialFloating";
import AIChatbot from "@/components/AIChatbot";

function ProductListContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const catParam = searchParams.get("cat") || "all";
  const qParam = searchParams.get("q") || "";
  const [prevCat, setPrevCat] = useState<string | null>(null);
  const [prevQ, setPrevQ] = useState<string | null>(null);

  if (catParam !== prevCat) {
    setPrevCat(catParam);
    setFilter(catParam);
  }
  if (qParam !== prevQ) {
    setPrevQ(qParam);
    setSearch(qParam);
  }

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesFilter = filter === "all" || p.category === filter;
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 bg-warm-light dark:bg-graphite-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="mb-14 space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-[1px] bg-lime" />
            <span className="text-[10px] font-bold tracking-widest text-lime uppercase">
              BỘ SƯU TẬP TA HOUSE
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-graphite dark:text-warm-light leading-snug">
            Khám phá hệ sinh thái <br />
            <span className="font-serif italic font-semibold text-lime">thiết bị & khóa thông minh</span>
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch lg:items-center pt-6">
            {/* Search inputs */}
            <div className="relative w-full lg:max-w-md shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
              <input 
                placeholder="Tìm sản phẩm, model..."
                className="w-full bg-warm-cream dark:bg-graphite border border-graphite/10 dark:border-warm-light/10 rounded-xl pl-12 pr-4 py-3.5 text-xs text-graphite dark:text-warm-light focus:outline-none focus:border-lime transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-graphite dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Premium Categories Select Ribbon */}
            <div className="flex gap-1.5 p-1 bg-warm-cream dark:bg-graphite rounded-xl overflow-x-auto w-full lg:w-auto invisible-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    filter === cat.id 
                      ? "bg-lime text-white shadow-md shadow-lime/20" 
                      : "text-zinc-500 hover:text-graphite dark:text-zinc-400 dark:hover:text-warm-light"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty States */}
        {filteredProducts.length === 0 && (
          <div className="py-28 text-center bg-warm-cream/30 dark:bg-graphite rounded-3xl border border-dashed border-graphite/10">
            <div className="w-16 h-16 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-6 text-lime">
              <Search size={28} />
            </div>
            <h3 className="font-serif text-xl font-bold text-graphite dark:text-warm-light mb-2">
              Chưa tìm thấy thiết bị phù hợp
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium max-w-md mx-auto leading-relaxed">
              Bạn vui lòng thay đổi từ khóa tìm kiếm hoặc liên hệ Hotline 1900 8899 để nhận catalog đầy đủ các kích thước kỹ thuật.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductListPage() {
  return (
    <div className="bg-warm-light dark:bg-graphite-dark min-h-screen text-graphite dark:text-warm-light transition-colors duration-500">
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-warm-light dark:bg-graphite-dark">
          <div className="text-sm font-bold text-lime animate-pulse">Đang tải danh mục thiết bị...</div>
        </div>
      }>
        <ProductListContent />
      </Suspense>
      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
