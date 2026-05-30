"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, fadeUp, fadeUpSlow } from "@/lib/motion-variants";
import { NEWS_IMAGES } from "@/data/home-data";
import content from "@/data/content.json";

export default function NewsSection() {
  return (
    <section id="news" className="w-full bg-cream py-20 lg:py-28 border-t border-gray-light/35">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1440px] px-6 lg:px-12"
      >
        {/* Section heading */}
        <motion.div
          variants={fadeUpSlow}
          className="mb-12 flex flex-col justify-between gap-6 text-left md:flex-row md:items-end"
        >
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-green">
              {content.home.news.prefix}
            </h3>
          </div>
          <Link
            href="#categories"
            className="flex items-center gap-2 text-xs font-semibold text-navy/70 transition-colors hover:text-brand-green"
          >
            {content.home.news.viewAll}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        {/* Article cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content.home.news.articles.map((article, idx) => (
            <motion.article
              key={article.title}
              variants={fadeUp}
              className="group flex cursor-pointer flex-col gap-6 text-left sm:flex-row"
            >
              <div className="relative aspect-video shrink-0 overflow-hidden rounded-sm bg-gray-200 shadow-xs sm:w-1/2 sm:aspect-square">
                <Image
                  src={NEWS_IMAGES[idx]}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-between py-2 sm:w-1/2">
                <div>
                  <span className="mb-3 block text-xs text-gray-500">{article.date}</span>
                  <h4 className="mb-4 line-clamp-3 text-sm font-semibold leading-snug text-navy transition-colors group-hover:text-brand-green">
                    {article.title}
                  </h4>
                </div>
                <span className="flex items-center gap-2 text-xs font-semibold text-navy/60 transition-colors group-hover:text-brand-green">
                  Xem thêm
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
