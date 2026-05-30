"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { ZaloIcon, TiktokIcon } from "@/components/ui/icons";

const SOCIAL_LINKS = [
  { href: "#", icon: Facebook, label: "Facebook", iconClass: "h-3.5 w-3.5" },
  { href: "#", icon: ZaloIcon,  label: "Zalo",    iconClass: undefined },
  { href: "#", icon: Youtube,   label: "Youtube",  iconClass: "h-3.5 w-3.5" },
  { href: "#", icon: TiktokIcon, label: "Tiktok",  iconClass: undefined },
] as const;

const SERVICE_LINKS = [
  "Thiết bị bếp",
  "Phụ kiện tủ bếp",
  "Khóa điện tử – khóa vân tay",
  "Két sắt thông minh",
];

const SUPPORT_LINKS = [
  "Hướng dẫn sử dụng",
  "Chính sách bảo hành",
  "Chính sách đổi trả",
  "Câu hỏi thường gặp",
];

const ABOUT_LINKS = ["Giới thiệu", "Giải pháp", "Dự án", "Tin tức"];

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
            <Link href="/" className="mb-6 block group">
              <img
                src="/logoTA2.svg"
                alt="TA House Logo"
                className="h-16 w-auto object-contain transition-opacity group-hover:opacity-80"
              />
              <span className="text-[10px] font-bold text-navy/60 block mt-3 tracking-wide">
                Thiết bị bếp &amp; Khóa thông minh
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-left text-xs font-semibold leading-relaxed text-navy/70">
              TA HOUSE chuyên tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp, khóa điện tử và két sắt thông minh phù hợp với từng gia đình.
            </p>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label, iconClass }) => (
                <a
                  key={label}
                  href={href}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-cream transition-all hover:bg-brand-green hover:scale-105"
                  aria-label={label}
                >
                  <Icon {...(iconClass ? { className: iconClass } : {})} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Dịch vụ */}
          <div className="flex flex-col items-start lg:col-span-2 lg:pl-4">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">Dịch vụ</h4>
            <ul className="space-y-4 text-left text-xs font-bold text-navy/70">
              {SERVICE_LINKS.map((label) => (
                <li key={label}>
                  <Link href="/products" className="hover:text-brand-green transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Hỗ trợ */}
          <div className="flex flex-col items-start lg:col-span-2 lg:pl-2">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">Hỗ trợ</h4>
            <ul className="space-y-4 text-left text-xs font-bold text-navy/70">
              {SUPPORT_LINKS.map((label) => (
                <li key={label}>
                  <Link href="/products" className="hover:text-brand-green transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Về TA HOUSE */}
          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">Về TA HOUSE</h4>
            <ul className="space-y-4 text-left text-xs font-bold text-navy/70">
              {ABOUT_LINKS.map((label) => (
                <li key={label}>
                  <Link href="/products" className="hover:text-brand-green transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Thông tin liên hệ */}
          <div className="relative flex flex-col items-start text-left lg:col-span-3 lg:border-l lg:border-gray-light lg:pl-8">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span className="text-xs font-bold leading-relaxed text-navy/80">
                  961A Kha Vạn Cân,<br />P. Linh Xuân, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-green" />
                <a
                  href="tel:0938824479"
                  className="text-xs font-bold text-navy/80 hover:text-brand-green transition-colors"
                >
                  Hotline: 0938 824 479
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-green" />
                <a
                  href="mailto:info@tahouse.vn"
                  className="text-xs font-bold text-navy/80 hover:text-brand-green transition-colors"
                >
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
