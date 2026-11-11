"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AUTOPLAY_MS = 6000;

// Cache trong phiên: banner bị ẩn/hiện theo bộ lọc, không cần tải lại mỗi lần hiện
let cachedBanners: string[] | null = null;

/**
 * Banner ưu đãi đầu trang /products. Admin quản lý danh sách ảnh ở tab "Banner Ưu đãi";
 * danh sách rỗng thì ẩn hẳn banner.
 */
export default function PromoBanner({ className = "" }: { className?: string }) {
  // null = đang tải (giữ chỗ để tránh giật layout), [] = admin đã tắt banner
  const [banners, setBanners] = useState<string[] | null>(cachedBanners);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (cachedBanners) return;
    let cancelled = false;
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        cachedBanners = Array.isArray(data?.promoBanners) ? data.promoBanners : [];
        if (!cancelled) setBanners(cachedBanners);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = banners?.length ?? 0;

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setActive((prev) => (prev + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count]);

  if (banners === null) {
    return <div className={`aspect-[16/5] animate-pulse rounded-2xl bg-gray-light/40 ${className}`} />;
  }

  if (count === 0) return null;

  const current = banners[active % count];

  return (
    <div className={`relative aspect-[16/5] overflow-hidden rounded-2xl bg-gray-light/30 shadow-sm ${className}`}>
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={`${current}-${active}`}
          src={current}
          alt={`Chương trình ưu đãi TA HOUSE ${count > 1 ? active + 1 : ""}`.trim()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      </AnimatePresence>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Xem banner ưu đãi ${idx + 1}`}
              className={`h-2 cursor-pointer rounded-full transition-all ${
                idx === active % count ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
