"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, fadeUp, fadeUpSlow } from "@/lib/motion-variants";
import { SERVICES } from "@/data/home-data";
import content from "@/data/content.json";
import { fetchProducts } from "@/lib/api/products";
import { mapFilterToApiParams } from "@/lib/product-filters";

async function fetchCategoryTotal(catId: string): Promise<number> {
  // Két: gộp Kassler (Smart) + Philips (ket-sat)
  if (catId === "Smart") {
    const [smart, ketSat] = await Promise.all([
      fetchProducts({ page: 1, limit: 1, category: "Smart" }),
      fetchProducts({ page: 1, limit: 1, category: "ket-sat" }),
    ]);
    return smart.total + ketSat.total;
  }

  const api = mapFilterToApiParams(catId);
  const data = await fetchProducts({
    page: 1,
    limit: 1,
    category: api.category,
    subcategory: api.subcategory,
    group: api.group,
    brand: api.brand,
  });
  return data.total;
}

export default function CategoriesSection() {
  const [totals, setTotals] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let cancelled = false;

    for (const service of SERVICES) {
      void (async () => {
        try {
          const total = await fetchCategoryTotal(service.catId);
          if (cancelled) return;
          setTotals((prev) => ({ ...prev, [service.catId]: total }));
        } catch {
          if (cancelled) return;
          setTotals((prev) => ({ ...prev, [service.catId]: null }));
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="categories" className="w-full bg-white py-12 lg:py-16">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1440px] px-6 lg:px-12 text-center"
      >
        {/* Section heading */}
        <motion.div
          variants={fadeUpSlow}
          className="flex flex-col md:flex-row md:items-end md:justify-between text-left mb-12 gap-6"
        >
          <div className="space-y-3 max-w-3xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-champagne">
              DỊCH VỤ CỦA CHÚNG TÔI
            </h3>
            <h2 className="font-sans text-3xl font-bold leading-tight text-navy md:text-4xl">
              Giải pháp toàn diện<br />cho không gian sống hiện đại
            </h2>
            <div className="h-[3px] w-12 bg-brand-green mt-4 rounded-full" />
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-2 shrink-0 text-xs font-bold uppercase tracking-wider text-navy/70 hover:text-brand-green transition-colors pb-1"
          >
            {content.home.categories.viewAll}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Service category cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const total = totals[service.catId];
            const countLabel =
              typeof total === "number"
                ? `${total.toLocaleString("vi-VN")} sản phẩm đang có`
                : total === null
                  ? "Xem danh sách sản phẩm"
                  : "Đang tải số lượng...";

            return (
              <motion.div
                key={service.title}
                variants={fadeUp}
                className="rounded-2xl border border-gray-light bg-cream text-left shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-brand-green/30 transition-all duration-300 group overflow-hidden"
              >
                <Link
                  href={`/products?cat=${service.catId}`}
                  className="block cursor-pointer flex-grow flex flex-col justify-between"
                >
                  {/* Category image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral shadow-inner border-b border-gray-light/35">
                    <Image
                      src={service.img}
                      alt={service.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 25vw"
                      className={`${service.imgClass} transition-transform duration-750 group-hover:scale-105`}
                    />
                  </div>
                  {/* Card content */}
                  <div className="p-6 lg:p-7 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-grow">
                        <h4 className="text-base lg:text-lg font-bold uppercase tracking-wide text-navy group-hover:text-brand-green transition-colors leading-tight min-h-[3rem] lg:min-h-[3.5rem] flex items-center">
                          {service.title}
                        </h4>
                        <p
                          className={`mt-2 text-sm font-bold leading-relaxed ${
                            typeof total === "number"
                              ? "text-brand-green"
                              : "text-navy/45"
                          }`}
                        >
                          {countLabel}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-green/20 bg-brand-green/5 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
