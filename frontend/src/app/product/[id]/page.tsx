"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronRight, Check, MessageCircle, Phone 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, formatCurrency } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloating from "@/components/SocialFloating";
import AIChatbot from "@/components/AIChatbot";
import content from "@/data/content.json";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);
  const selectedImage = userSelectedImage || product?.imageUrl || "";
  const [prevId, setPrevId] = useState<string | null>(null);

  if (id !== prevId) {
    setPrevId(id);
    setUserSelectedImage(null);
  }

  const { addToRecentlyViewed } = useApp();

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
    }
  }, [product, id, addToRecentlyViewed]);

  if (!product) {
    return (
      <div className="bg-warm-light dark:bg-graphite-dark min-h-screen text-graphite dark:text-warm-light transition-colors duration-500">
        <Header />
        <div className="pt-40 pb-24 text-center min-h-[70vh] flex flex-col justify-center items-center">
          <h2 className="font-serif text-2xl font-bold text-graphite dark:text-warm-light mb-4">
            {content.detail.notFound.title}
          </h2>
          <Link href="/products" className="text-lime hover:underline font-bold text-sm uppercase">
            {content.detail.notFound.backLink}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-warm-light dark:bg-graphite-dark text-graphite dark:text-warm-light transition-colors duration-500">
      <Header />
      
      <div className="pt-32 pb-24 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          {/* Navigation Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-8">
            <Link href="/" className="hover:text-lime">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-lime">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="text-graphite dark:text-warm-light truncate">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Block - Images Gallery */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square bg-warm-cream/50 dark:bg-graphite rounded-3xl overflow-hidden border border-graphite/5 dark:border-warm-light/5 shadow-inner flex items-center justify-center"
              >
                <img src={selectedImage || product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
              </motion.div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setUserSelectedImage(img)}
                    className={`aspect-square bg-warm-cream/30 dark:bg-graphite rounded-xl border overflow-hidden cursor-pointer hover:border-lime transition-all ${
                      selectedImage === img ? "border-lime" : "border-graphite/5 dark:border-warm-light/5"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`gallery-${i}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Block - Product Specifications & Meta details */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lime font-black uppercase tracking-widest text-[10px] bg-lime/10 px-3 py-1 rounded-full">
                  {product.category === "Lock" 
                    ? content.detail.labels.categoryLock 
                    : product.category === "Kitchen" 
                      ? content.detail.labels.categoryKitchen 
                      : content.detail.labels.categoryPremium}
                </span>
                <button 
                  onClick={handleShare}
                  className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-lime flex items-center gap-1 bg-graphite/5 dark:bg-warm-light/5 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  {copied ? content.detail.labels.shareCopied : content.detail.labels.share}
                </button>
              </div>

              <h1 className="font-serif text-3xl md:text-5xl font-light text-graphite dark:text-warm-light mb-2 tracking-tight transition-colors leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mb-6">
                {content.detail.labels.modelCodePrefix} {product.code}
              </p>
              
              <div className="text-2xl font-black text-lime mb-8 transition-colors">
                {formatCurrency(product.price)}
              </div>

              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm font-medium mb-8 transition-colors">
                {product.description}
              </p>

              {/* Core features checklist */}
              <div className="space-y-4 mb-8">
                <h3 className="text-graphite dark:text-warm-light font-bold uppercase tracking-widest text-[10px] transition-colors">
                  {content.detail.labels.featuresTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-lime/13 text-lime rounded-full flex items-center justify-center shrink-0">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-[11px] font-bold text-graphite/90 dark:text-warm-cream/90 transition-colors leading-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Action Options */}
              <div className="mt-auto pt-6 border-t border-graphite/5 dark:border-warm-light/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a 
                  href="https://zalo.me" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-lime text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-lime-light transition-colors"
                >
                  <MessageCircle size={16} /> {content.detail.labels.ctaZalo}
                </a>
                <a 
                  href="tel:19008899" 
                  className="bg-terracotta border border-terracotta-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-terracotta-light transition-colors"
                >
                  <Phone size={16} /> {content.detail.labels.ctaCall}
                </a>
                <Link 
                  href="/contact" 
                  className="border border-graphite-light/20 dark:border-warm-light/20 text-graphite dark:text-warm-light py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-graphite/5 dark:hover:bg-white/5 transition-all text-center"
                >
                  {content.detail.labels.ctaSurvey}
                </Link>
              </div>
            </div>
          </div>

          {/* Specs Tabs specification details */}
          <div className="mt-28 border-t border-graphite/10 dark:border-warm-light/10 pt-12">
            <div className="flex gap-8 mb-10 border-b border-graphite/10 dark:border-warm-light/10 overflow-x-auto invisible-scrollbar">
              {["specs", "install", "warranty"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative focus:outline-none cursor-pointer whitespace-nowrap ${
                    activeTab === tab 
                      ? "text-lime before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-lime" 
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {tab === "specs" 
                    ? content.detail.tabs.specs 
                    : tab === "install" 
                      ? content.detail.tabs.install 
                      : content.detail.tabs.warranty}
                </button>
              ))}
            </div>

            <div className="max-w-3xl">
              {activeTab === "specs" && (
                <div className="space-y-4">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex flex-col sm:flex-row justify-between py-4 border-b border-graphite/5 dark:border-warm-light/5 text-xs">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">{k}</span>
                      <span className="text-graphite dark:text-warm-light font-bold mt-1.5 sm:mt-0">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === "install" && (
                <div className="text-zinc-600 dark:text-zinc-400 space-y-4 transition-colors text-xs leading-relaxed font-semibold">
                  {content.detail.installDetails.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                </div>
              )}

              {activeTab === "warranty" && (
                <div className="space-y-6">
                  <div className="p-6 bg-warm-cream/50 dark:bg-graphite rounded-2xl transition-colors">
                    <h4 className="text-graphite dark:text-warm-light font-bold text-sm mb-2">
                      {content.detail.warrantyDetails.title}
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-semibold">
                      {content.detail.warrantyDetails.warrantyPeriodPrefix} {product.warrantyText}. <br />
                      {content.detail.warrantyDetails.points.map((pt, idx) => (
                        <React.Fragment key={idx}>
                          - {pt}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
