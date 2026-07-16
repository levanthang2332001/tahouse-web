"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight, MessageCircle, Phone, Sparkles } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import { useApp } from "@/context/AppContext";
import { COMPANY_LEGAL } from "@/data/company-legal";
import content from "@/data/content.json";
import { formatCurrency, formatProductPrice } from "@/data/products";
import { fetchProduct } from "@/lib/api/products";
import type { Product } from "@/lib/types/product";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  return <ProductDetailView key={id} id={id} />;
}

function ProductDetailView({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToRecentlyViewed, setIsChatbotOpen } = useApp();

  useEffect(() => {
    let cancelled = false;

    fetchProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        addToRecentlyViewed(data.id);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        if (error.message === "NOT_FOUND") {
          setNotFound(true);
          setProduct(null);
          setFetchError(false);
          return;
        }
        setProduct(null);
        setNotFound(false);
        setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral text-navy">
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center pb-24 pt-40 text-sm font-bold text-brand-green">
          Đang tải sản phẩm...
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-neutral text-navy">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 pb-24 pt-40 text-center">
          <h2 className="font-serif text-2xl font-bold">Không thể tải sản phẩm</h2>
          <p className="text-sm font-semibold text-navy/60">Vui lòng kiểm tra kết nối và thử lại.</p>
          <Link href="/products" className="text-sm font-bold uppercase text-brand-green hover:underline">
            Quay lại danh sách
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-neutral text-navy">
        <Header />
        <div className="flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-40 text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold">{content.detail.notFound.title}</h2>
          <Link href="/products" className="text-sm font-bold uppercase text-brand-green hover:underline">
            {content.detail.notFound.backLink}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const heroImage = selectedImage || product.imageUrl;
  const specs = product.specs ?? {};
  const features = product.features ?? [];
  const installSteps =
    product.installationManual && product.installationManual.length > 0
      ? product.installationManual
      : content.detail.installDetails;
  const showDiscount =
    typeof product.price === "number" &&
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;
  const discountPercent = showDiscount
    ? Math.round(((product.originalPrice! - product.price!) / product.originalPrice!) * 100)
    : 0;

  const handleShare = async () => {
    if (typeof window === "undefined") {
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral text-navy">
      <Header />
      <div className="min-h-screen pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-navy/55">
            <Link href="/" className="hover:text-brand-green">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-brand-green">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="truncate text-navy font-bold">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3] max-h-[420px] overflow-hidden rounded-3xl border border-gray-light bg-cream shadow-inner mx-auto w-full"
              >
                <Image
                  src={heroImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(image)}
                      className={`relative aspect-square overflow-hidden rounded-xl border ${
                        heroImage === image ? "border-brand-green" : "border-gray-light"
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
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-brand-green/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-green">
                  {product.categoryName}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 rounded-lg bg-cream border border-gray-light px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-navy/60 hover:text-brand-green"
                >
                  {copied ? content.detail.labels.shareCopied : content.detail.labels.share}
                </button>
              </div>

              <h1 className="mb-2 font-serif text-3xl font-bold leading-tight tracking-tight text-navy md:text-5xl">
                {product.name}
              </h1>
              <p className="mb-6 text-xs uppercase tracking-widest text-navy/60">
                {content.detail.labels.modelCodePrefix} {product.code}
              </p>
              <div className="mb-8 flex flex-col gap-1">
                {showDiscount && (
                  <span className="text-sm font-semibold text-zinc-400 line-through">
                    {formatCurrency(product.originalPrice!)}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-rose-600">
                    {typeof product.price === "number"
                      ? formatCurrency(product.price)
                      : formatProductPrice(product.price, product.priceRange)}
                  </span>
                  {showDiscount && (
                    <span className="inline-flex items-center rounded bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-600 border border-rose-100 animate-pulse">
                      GIẢM {discountPercent}%
                    </span>
                  )}
                </div>
              </div>
              {product.description && (
                <p className="mb-8 text-sm font-semibold leading-relaxed text-navy">
                  {product.description}
                </p>
              )}

              {features.length > 0 && (
                <div className="mb-8 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-navy">
                    {content.detail.labels.featuresTitle}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold leading-tight text-navy/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto grid grid-cols-1 gap-4 border-t border-gray-light pt-6 sm:grid-cols-3">
                <a
                  href={COMPANY_LEGAL.zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0068ff] py-4 text-center text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#0056d6] shadow-sm"
                >
                  <MessageCircle size={16} /> Chat Zalo tư vấn
                </a>
                <a
                  href={`tel:${COMPANY_LEGAL.phoneTel}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500 bg-rose-500 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-rose-600 shadow-sm"
                >
                  <Phone size={16} /> Gọi {COMPANY_LEGAL.phone}
                </a>
                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-light bg-cream hover:border-brand-green/40 py-4 text-center text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-navy/5 shadow-2xs"
                >
                  <Sparkles size={16} className="text-brand-green animate-pulse" /> Bot tư vấn
                </button>
              </div>
            </div>
          </div>

          <div className="mt-28 border-t border-gray-light pt-12">
            <div className="invisible-scrollbar mb-10 flex gap-8 overflow-x-auto border-b border-gray-light">
              {["specs", "install", "warranty"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors ${
                    activeTab === tab
                      ? "text-brand-green before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-brand-green"
                      : "text-navy/60 hover:text-brand-green"
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
                  {Object.keys(specs).length > 0 ? (
                    Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex flex-col justify-between border-b border-gray-light/35 py-4 text-sm sm:flex-row">
                        <span className="font-bold uppercase tracking-wider text-navy/70">{key}</span>
                        <span className="mt-1.5 font-extrabold text-navy sm:mt-0">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-semibold text-navy/60">Chưa có thông số kỹ thuật.</p>
                  )}
                </div>
              )}

              {activeTab === "install" && (
                <div className="space-y-4 text-sm font-semibold leading-relaxed text-navy">
                  {installSteps.map((detail, index) => (
                    <p key={index}>{detail}</p>
                  ))}
                  {product.installation_preview && product.installation_preview.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                      {product.installation_preview.map((image, index) => (
                        <div key={image} className="relative aspect-square overflow-hidden rounded-xl border border-gray-light">
                          <Image
                            src={image}
                            alt={`Lắp đặt ${product.name} ${index + 1}`}
                            fill
                            sizes="33vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "warranty" && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-cream border border-gray-light p-6">
                    <h4 className="mb-3 text-base font-bold text-navy">
                      {content.detail.warrantyDetails.title}
                    </h4>
                    <p className="text-sm font-semibold leading-relaxed text-navy mb-2">
                      {content.detail.warrantyDetails.warrantyPeriodPrefix}{" "}
                      {product.warrantyText ?? `${product.warranty ?? 0} tháng`}.
                    </p>
                    {content.detail.warrantyDetails.points.map((point, index) => (
                      <p key={index} className="text-sm font-semibold leading-relaxed text-navy/90">
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
