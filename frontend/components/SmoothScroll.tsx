"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
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

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    // Intercept all hash anchor clicks for smooth scrolling
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

    // Scroll to initial hash on page load
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
    };
  }, []);

  return null;
}
