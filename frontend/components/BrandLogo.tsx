"use client";

import { useState } from "react";
import type { Brand } from "@/lib/types/product";
import { getLocalBrandLabel, getLocalBrandLogo } from "@/lib/brand-logos";

const BRAND_TEXT_CLASS: Record<string, string> = {
  philips: "text-[#0066a1]",
  kassler: "text-red-600 italic",
  bosch: "text-[#E31C23]",
  sharp: "text-red-600",
  hyundai: "text-[#002c5f]",
  hubert: "text-navy",
  fanlight: "text-[#1a1a1a]",
  "hd-door": "text-[#002c5f]",
  karofi: "text-[#0066b3]",
  malloca: "text-[#C9A227]",
};

export default function BrandLogo({
  brand,
  className = "h-6 w-auto max-w-[100px] object-contain",
}: {
  brand: Brand;
  className?: string;
}) {
  const localLogo = getLocalBrandLogo(brand.slug, brand.name);
  const localLabel = getLocalBrandLabel(brand.slug, brand.name);
  const [failed, setFailed] = useState(false);

  if (localLogo && !failed) {
    const isKassler = brand.slug === "kassler" || brand.name.toLowerCase() === "kassler";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={localLogo}
        alt={brand.name}
        className={
          isKassler
            ? "h-9 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-[160px]"
            : className
        }
        onError={() => setFailed(true)}
      />
    );
  }

  const label = localLabel || brand.name.toUpperCase();
  const colorClass =
    BRAND_TEXT_CLASS[brand.slug] ||
    BRAND_TEXT_CLASS[brand.name.trim().toLowerCase()] ||
    "text-navy/70";

  return (
    <span
      className={`select-none text-[15px] font-extrabold tracking-wide sm:text-base ${colorClass}`}
    >
      {label}
    </span>
  );
}
