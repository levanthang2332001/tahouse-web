"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#")) {
        const targetElement = document.querySelector(href);
        if (targetElement instanceof HTMLElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, { offset: -20 });
        }
      } else if (href.startsWith("/#")) {
        if (window.location.pathname === "/") {
          const hash = href.substring(1);
          const targetElement = document.querySelector(hash);
          if (targetElement instanceof HTMLElement) {
            e.preventDefault();
            lenis.scrollTo(targetElement, { offset: -20 });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    if (window.location.hash) {
      setTimeout(() => {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement instanceof HTMLElement) {
          lenis.scrollTo(targetElement, { immediate: false, offset: -20 });
        }
      }, 300);
    }

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
      const win = window as Window & { __lenis?: Lenis };
      if (win.__lenis === lenis) delete win.__lenis;
    };
  }, []);

  // Mỗi lần đổi route → về đầu trang (tránh giật vị trí cũ / sticky nhảy)
  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
    }
  }, [pathname]);

  return null;
}
