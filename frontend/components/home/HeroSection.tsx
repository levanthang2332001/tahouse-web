"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { GoGoal } from "react-icons/go";
import { GiAutoRepair } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";

const CHECK_ITEMS = [
  { icon: GoGoal, label: "Chọn đúng" },
  { icon: GiAutoRepair, label: "Lắp đúng" },
  { icon: MdOutlineSecurity, label: "Sử dụng lâu dài" },
] as const;

export default function HeroSection() {
  return (
    <section className="relative w-full bg-white overflow-hidden py-12 lg:py-20 flex items-center min-h-[550px] lg:min-h-[650px] border-b border-gray-light/35">
      {/* Right-aligned background image with elegant split fade */}
      <div className="absolute top-0 right-0 h-full w-full lg:w-1/2 z-0">
        <div className="relative h-full w-full">
          <Image
            src="/parner.png"
            alt="TA HOUSE Smart Kitchen Solutions"
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Smooth fade overlay to merge with left cream background */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white from-0% to-transparent to-25% z-10" />
        </div>
      </div>

      {/* Content container (left-aligned on desktop) */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1440px] px-6 lg:px-12">
        <div className="max-w-2xl text-left bg-white/85 p-6 rounded-2xl backdrop-blur-xs lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          {/* Subtitle accent */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-[1.5px] w-8 bg-champagne" />
            <span className="text-xs font-bold uppercase tracking-widest text-champagne">
              SMART LIVING SOLUTIONS
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6 font-sans text-3xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-navy lg:tracking-tighter"
          >
            Thiết bị phù hợp<br />cho từng gia đình
          </motion.h1>

          {/* Description with inline brand logo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 max-w-lg text-sm font-semibold leading-relaxed text-navy/80 md:text-base"
          >
            <img
              src="/logoTAtitle1.svg"
              alt="TA HOUSE"
              className="inline-block h-3.5 md:h-[15px] w-auto align-middle mr-1 relative top-[1px]"
            />{" "}
            chuyên tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp và khóa điện tử phù hợp với nhu cầu sử dụng thực tế.
          </motion.p>

          {/* Checklist items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="flex flex-col sm:flex-row sm:items-center gap-y-3.5 gap-x-6 mb-10 text-sm font-semibold text-navy"
          >
            {CHECK_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  {i > 0 && <span className="hidden sm:inline text-navy/25">•</span>}
                  <div className="flex items-center gap-3 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 shadow-xs transition-transform duration-300 group-hover:scale-110">
                      <Icon size={16} />
                    </div>
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              href="/products"
              className="flex items-center gap-2 bg-brand-green hover:bg-lime-dark px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-brand-green/20"
            >
              Tư vấn giải pháp
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="group flex items-center gap-2 bg-cream border border-gray-light hover:border-brand-green hover:text-brand-green px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-navy transition-all shadow-sm"
            >
              Xem sản phẩm
              <LayoutGrid className="h-4 w-4 text-navy/70 group-hover:text-brand-green transition-colors" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
