"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getCategoryLabel } from "@/data/catalog-taxonomy";
import type { Product } from "@/lib/types/product";
import { formatProductPrice } from "@/lib/format-price";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {

  const getBadgeInfo = (id: string) => {
    const lowerId = id.toLowerCase();
    if (lowerId.includes("9800") || lowerId.includes("pxx") || lowerId.includes("granite")) {
      return { text: "ĐỀ XUẤT", className: "bg-brand-green text-white" };
    }
    if (lowerId.includes("purifier") || lowerId.includes("spice") || lowerId.includes("gate")) {
      return { text: "PHỔ BIẾN", className: "bg-amber-700 text-white" };
    }
    return { text: "MỚI", className: "bg-blue-600 text-white" };
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

  const getSupportText = (category: string) => {
    const installSupportCategories = new Set([
      "Kitchen",
      "Water",
      "Cabinet",
      "bep-tu",
      "bep-dien-tu",
      "bep-gas-am",
      "bep-tu-ket-hop-may-hut",
      "may-hut-mui",
      "may-hut-ap-tuong",
      "may-hut-dao",
      "may-hut-am-tu",
      "may-hut-am-tran",
      "may-hut-classic",
      "may-hut-am-ban",
      "lo-nuong",
      "lo-vi-song",
      "combo-lo-nuong-lo-vi-song",
      "may-rua-chen",
      "may-dien-giai",
      "may-nong-lanh",
      "may-nong-nguoi",
      "may-ro-tu-dung",
      "may-de-gam",
      "cay-nuoc",
    ]);
    if (installSupportCategories.has(category)) {
      return "Đã bao gồm tư vấn lắp đặt";
    }
    return "Hỗ trợ khảo sát thực tế";
  };

  const badge = getBadgeInfo(product.id);
  const suitability = getSuitabilityText(product.id, product.category);
  const support = getSupportText(product.category);
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-light bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-brand-green/30">
      {/* Product Image Area */}
      <div className="relative aspect-[1.4] w-full overflow-hidden bg-cream border-b border-gray-light/35">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral/40 text-[11px] font-semibold uppercase tracking-wider text-navy/35">
            Không có ảnh
          </div>
        )}
        <Link
          href={`/product/${product.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Xem chi tiết ${product.name}`}
        />

        {/* Dynamic status badge */}
        <div className={`absolute left-3 top-3 z-20 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none ${badge.className}`}>
          {badge.text}
        </div>
      </div>

      {/* Product Card Details */}
      <div className="flex flex-grow flex-col p-4.5 text-left">
        {/* Category tag */}
        <span className="mb-1 text-[9px] font-bold uppercase tracking-wider text-navy/40">
          {categoryLabel}
        </span>

        {/* Title */}
        <Link href={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-sans text-[17px] font-extrabold leading-snug text-navy hover:text-brand-green transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Bullet features */}
        <ul className="mt-1 space-y-1">
          {product.features?.slice(0, 2).map((feat, index) => (
            <li key={index} className="text-[11px] text-navy/65 flex items-start gap-1.5 leading-relaxed">
              <span className="text-[12px] text-zinc-400 select-none leading-none mt-0.5">•</span>
              <span className="line-clamp-1">{feat}</span>
            </li>
          ))}
        </ul>

        {/* Suitability text */}
        <div className="mt-2.5 text-[11px] text-navy/60">
          <span className="font-medium">Phù hợp:</span> {suitability}
        </div>

        {/* Price */}
        <div className="mt-3 text-[15px] font-extrabold text-navy leading-none">
          {formatProductPrice(product.price, product.priceRange)}
        </div>

        {/* Support Checkmark */}
        <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-brand-green">
          <span className="text-[11px] leading-none">✓</span>
          <span>{support}</span>
        </div>

        {/* Full-width call-to-action button (Aligned at the very bottom) */}
        <div className="mt-auto pt-4 w-full">
          <Link href={`/product/${product.id}`} className="block w-full">
            <button className="w-full rounded-xl border border-brand-green bg-[#F8F7F3] py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-brand-green transition-all duration-300 hover:bg-brand-green hover:text-white hover:border-brand-green cursor-pointer">
              Nhận tư vấn lắp đặt
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
