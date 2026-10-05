"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, fadeUpSlow, staggerContainer } from "@/lib/motion-variants";
import { PARTNER_BRANDS } from "@/data/home-data";
import content from "@/data/content.json";

function PartnerLogo({
  name,
  logo,
  className,
}: {
  name: string;
  logo?: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const isKassler = name.toLowerCase() === "kassler";

  if (!logo || failed) {
    return (
      <span className={`text-center text-lg sm:text-xl lg:text-2xl ${className}`}>
        {name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      className={
        isKassler
          ? "max-h-14 w-auto max-w-[180px] object-contain sm:max-h-16 sm:max-w-[200px]"
          : "max-h-10 w-auto max-w-[150px] object-contain sm:max-h-12"
      }
      onError={() => setFailed(true)}
    />
  );
}

export default function BrandsSection() {
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
          {PARTNER_BRANDS.map((brand, index) => {
            const mobileDivider = index % 2 === 0;
            const desktopDivider = (index + 1) % 4 !== 0;

            return (
              <div
                key={brand.name}
                className={`flex min-h-16 items-center justify-center px-3 sm:min-h-20 sm:px-6 ${
                  mobileDivider ? "border-r border-gray-light/60" : ""
                } ${
                  desktopDivider
                    ? "sm:border-r sm:border-gray-light/60"
                    : "sm:border-r-0"
                }`}
              >
                <PartnerLogo
                  name={brand.name}
                  logo={brand.logo}
                  className={brand.className}
                />
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
