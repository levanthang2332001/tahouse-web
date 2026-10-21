"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Sparkles, Tag } from "lucide-react";
import { getCategoryLabel } from "@/data/catalog-taxonomy";
import type { Product } from "@/lib/types/product";
import { calculateProductDiscount } from "@/lib/format-price";
import { formatProductName } from "@/lib/format-product-name";
export type ProductViewMode = "grid" | "grid-large" | "list";

export default function ProductCard({
  product,
  priority = false,
  viewMode = "grid",
}: {
  product: Product;
  priority?: boolean;
  viewMode?: ProductViewMode;
}) {
  const discountInfo = calculateProductDiscount(
    product.price,
    product.originalPrice,
    product.priceRange,
    product.id,
  );

  const getBadgeInfo = (id: string, hasDiscount: boolean, discountPercent: number) => {
    if (hasDiscount) {
      return {
        text: `GIẢM ${discountPercent}%`,
        icon: <Flame size={11} className="text-white fill-white" />,
        className: "bg-[#c0283a] text-white shadow-sm",
      };
    }
    const lowerId = id.toLowerCase();
    if (lowerId.includes("9800") || lowerId.includes("pxx") || lowerId.includes("granite")) {
      return {
        text: "ĐỀ XUẤT",
        icon: <Sparkles size={11} className="text-white" />,
        className: "bg-brand-green text-white shadow-sm",
      };
    }
    if (lowerId.includes("purifier") || lowerId.includes("spice") || lowerId.includes("gate")) {
      return {
        text: "BÁN CHẠY",
        icon: <Flame size={11} className="text-white fill-white" />,
        className: "bg-amber-600 text-white shadow-sm",
      };
    }
    return {
      text: "MỚI",
      icon: <Tag size={10} className="text-white" />,
      className: "bg-blue-600 text-white shadow-sm",
    };
  };

  const getSuitabilityText = (id: string, category: string) => {
    const lowerId = id.toLowerCase();
    if (lowerId.includes("pxx")) return "Gia đình 3–5 người";
    if (lowerId.includes("granite")) return "Mọi chậu rửa gia đình";
    if (lowerId.includes("purifier")) return "Gia đình, văn phòng";
    if (lowerId.includes("spice")) return "Bếp căn hộ, nhà phố";
    if (lowerId.includes("oven")) return "Gia đình yêu làm bánh";
    if (category === "dai-sanh") return "Biệt thự, cửa đại sảnh";
    if (category === "cua-go") return "Cửa gỗ, chung cư, nhà phố";
    if (category === "cua-kinh") return "Cửa kính cường lực văn phòng";
    if (category === "xingfa-sat") return "Cửa nhôm kính, văn phòng";
    if (category === "cua-cong") return "Cửa cổng sắt ngoài trời";
    if (category === "khach-san") return "Khách sạn, homestay, văn phòng";
    return "Căn hộ cao cấp, nhà phố";
  };

  const badge = getBadgeInfo(
    product.id,
    discountInfo.hasDiscount,
    discountInfo.discountPercent,
  );
  const suitability = getSuitabilityText(product.id, product.category);
  const categoryLabel = getCategoryLabel(product.category);
  const displayName = formatProductName(product.name);
  const hasNumericPrice = product.price !== null && product.price > 0;

  /* ========================================================================= */
  /* MODE 1: LIST VIEW (HÀNG NGANG / DANH SÁCH CHI TIẾT)                      */
  /* ========================================================================= */
  if (viewMode === "list") {
    return (
      <div className="group relative flex flex-col md:flex-row overflow-hidden rounded-[24px] border border-gray-light bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] w-full">
        {/* Left Image Area */}
        <div className="relative aspect-[1.3] md:aspect-square w-full md:w-64 lg:w-72 shrink-0 overflow-hidden bg-white border-b md:border-b-0 md:border-r border-gray-light/40 flex items-center justify-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 280px"
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral/40 text-[11px] font-semibold uppercase tracking-wider text-navy/35">
              Không có ảnh
            </div>
          )}

          <Link
            href={`/product/${product.id}`}
            className="absolute inset-0 z-10"
            aria-label={`Xem chi tiết ${displayName}`}
          />

          {/* Badge top-left */}
          <div className={`absolute left-3 top-3 z-20 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider select-none ${badge.className}`}>
            {badge.icon}
            <span>{badge.text}</span>
          </div>

          {product.brand && (
            <div className="absolute bottom-2.5 right-3 z-20 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-navy/70 border border-gray-light/60 shadow-xs">
              {product.brand}
            </div>
          )}
        </div>

        {/* Middle Info Area */}
        <div className="flex flex-1 flex-col justify-between p-5 md:p-6 text-left">
          <div>
            {/* Category & Model Code */}
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="text-navy/50">{categoryLabel}</span>
              {product.code && (
                <span className="font-semibold text-navy/40 font-mono">
                  #{product.code}
                </span>
              )}
            </div>

            {/* Title */}
            <Link href={`/product/${product.id}`} className="block mb-2.5">
              <h3 className="font-sans text-lg sm:text-xl font-extrabold leading-snug text-navy transition-colors duration-200 group-hover:text-brand-green">
                {displayName}
              </h3>
            </Link>
          </div>

          {/* Suitability text */}
          <div className="pt-2 text-xs text-navy/60 border-t border-gray-light/40">
            <span className="font-bold text-navy/80">Phù hợp:</span> {suitability}
          </div>
        </div>

        {/* Right Price & Actions Area */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 bg-[#FAF9F5]/70 border-t md:border-t-0 md:border-l border-gray-light/50 p-5 md:p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-navy/70">
              <Flame size={13} className="text-[#c0283a] fill-[#c0283a]" />
              {discountInfo.hasDiscount ? "Giá ưu đãi hôm nay" : hasNumericPrice ? "Giá niêm yết" : "Báo giá"}
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#c0283a] tracking-tight leading-none">
                {discountInfo.formattedCurrentPrice}
              </span>
              {discountInfo.hasDiscount && (
                <span className="rounded-md bg-[#c0283a] px-1.5 py-0.5 text-xs font-bold text-white">
                  -{discountInfo.discountPercent}%
                </span>
              )}
            </div>

            {discountInfo.hasDiscount && discountInfo.formattedOriginalPrice && (
              <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-navy/70">
                <span>Giá gốc:</span>
                <span className="line-through font-semibold text-navy/60">
                  {discountInfo.formattedOriginalPrice}
                </span>
              </div>
            )}

            {discountInfo.hasDiscount && discountInfo.formattedSavedAmount && (
              <div className="rounded-lg bg-[#c0283a]/5 border border-[#c0283a]/20 px-2.5 py-1 text-xs font-semibold text-[#c0283a]">
                Tiết kiệm {discountInfo.formattedSavedAmount}
              </div>
            )}

            {!hasNumericPrice && (
              <div className="text-xs text-navy/70">
                Báo giá lắp đặt trọn gói tốt nhất
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-light/50 space-y-2">
            <Link href={`/product/${product.id}`} className="block w-full">
              <button className="w-full rounded-xl bg-brand-green py-2.5 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-sm shadow-brand-green/20 hover:bg-[#68a83a] transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <span>Tư Vấn & Nhận Ưu Đãi</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* MODE 2 & 3: GRID & GRID-LARGE (DẠNG THẺ LƯỚI TIÊU CHUẨN HOẶC TO)         */
  /* ========================================================================= */
  const isLarge = viewMode === "grid-large";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-light bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)]">
      {/* Product Image Area */}
      <div
        className={`relative w-full overflow-hidden bg-white border-b border-gray-light/40 ${
          isLarge ? "aspect-[1.25]" : "aspect-[1.35]"
        }`}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={displayName}
            fill
            priority={priority}
            sizes={isLarge ? "(max-width: 768px) 100vw, 450px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"}
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral/40 text-[11px] font-semibold uppercase tracking-wider text-navy/35">
            Không có ảnh
          </div>
        )}

        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Xem chi tiết ${displayName}`}
        />

        {/* Dynamic status / promo badge (Top-Left) */}
        <div className={`absolute left-3 top-3 z-20 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider select-none ${badge.className}`}>
          {badge.icon}
          <span>{badge.text}</span>
        </div>

        {/* Brand Watermark Pill if available */}
        {product.brand && (
          <div className="absolute bottom-2.5 right-3 z-20 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-navy/70 border border-gray-light/60 shadow-xs">
            {product.brand}
          </div>
        )}
      </div>

      {/* Product Card Details */}
      <div className={`flex flex-grow flex-col text-left ${isLarge ? "p-5 sm:p-6" : "p-4 sm:p-4.5"}`}>
        {/* Category & Model Code */}
        <div className="mb-1 flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider">
          <span className="text-navy/45">{categoryLabel}</span>
          {product.code && (
            <span className="font-semibold text-navy/40 font-mono">
              #{product.code}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/product/${product.id}`} className="block mb-2">
          <h3
            className={`font-sans font-extrabold leading-snug text-navy transition-colors duration-200 group-hover:text-brand-green line-clamp-2 ${
              isLarge ? "text-[17px] sm:text-[18.5px]" : "text-[15.5px] sm:text-[16.5px]"
            }`}
          >
            {displayName}
          </h3>
        </Link>

        {/* Suitability text */}
        <div className="mb-3 text-[11px] text-navy/60">
          <span className="font-semibold text-navy/80">Phù hợp:</span> {suitability}
        </div>

        {/* Price box — mirrors the product detail price box; mt-auto pins price + CTA to the bottom so rows align */}
        <div className={`mt-auto rounded-2xl bg-[#FAF9F5] border border-gray-light/65 mb-3 ${isLarge ? "p-4 mb-4" : "p-3.5"}`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-navy/70">
            <span className="flex items-center gap-1">
              <Flame size={13} className="text-[#c0283a] fill-[#c0283a]" />
              {discountInfo.hasDiscount ? "Giá ưu đãi" : hasNumericPrice ? "Giá niêm yết" : "Báo giá"}
            </span>
            {discountInfo.hasDiscount && discountInfo.formattedSavedAmount && (
              <span className="whitespace-nowrap rounded-md bg-[#c0283a]/5 border border-[#c0283a]/20 px-1.5 py-0.5 text-xs font-semibold normal-case tracking-normal text-[#c0283a]">
                Tiết kiệm {discountInfo.formattedSavedAmount}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className={`whitespace-nowrap font-extrabold tracking-tight text-[#c0283a] leading-none ${
                isLarge ? "text-2xl sm:text-[26px]" : "text-xl sm:text-[22px]"
              }`}
            >
              {discountInfo.formattedCurrentPrice}
            </span>
            {discountInfo.hasDiscount && (
              <span className="rounded-md bg-[#c0283a] px-1.5 py-0.5 text-xs font-bold text-white">
                -{discountInfo.discountPercent}%
              </span>
            )}
          </div>

          {discountInfo.hasDiscount && discountInfo.formattedOriginalPrice && (
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 border-t border-gray-light/50 pt-2 text-sm text-navy/70">
              <span>Giá gốc:</span>
              <span className="font-semibold text-navy/60 line-through">
                {discountInfo.formattedOriginalPrice}
              </span>
            </div>
          )}

          {!hasNumericPrice && (
            <div className="mt-1.5 text-xs text-navy/70">
              Báo giá lắp đặt trọn gói tốt nhất
            </div>
          )}
        </div>

        {/* Full-width call-to-action button */}
        <div className="w-full pt-1">
          <Link href={`/product/${product.id}`} className="block w-full">
            <button
              className={`w-full rounded-xl border border-brand-green bg-[#F8F7F3] text-center font-extrabold uppercase tracking-wider text-brand-green transition-all duration-300 hover:bg-brand-green hover:text-white hover:border-brand-green hover:shadow-md hover:shadow-brand-green/20 flex items-center justify-center gap-1.5 cursor-pointer ${
                isLarge ? "py-3 text-[12px]" : "py-2.5 text-[11px]"
              }`}
            >
              <span>Tư Vấn & Nhận Ưu Đãi</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
