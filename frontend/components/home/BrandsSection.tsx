"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, fadeUpSlow, staggerContainer } from "@/lib/motion-variants";
import content from "@/data/content.json";

interface DisplayBrand {
  name: string;
  slug: string;
  logo?: string;
}

function PartnerLogo({
  name,
  logo,
}: {
  name?: string;
  logo?: string;
}) {
  const [failed, setFailed] = useState(false);
  const brandName = name || "";
  const isKassler = brandName.toLowerCase() === "kassler";

  if (!logo || failed) {
    return (
      <span className="text-center text-lg sm:text-xl lg:text-2xl font-sans font-bold tracking-tight text-navy">
        {brandName}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={brandName}
      className={
        isKassler
          ? "max-h-14 w-auto max-w-[180px] object-contain sm:max-h-16 sm:max-w-[200px] transition-transform duration-300 group-hover/brand:scale-105"
          : "max-h-10 w-auto max-w-[150px] object-contain sm:max-h-12 transition-transform duration-300 group-hover/brand:scale-105"
      }
      onError={() => setFailed(true)}
    />
  );
}

const HOME_BRANDS: DisplayBrand[] = [
  // Dãy 1: Bosch, Kassler, Philips, Hyundai
  { name: "Bosch", slug: "bosch", logo: "/brands/bosch.svg" },
  { name: "Kassler", slug: "kassler", logo: "/brands/kassler.png" },
  { name: "Philips", slug: "philips", logo: "/brands/philips.svg" },
  { name: "Hyundai", slug: "hyundai", logo: "/brands/hyundai.png" },
  // Dãy 2: Malloca, GrandX, Eurosun, Eurogold
  { name: "Malloca", slug: "malloca", logo: "/brands/malloca.svg" },
  { name: "GrandX", slug: "grandx", logo: "/brands/grandx.svg" },
  { name: "Eurosun", slug: "eurosun", logo: "/brands/eurosun.png" },
  { name: "Eurogold", slug: "eurogold", logo: "/brands/eurogold.svg" },
];

export default function BrandsSection() {
  const [brands, setBrands] = useState<DisplayBrand[]>(HOME_BRANDS);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const brandMap = new Map<string, string>();
          data.forEach((b: { name?: string; slug?: string; logo?: string }) => {
            if (b.logo) {
              if (b.name) brandMap.set(b.name.toLowerCase().trim(), b.logo);
              if (b.slug) brandMap.set(b.slug.toLowerCase().trim(), b.logo);
            }
          });

          setBrands(
            HOME_BRANDS.map((item) => {
              const customLogo = brandMap.get(item.name.toLowerCase());
              return {
                name: item.name,
                slug: item.slug,
                logo: customLogo || item.logo,
              };
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-cream py-14 lg:py-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-[1100px] px-6 lg:px-12"
      >
        <motion.div variants={fadeUpSlow} className="mb-10 text-center lg:mb-12">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-brand-green/80 sm:w-24" />
            <span className="h-2 w-2 rotate-45 bg-brand-green" />
            <span className="h-px w-16 bg-brand-green/80 sm:w-24" />
          </div>

          <h2 className="font-sans text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl lg:text-4xl">
            {content.home.partners.title}
          </h2>
          <p className="mt-3 font-sans text-xl font-bold text-brand-green sm:text-2xl lg:text-[28px]">
            {content.home.partners.subtitle}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-navy/55 sm:text-base">
            <span className="font-bold text-brand-green">
              {content.home.partners.descBrand}
            </span>
            {content.home.partners.descAfter}
          </p>
        </motion.div>

        <div className="mb-8 h-px w-full bg-gray-light/70 lg:mb-10" />

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-14"
        >
          {brands.map((brand, index) => {
            const brandSlug = (brand.slug || brand.name || "").toLowerCase().trim();
            const mobileDivider = index % 2 === 0;
            const desktopDivider = (index + 1) % 4 !== 0;

            return (
              <div
                key={brandSlug || brand.name}
                className={`flex min-h-16 items-center justify-center px-3 sm:min-h-20 sm:px-6 ${
                  mobileDivider ? "border-r border-gray-light/60" : ""
                } ${
                  desktopDivider
                    ? "sm:border-r sm:border-gray-light/60"
                    : "sm:border-r-0"
                }`}
              >
                <Link
                  href={`/products?brand=${encodeURIComponent(brandSlug)}`}
                  className="group/brand flex items-center justify-center p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  title={`Xem sản phẩm ${brand.name}`}
                >
                  <PartnerLogo
                    name={brand.name}
                    logo={brand.logo}
                  />
                </Link>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
