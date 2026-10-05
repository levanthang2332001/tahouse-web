"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { staggerContainer, fadeUp, fadeUpSlow } from "@/lib/motion-variants";
import { STORE_COPY, STORE_IMAGES } from "@/data/home-data";
import { COMPANY_LEGAL } from "@/data/company-legal";

const MAPS_URL = "https://maps.app.goo.gl/igZiLjUh7upisCRM8";

export default function StoreSection() {
  const [active, setActive] = useState(0);
  const featured = STORE_IMAGES[active] ?? STORE_IMAGES[0];

  return (
    <section
      id="store"
      className="w-full border-t border-gray-light/35 bg-cream py-20 lg:py-28"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1440px] px-6 lg:px-12"
      >
        <motion.div variants={fadeUpSlow} className="mb-12 text-left">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-green">
            {STORE_COPY.prefix}
          </h3>
          <h2 className="mb-4 whitespace-normal font-serif text-3xl leading-tight text-navy sm:whitespace-nowrap sm:text-4xl lg:text-[2.75rem]">
            {STORE_COPY.title}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-navy/70">
            {STORE_COPY.desc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div variants={fadeUp} className="lg:col-span-7">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-200 shadow-xs sm:max-h-[680px] sm:aspect-auto sm:h-[min(680px,85vw)]">
              <Image
                key={featured}
                src={featured}
                alt={`Showroom TA HOUSE — ảnh ${active + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover object-center"
                priority={false}
              />
            </div>

            <div className="mt-3 flex gap-2 sm:gap-2.5">
              {STORE_IMAGES.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(idx)}
                  aria-label={`Xem ảnh showroom ${idx + 1}`}
                  className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-gray-200 transition-[box-shadow,opacity] sm:h-20 sm:w-14 ${
                    active === idx
                      ? "ring-2 ring-brand-green ring-offset-2 ring-offset-cream"
                      : "opacity-90 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-center gap-8 lg:col-span-5"
          >
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-green">
                {COMPANY_LEGAL.tradeName}
              </p>
              <h3 className="font-serif text-2xl text-navy sm:text-3xl">
                {STORE_COPY.showroomName}
              </h3>
            </div>

            <ul className="space-y-5 text-sm leading-relaxed text-navy/80 sm:text-base">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                <span>{COMPANY_LEGAL.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                <span className="flex flex-col gap-1">
                  <a
                    href={`tel:${COMPANY_LEGAL.phoneTel}`}
                    className="transition-colors hover:text-brand-green"
                  >
                    {COMPANY_LEGAL.phone}
                  </a>
                  <a
                    href={`tel:${COMPANY_LEGAL.phoneSecondaryTel}`}
                    className="transition-colors hover:text-brand-green"
                  >
                    {COMPANY_LEGAL.phoneSecondary}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                <span>{COMPANY_LEGAL.workingHours}</span>
              </li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-brand-green px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                {STORE_COPY.ctaDirections}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`tel:${COMPANY_LEGAL.phoneTel}`}
                className="inline-flex items-center justify-center gap-3 border border-navy px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-navy transition-all hover:bg-navy hover:text-cream"
              >
                {STORE_COPY.ctaCall}
              </a>
              <Link
                href={COMPANY_LEGAL.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-navy/25 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-navy/80 transition-colors hover:border-brand-green hover:text-brand-green"
              >
                {STORE_COPY.ctaZalo}
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
