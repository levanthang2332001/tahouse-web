"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { staggerContainerSlow, slideInLeft, slideInRight } from "@/lib/motion-variants";
import { SOLUTION_META } from "@/data/home-data";
import content from "@/data/content.json";

export default function SolutionsSection() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((p) => (p - 1 + SOLUTION_META.length) % SOLUTION_META.length);
  const next = () => setActive((p) => (p + 1) % SOLUTION_META.length);

  const current = SOLUTION_META[active];
  const Icon = current.icon;

  return (
    <section id="solutions" className="w-full overflow-hidden bg-neutral py-20 lg:py-28">
      <motion.div
        variants={staggerContainerSlow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 px-6 lg:flex-row lg:gap-24 lg:px-12"
      >
        {/* Left text panel */}
        <motion.div variants={slideInLeft} className="text-left lg:w-1/3">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-green">
            {content.home.solutions.prefix}
          </h3>
          <h2 className="mb-6 whitespace-pre-line font-serif text-4xl leading-tight text-navy lg:text-5xl">
            {content.home.solutions.title}
          </h2>
          <p className="mb-10 text-base leading-relaxed text-navy/70">
            {content.home.solutions.items[active].desc}
          </p>
          <Link
            href="#contact"
            className="inline-flex items-center gap-4 border border-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-navy transition-all hover:bg-navy hover:text-cream"
          >
            {content.home.solutions.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Right image panel */}
        <motion.div
          variants={slideInRight}
          className="relative h-[400px] w-full lg:h-[600px] lg:w-2/3"
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-lg">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={current.img}
                alt={content.home.solutions.items[active].title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>

          {/* Floating info card */}
          <div className="absolute bottom-0 left-0 z-10 w-[85%] max-w-[340px] rounded-2xl bg-[#A14833] p-8 text-left text-white shadow-xl sm:w-[80%] lg:-left-[170px] lg:bottom-12 border border-white/10 transition-all duration-300">
            <div className="mb-6 flex items-start gap-4">
              <Icon className="h-8 w-8 shrink-0 opacity-90 text-white" />
              <p className="text-sm font-bold leading-snug">
                {content.home.solutions.items[active].title}
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white transition-colors"
            >
              Xem chi tiết
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Navigation buttons */}
          <div className="absolute bottom-6 right-6 z-10 flex gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
