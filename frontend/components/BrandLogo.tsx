"use client";

import { useState } from "react";
import type { Brand } from "@/lib/types/product";
import { getBrandLogoCandidates, getLocalBrandLabel } from "@/lib/brand-logos";

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
  const brandSlug = (brand?.slug || brand?.name || "").toLowerCase().trim();
  const brandName = brand?.name || brandSlug;
  const candidates = getBrandLogoCandidates(brand?.logo, brandSlug, brandName);
  const localLabel = getLocalBrandLabel(brandSlug, brandName);
  // Step to the next source whenever one fails to load
  const [attempt, setAttempt] = useState(0);
  const logoSrc = candidates[attempt];

  if (logoSrc) {
    const isKassler = brandSlug === "kassler" || brandName.toLowerCase() === "kassler";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt={brandName}
        className={
          isKassler
            ? "h-9 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-[160px]"
            : className
        }
        onError={() => setAttempt((n) => n + 1)}
      />
    );
  }

  const label = localLabel || (brandName ? brandName.toUpperCase() : "");
  const colorClass =
    BRAND_TEXT_CLASS[brandSlug] ||
    BRAND_TEXT_CLASS[brandName.trim().toLowerCase()] ||
    "text-navy/70";

  return (
    <span
      className={`select-none text-[15px] font-extrabold tracking-wide sm:text-base ${colorClass}`}
    >
      {label}
    </span>
  );
}
