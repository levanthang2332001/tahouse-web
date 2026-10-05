"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  MessagesSquare,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/motion-variants";
import content from "@/data/content.json";

const STAT_ICONS: LucideIcon[] = [
  MessagesSquare,
  ClipboardCheck,
  ShieldCheck,
  Wrench,
];

export default function StatsSection() {
  return (
    <section className="w-full bg-cream py-10 lg:py-12 border-y border-gray-light/35">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:px-12"
      >
        {content.home.stats.map((stat, index) => {
          const Icon = STAT_ICONS[index] ?? MessagesSquare;

          return (
            <motion.div
              key={stat.title}
              variants={fadeUp}
              className="flex items-start gap-4 lg:px-6 lg:border-r lg:border-gray-light/50 last:lg:border-r-0"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-green/12 text-brand-green">
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 pt-0.5">
                <h3 className="font-sans text-base font-bold leading-snug text-navy md:text-lg">
                  {stat.title}
                </h3>
                <div className="mt-2.5 mb-2.5 h-[3px] w-9 rounded-full bg-brand-green" />
                <p className="text-sm font-medium leading-relaxed text-navy/55 md:text-[15px]">
                  {stat.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
