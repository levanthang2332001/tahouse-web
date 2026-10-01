"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { ZaloIcon } from "@/components/ui/icons";
import { COMPANY_LEGAL } from "@/data/company-legal";
import { POLICY_CORE_LINKS } from "@/data/policies";

const SOCIAL_LINKS = [
  {
    href: COMPANY_LEGAL.facebookUrl,
    icon: Facebook,
    label: "Facebook Fanpage",
    bgColor: "bg-[#1877F2] hover:bg-[#166fe5]",
    iconClass: "h-4.5 w-4.5 text-white",
  },
  {
    href: COMPANY_LEGAL.zaloUrl,
    icon: ZaloIcon,
    label: "Zalo OA",
    bgColor: "bg-[#0068FF] hover:bg-[#0056d6]",
    iconClass: "h-4.5 w-4.5 text-white",
  },
  {
    href: `tel:${COMPANY_LEGAL.phoneTel}`,
    icon: Phone,
    label: `Hotline ${COMPANY_LEGAL.phone}`,
    bgColor: "bg-rose-600 hover:bg-rose-700",
    iconClass: "h-4.5 w-4.5 text-white",
  },
  {
    href: `mailto:${COMPANY_LEGAL.email}`,
    icon: Mail,
    label: `Email ${COMPANY_LEGAL.email}`,
    bgColor: "bg-teal-600 hover:bg-teal-700",
    iconClass: "h-4.5 w-4.5 text-white",
  },
] as const;

const SERVICE_LINKS = [
  { href: "/products?cat=lock-parent", label: "Khóa điện tử – khóa vân tay" },
  { href: "/products?cat=Smart", label: "Két sắt thông minh" },
  { href: "/products?cat=kitchen-group", label: "Thiết bị bếp" },
  { href: "/products?cat=fanlight-group", label: "Quạt trần đèn" },
  { href: "/products?cat=water-group", label: "Máy lọc nước" },
  { href: "/products?cat=door-group", label: "Cửa" },
];

const ABOUT_LINKS = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/huong-dan-dat-hang", label: "Hướng dẫn đặt hàng" },
  { href: "/chinh-sach/chu-quan-tmdt", label: "Thông tin doanh nghiệp" },
  { href: "/chinh-sach/quyen-va-nghia-vu", label: "Quyền và nghĩa vụ" },
  { href: "/chinh-sach/quy-che-hoat-dong", label: "Quy chế hoạt động" },
  { href: "/contact", label: "Liên hệ" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-10 w-full border-t border-gray-light/65 bg-cream pb-10 pt-14 font-sans leading-relaxed text-navy"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start lg:col-span-3">
            <Link href="/" className="mb-5 block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logoTA2.svg"
                alt="TA House Logo"
                className="h-14 w-auto object-contain transition-opacity group-hover:opacity-80"
              />
              <span className="mt-2 block text-xs font-semibold tracking-wide text-navy/55">
                Thiết bị bếp &amp; Khóa thông minh
              </span>
            </Link>
            <p className="mb-5 max-w-xs text-left text-[13px] font-semibold leading-relaxed text-navy/65">
              Tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp, khóa điện tử và két sắt thông minh phù
              hợp từng gia đình.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label, bgColor, iconClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor} shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95`}
                  title={label}
                  aria-label={label}
                >
                  <Icon className={iconClass} />
                </a>
              ))}
            </div>
          </div>

          {/* Dịch vụ */}
          <div className="flex flex-col items-start lg:col-span-2 lg:pl-2">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy">Dịch vụ</h4>
            <ul className="space-y-3 text-left text-[13px] font-semibold text-navy/70">
              {SERVICE_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-brand-green">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chính sách */}
          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy">
              Chính sách
            </h4>
            <ul className="space-y-3 text-left text-[13px] font-semibold text-navy/70">
              {POLICY_CORE_LINKS.map(({ href, label }) => (
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

          {/* Về TA HOUSE */}
          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy">
              Về TA HOUSE
            </h4>
            <ul className="space-y-3 text-left text-[13px] font-semibold text-navy/70">
              {ABOUT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-brand-green">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div className="flex flex-col items-start text-left lg:col-span-3 lg:border-l lg:border-gray-light/70 lg:pl-8">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy">
              Liên hệ
            </h4>
            <ul className="space-y-3.5">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span className="text-[13px] font-semibold leading-relaxed text-navy/75">
                  {COMPANY_LEGAL.address}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span className="text-[13px] font-semibold leading-relaxed text-navy/75">
                  <a
                    href={`tel:${COMPANY_LEGAL.phoneTel}`}
                    className="transition-colors hover:text-brand-green"
                  >
                    {COMPANY_LEGAL.phone}
                  </a>
                  <br />
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
                  className="text-[13px] font-semibold text-navy/75 transition-colors hover:text-brand-green"
                >
                  {COMPANY_LEGAL.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom — gọn: copyright + MST, không lặp lại hotline/email */}
        <div className="mt-12 flex flex-col gap-4 border-t border-gray-light/65 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl space-y-1 text-left text-[13px] font-semibold leading-relaxed text-navy/55">
            <p className="text-[13px] font-semibold text-navy/45">
              © {new Date().getFullYear()} {COMPANY_LEGAL.tradeName}. All rights reserved.
            </p>
            <p className="font-bold uppercase tracking-wide text-navy/70">
              {COMPANY_LEGAL.legalName}
            </p>
            <p>
              MST: {COMPANY_LEGAL.taxCode} · {COMPANY_LEGAL.representativeTitle}:{" "}
              {COMPANY_LEGAL.representative}
            </p>
            <p>{COMPANY_LEGAL.address}</p>
            <p>
              Website:{" "}
              <a
                href={COMPANY_LEGAL.website}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-green"
              >
                {COMPANY_LEGAL.websiteDisplay}
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-start rounded-full bg-navy text-cream shadow-md transition-all hover:bg-brand-green hover:text-white sm:self-auto"
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
