"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { ZaloIcon } from "@/components/ui/icons";
import { COMPANY_LEGAL } from "@/data/company-legal";
import { POLICY_NAV_LINKS } from "@/data/policies";

const SOCIAL_LINKS = [
  { href: COMPANY_LEGAL.facebookUrl, icon: Facebook, label: "Facebook", iconClass: "h-3.5 w-3.5" },
  { href: COMPANY_LEGAL.zaloUrl, icon: ZaloIcon,  label: "Zalo",    iconClass: undefined },
] as const;

const SERVICE_LINKS = [
  "Thiết bị bếp",
  "Phụ kiện tủ bếp",
  "Khóa điện tử – khóa vân tay",
  "Két sắt thông minh",
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
              <span className="mt-3 block text-[10px] font-medium tracking-wide text-navy/60">
                Thiết bị bếp &amp; Khóa thông minh
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-left text-xs font-normal leading-relaxed text-navy/70">
              TA HOUSE chuyên tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp, khóa điện tử và két sắt thông minh phù hợp với từng gia đình.
            </p>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label, iconClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
            <ul className="space-y-4 text-left text-xs font-normal text-navy/70">
              {SERVICE_LINKS.map((label) => (
                <li key={label}>
                  <Link href="/products" className="transition-colors hover:text-brand-green">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Chính sách mua hàng */}
          <div className="flex flex-col items-start lg:col-span-2 lg:pl-2">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">
              Chính sách mua hàng
            </h4>
            <ul className="space-y-3 text-left text-xs font-normal text-navy/70">
              {POLICY_NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    scroll={false}
                    className="transition-colors hover:text-brand-green"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Về TA HOUSE */}
          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-navy">Về TA HOUSE</h4>
            <ul className="space-y-4 text-left text-xs font-normal text-navy/70">
              {ABOUT_LINKS.map((label) => (
                <li key={label}>
                  <Link href="/products" className="transition-colors hover:text-brand-green">
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
                <span className="text-xs font-normal leading-relaxed text-navy/80">
                  {COMPANY_LEGAL.address}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span className="text-xs font-normal text-navy/80">
                  <span className="font-semibold">Hotline:</span>{" "}
                  <a
                    href={`tel:${COMPANY_LEGAL.phoneTel}`}
                    className="transition-colors hover:text-brand-green"
                  >
                    {COMPANY_LEGAL.phone}
                  </a>
                  {" – "}
                  <a
                    href={`tel:${COMPANY_LEGAL.phoneSecondaryTel}`}
                    className="transition-colors hover:text-brand-green"
                  >
                    {COMPANY_LEGAL.phoneSecondary}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-green" />
                <a
                  href={`mailto:${COMPANY_LEGAL.email}`}
                  className="text-xs font-normal text-navy/80 transition-colors hover:text-brand-green"
                >
                  <span className="font-semibold">Email:</span> {COMPANY_LEGAL.email}
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

        {/* Bottom Line — kiểu thông tin pháp lý căn trái */}
        <div className="border-t border-gray-light/65 pt-6 text-left">
          <p className="mb-3 text-xs font-normal italic text-navy/50">
            © {new Date().getFullYear()} {COMPANY_LEGAL.tradeName}. All rights reserved.
          </p>
          <div className="space-y-1 text-[13px] font-normal leading-snug text-navy/70">
            <p className="font-bold uppercase tracking-wide text-navy">
              {COMPANY_LEGAL.legalName}
            </p>
            <p className="font-normal">{COMPANY_LEGAL.englishName}</p>
            <p className="font-normal">{COMPANY_LEGAL.abbreviatedName}</p>
            <p className="font-normal">
              <span className="font-semibold text-navy/80">MST:</span> {COMPANY_LEGAL.taxCode}
            </p>
            <p className="font-normal">
              <span className="font-semibold text-navy/80">
                {COMPANY_LEGAL.representativeTitle}:
              </span>{" "}
              {COMPANY_LEGAL.representative}
            </p>
            <p className="font-normal">{COMPANY_LEGAL.address}</p>
            <p className="font-normal">
              <span className="font-semibold text-navy/80">Hotline:</span>{" "}
              <a
                href={`tel:${COMPANY_LEGAL.phoneTel}`}
                className="transition-colors hover:text-brand-green"
              >
                {COMPANY_LEGAL.phone}
              </a>
              {" – "}
              <a
                href={`tel:${COMPANY_LEGAL.phoneSecondaryTel}`}
                className="transition-colors hover:text-brand-green"
              >
                {COMPANY_LEGAL.phoneSecondary}
              </a>
            </p>
            <p className="font-normal">
              <span className="font-semibold text-navy/80">Website:</span>{" "}
              <a
                href={COMPANY_LEGAL.website}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-green"
              >
                {COMPANY_LEGAL.websiteDisplay}
              </a>
            </p>
            <p className="font-normal">
              <span className="font-semibold text-navy/80">Email:</span>{" "}
              <a
                href={`mailto:${COMPANY_LEGAL.email}`}
                className="transition-colors hover:text-brand-green"
              >
                {COMPANY_LEGAL.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
