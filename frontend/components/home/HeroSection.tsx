"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { GoGoal } from "react-icons/go";
import { GiAutoRepair } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";

const CHECK_ITEMS = [
  { icon: GoGoal, label: "Chọn đúng" },
  { icon: GiAutoRepair, label: "Lắp đúng" },
  { icon: MdOutlineSecurity, label: "Sử dụng lâu dài" },
] as const;

const slideVariants: Variants = {
  enter: (d: number) => ({
    x: d > 0 ? "100%" : "-100%",
  }),
  center: {
    x: 0,
    transition: {
      x: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
  exit: (d: number) => ({
    x: d > 0 ? "-100%" : "100%",
    transition: {
      x: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
    },
  }),
};

export default function HeroSection() {
  const [banners, setBanners] = useState<string[]>(["/parner.jpg"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrentIndex((prev) => {
        if (newDirection > 0) {
          return (prev + 1) % banners.length;
        }
        return (prev - 1 + banners.length) % banners.length;
      });
    },
    [banners.length],
  );

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.heroBanners) && data.heroBanners.length > 0) {
          setBanners(data.heroBanners);
        }
      })
      .catch(() => {});
  }, []);

  // Auto scroll to the left every 8s
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length, paginate]);

  const activeBanner = banners[currentIndex] || "/parner.jpg";

  return (
    <section className="relative w-full bg-white overflow-hidden py-12 lg:py-20 flex items-center min-h-[550px] lg:min-h-[650px] border-b border-gray-light/35">
      {/* Right-aligned background image carousel with auto scroll & swipe */}
      <div className="absolute top-0 right-0 h-full w-full lg:w-1/2 z-0 group overflow-hidden">
        <div className="relative h-full w-full">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={banners.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                const swipeThreshold = 40;
                if (info.offset.x < -swipeThreshold || info.velocity.x < -300) {
                  // Vuốt sang trái (swiped left) -> chuyển sang slide kế tiếp
                  paginate(1);
                } else if (info.offset.x > swipeThreshold || info.velocity.x > 300) {
                  // Vuốt sang phải (swiped right) -> chuyển về slide trước
                  paginate(-1);
                }
              }}
              className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
            >
              <Image
                src={activeBanner}
                alt={`TA HOUSE Smart Kitchen Solutions - Banner ${currentIndex + 1}`}
                fill
                priority={currentIndex === 0}
                unoptimized
                draggable={false}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover select-none pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Pagination indicators and controls when more than 1 image */}
          {banners.length > 1 && (
            <>
              {/* Dots navigation (centered) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (idx !== currentIndex) {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }
                    }}
                    aria-label={`Chuyển tới slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-brand-green"
                        : "w-2 bg-navy/25 hover:bg-navy/50"
                    }`}
                  />
                ))}
              </div>

              {/* Previous button on left edge */}
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Slide trước"
                className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 z-20 w-10 sm:w-12 h-20 sm:h-24 rounded-2xl bg-white/25 hover:bg-white/55 backdrop-blur-md text-navy/60 hover:text-navy border border-white/30 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
              >
                <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.2]" />
              </button>

              {/* Next button on right edge */}
              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Slide sau"
                className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-20 w-10 sm:w-12 h-20 sm:h-24 rounded-2xl bg-white/25 hover:bg-white/55 backdrop-blur-md text-navy/60 hover:text-navy border border-white/30 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
              >
                <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.2]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content container (left-aligned on desktop) */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1440px] px-6 lg:px-12">
        <div className="hidden lg:block max-w-2xl text-left">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
