"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";

// High-fidelity custom SVG for Zalo Icon
const ZaloIcon = () => (
  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.05.62 3.96 1.68 5.54L2.22 22l4.63-1.46C8.36 21.35 10.11 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm3.3 12.3c-.22.42-.56.76-.98.98-.42.22-.92.33-1.48.33H8.38V10.4h2.59c.56 0 1.04.11 1.45.33.41.22.73.55.95.98.22.42.33.91.33 1.45 0 .54-.11 1.03-.34 1.45zm-1.66-3.3h-1.84V9.66h1.84c.34 0 .63.07.86.22.23.15.34.37.34.67 0 .3-.11.52-.34.67-.23.15-.52.22-.86.22zm.34 3.3h-2.18V12.9h2.18c.34 0 .63.07.86.22.23.15.34.37.34.67 0 .3-.11.52-.34.67-.23.15-.52.22-.86.22z" />
  </svg>
);

// High-fidelity custom SVG for TikTok Icon
const TiktokIcon = () => (
  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17.96 1.09 2.3 1.8 3.73 1.96v4.07c-1.78-.17-3.47-.99-4.66-2.35-.04-.04-.07-.08-.13-.15v7.37c-.03 2.1-.73 4.22-2.18 5.75-1.72 1.86-4.32 2.76-6.84 2.37-2.33-.31-4.52-1.74-5.69-3.83-1.42-2.45-1.41-5.7.03-8.13 1.28-2.23 3.66-3.72 6.22-3.89v4.09c-1.37.16-2.67.97-3.26 2.22-.64 1.3-.43 3.05.5 4.17.99 1.15 2.64 1.57 4.02.99 1.06-.41 1.77-1.47 1.8-2.62V.02z" />
  </svg>
);

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-10 w-full bg-cream border-t border-gray-light/65 pb-8 pt-16 font-sans leading-relaxed text-navy transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Logo & Slogan */}
          <div className="flex flex-col items-start lg:col-span-3">
            <Link href="/" className="mb-6 block">
              <div className="flex items-center gap-3">
                {/* Modern Brand Green House Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-green/20 bg-brand-green/5 text-brand-green shadow-xs">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center leading-none">
                    <span className="text-xl font-extrabold tracking-tight text-brand-green">TA</span>
                    <span className="ml-0.5 text-xl font-extrabold tracking-tight text-navy">HOUSE</span>
                  </div>
                  <span className="text-[10px] font-bold text-navy/60 block mt-1 tracking-wide">
                    Thiết bị bếp & Khóa thông minh
                  </span>
                </div>
              </div>
            </Link>
            <p className="mb-6 max-w-xs text-left text-xs font-semibold leading-relaxed text-navy/70">
              TA HOUSE chuyên tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp, khóa điện tử và két sắt thông minh phù hợp với từng gia đình.
            </p>
            <div className="flex gap-2.5">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-cream transition-all hover:bg-brand-green hover:scale-105"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-cream transition-all hover:bg-brand-green hover:scale-105"
                aria-label="Zalo"
              >
                <ZaloIcon />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-cream transition-all hover:bg-brand-green hover:scale-105"
                aria-label="Youtube"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-cream transition-all hover:bg-brand-green hover:scale-105"
                aria-label="Tiktok"
              >
                <TiktokIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Dịch vụ */}
          <div className="flex flex-col items-start lg:col-span-2 lg:pl-4">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">
              Dịch vụ
            </h4>
            <ul className="space-y-4 text-left text-xs font-bold text-navy/70">
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Thiết bị bếp</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Phụ kiện tủ bếp</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Khóa điện tử – khóa vân tay</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Két sắt thông minh</Link></li>
            </ul>
          </div>

          {/* Column 3: Hỗ trợ */}
          <div className="flex flex-col items-start lg:col-span-2 lg:pl-2">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">
              Hỗ trợ
            </h4>
            <ul className="space-y-4 text-left text-xs font-bold text-navy/70">
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Hướng dẫn sử dụng</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Chính sách đổi trả</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Column 4: Về TA HOUSE */}
          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">
              Về TA HOUSE
            </h4>
            <ul className="space-y-4 text-left text-xs font-bold text-navy/70">
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Giới thiệu</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Giải pháp</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Dự án</Link></li>
              <li><Link href="/products" className="hover:text-brand-green transition-colors">Tin tức</Link></li>
            </ul>
          </div>

          {/* Column 5: Thông tin liên hệ (With vertical separator line on desktop) */}
          <div className="relative flex flex-col items-start text-left lg:col-span-3 lg:border-l lg:border-gray-light lg:pl-8">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span className="text-xs font-bold leading-relaxed text-navy/80">
                  961A Kha Vạn Cân,
                  <br />
                  P. Linh Xuân, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-green" />
                <a href="tel:0938824479" className="text-xs font-bold text-navy/80 hover:text-brand-green transition-colors">
                  Hotline: 0938 824 479
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-green" />
                <a href="mailto:info@tahouse.vn" className="text-xs font-bold text-navy/80 hover:text-brand-green transition-colors">
                  Email: info@tahouse.vn
                </a>
              </li>
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-navy text-cream hover:bg-brand-green hover:text-white transition-all shadow-md"
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="flex flex-col items-center justify-center border-t border-gray-light/65 pt-8">
          <p className="text-[11px] font-bold text-navy/40">
            © 2024 TA HOUSE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
