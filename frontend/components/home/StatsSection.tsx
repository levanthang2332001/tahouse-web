"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion-variants";
import content from "@/data/content.json";

export default function StatsSection() {
  return (
    <section className="w-full bg-cream py-16 border-y border-gray-light/35">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 md:grid-cols-4 md:gap-0"
      >
        {content.home.stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="flex flex-col items-center px-4 text-center md:border-r border-gray-light/40 last:border-r-0"
          >
            <span className="mb-2 font-serif text-6xl md:text-7xl tracking-normal text-brand-green">
              {stat.value}
              <span className="text-4xl">{stat.suffix}</span>
            </span>
            <span className="mb-1 text-sm font-semibold text-navy">{stat.label}</span>
            <span className="text-xs text-navy/60">{stat.sublabel}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
