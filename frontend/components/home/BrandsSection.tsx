"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRANDS } from "@/data/home-data";
import content from "@/data/content.json";

export default function BrandsSection() {
  const [activeBrand, setActiveBrand] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveBrand((prev) => (prev + 1) % BRANDS.length),
      3500
    );
    return () => clearInterval(interval);
  }, []);

  const prev = () => setActiveBrand((p) => (p - 1 + BRANDS.length) % BRANDS.length);
  const next = () => setActiveBrand((p) => (p + 1) % BRANDS.length);

  return (
    <section className="relative w-full overflow-hidden bg-navy py-12 select-none">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 text-left md:flex-row lg:px-12">
        {/* Left label */}
        <div className="relative z-10 flex w-full items-center justify-between md:block md:w-1/4">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-green">
              {content.home.partners.prefix}
            </h3>
            <h2 className="text-base font-semibold uppercase tracking-wide text-cream">
              {content.home.partners.title}
            </h2>
          </div>
          {/* Mobile next button */}
          <button onClick={next} className="text-gray-400 transition-colors hover:text-white md:hidden">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Brand list */}
        <div className="flex w-full items-center justify-between gap-8 opacity-70 md:w-3/4">
          <button
            onClick={prev}
            className="hidden shrink-0 cursor-pointer text-gray-500 transition-colors hover:text-white md:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="relative flex-1 overflow-hidden py-1">
            <div className="flex w-full items-center justify-around gap-4">
              {BRANDS.map((brand, idx) => (
                <span
                  key={brand.name}
                  className={`whitespace-nowrap text-cream transition-all duration-500 ${brand.style} ${
                    activeBrand === idx
                      ? "scale-110 text-brand-green opacity-100 font-bold"
                      : "opacity-40 hover:opacity-100"
                  }`}
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={next}
            className="hidden shrink-0 cursor-pointer text-gray-500 transition-colors hover:text-white md:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
