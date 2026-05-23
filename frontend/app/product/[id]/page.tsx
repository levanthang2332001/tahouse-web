"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ChevronRight, MessageCircle, Phone } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import { useApp } from "@/context/AppContext";
import content from "@/data/content.json";
import { PRODUCTS, formatCurrency } from "@/data/products";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const product = useMemo(
    () => PRODUCTS.find((item) => item.id === params.id),
    [params.id],
  );
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToRecentlyViewed } = useApp();

  useEffect(() => {
    setSelectedImage(null);
  }, [params.id]);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
    }
  }, [product, addToRecentlyViewed]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a]">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-40 text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold">{content.detail.notFound.title}</h2>
          <Link href="/products" className="text-sm font-bold uppercase text-lime hover:underline">
            {content.detail.notFound.backLink}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const heroImage = selectedImage || product.imageUrl;

  const handleShare = async () => {
    if (typeof window === "undefined") {
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a]">
      <Header />
      <div className="min-h-screen pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:text-lime">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-lime">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="truncate text-[#1a1a1a]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square overflow-hidden rounded-3xl border border-black/5 bg-[#f7f4eb] shadow-inner"
              >
                <Image
                  src={heroImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`relative aspect-square overflow-hidden rounded-xl border ${
                      heroImage === image ? "border-lime" : "border-black/5"
                    }`}
                    aria-label={`Xem ảnh ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-lime/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-lime">
                  {product.categoryName}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 rounded-lg bg-black/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-lime"
                >
                  {copied ? content.detail.labels.shareCopied : content.detail.labels.share}
                </button>
              </div>

              <h1 className="mb-2 font-serif text-3xl font-light leading-tight tracking-tight md:text-5xl">
                {product.name}
              </h1>
              <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
                {content.detail.labels.modelCodePrefix} {product.code}
              </p>
              <div className="mb-8 text-2xl font-black text-lime">{formatCurrency(product.price)}</div>
              <p className="mb-8 text-xs font-medium leading-relaxed text-zinc-600 sm:text-sm">
                {product.description}
              </p>

              <div className="mb-8 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]">
                  {content.detail.labels.featuresTitle}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/13 text-lime">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-[11px] font-bold leading-tight text-black/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto grid grid-cols-1 gap-4 border-t border-black/5 pt-6 sm:grid-cols-3">
                <a href="https://zalo.me" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-lime py-4 text-center text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#8cb566]">
                  <MessageCircle size={16} /> {content.detail.labels.ctaZalo}
                </a>
                <a href="tel:19008899" className="flex items-center justify-center gap-2 rounded-xl border border-[#884322] bg-[#A0522D] py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#B86539]">
                  <Phone size={16} /> {content.detail.labels.ctaCall}
                </a>
                <Link href="/contact" className="flex items-center justify-center gap-2 rounded-xl border border-black/10 py-4 text-center text-xs font-bold uppercase tracking-widest transition-all hover:bg-black/5">
                  {content.detail.labels.ctaSurvey}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-28 border-t border-black/10 pt-12">
            <div className="invisible-scrollbar mb-10 flex gap-8 overflow-x-auto border-b border-black/10">
              {["specs", "install", "warranty"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap pb-4 text-[10px] font-bold uppercase tracking-widest ${
                    activeTab === tab ? "text-lime before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-lime" : "text-zinc-400"
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
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col justify-between border-b border-black/5 py-4 text-xs sm:flex-row">
                      <span className="font-bold uppercase tracking-wider text-zinc-500">{key}</span>
                      <span className="mt-1.5 font-bold text-[#1a1a1a] sm:mt-0">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "install" && (
                <div className="space-y-4 text-xs font-semibold leading-relaxed text-zinc-600">
                  {content.detail.installDetails.map((detail, index) => (
                    <p key={index}>{detail}</p>
                  ))}
                </div>
              )}

              {activeTab === "warranty" && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-[#f7f4eb] p-6">
                    <h4 className="mb-2 text-sm font-bold text-[#1a1a1a]">
                      {content.detail.warrantyDetails.title}
                    </h4>
                    <p className="text-xs font-semibold leading-relaxed text-zinc-600">
                      {content.detail.warrantyDetails.warrantyPeriodPrefix} {product.warrantyText}.
                    </p>
                    {content.detail.warrantyDetails.points.map((point, index) => (
                      <p key={index} className="text-xs font-semibold leading-relaxed text-zinc-600">
                        - {point}
                      </p>
                    ))}
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
