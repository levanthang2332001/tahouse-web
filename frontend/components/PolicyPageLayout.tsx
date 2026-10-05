"use client";

import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  FileText,
  Phone,
  MessageCircle,
  Building2,
  Receipt,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PolicyContent } from "@/components/PolicyContent";
import SocialFloating from "@/components/SocialFloating";
import { COMPANY_LEGAL } from "@/data/company-legal";
import { POLICY_NAV_LINKS } from "@/data/policies";
import type { PolicyDocument } from "@/lib/policy-types";

type PolicyPageLayoutProps = {
  policy: PolicyDocument;
};

export default function PolicyPageLayout({ policy }: PolicyPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1EA] text-navy antialiased">
      <Header />

      <main className="flex-grow pb-16 pt-6 md:pt-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Breadcrumb navigation */}
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-navy/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-green transition-colors">
              Trang chủ
            </Link>
            <ChevronRight size={13} className="text-navy/40" />
            <Link href="/chinh-sach/chu-quan-tmdt" className="hover:text-brand-green transition-colors">
              Chính sách & Quy định
            </Link>
            <ChevronRight size={13} className="text-navy/40" />
            <span className="truncate max-w-[280px] sm:max-w-md font-bold text-navy">
              {policy.shortTitle}
            </span>
          </nav>

          {/* Hero Header Card */}
          <div className="mb-8 rounded-3xl border border-gray-light/70 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-brand-green">
                <ShieldCheck size={13} /> Văn bản chính sách chính thức
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF9F5] border border-gray-light/60 px-3 py-1 text-[11px] font-semibold text-navy/70">
                <Calendar size={12} className="text-navy/50" /> Hiệu lực: {COMPANY_LEGAL.policyEffectiveDate}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#FAF9F5] border border-gray-light/60 px-2.5 py-1 text-[11px] font-bold text-navy/60">
                v{COMPANY_LEGAL.policyVersion}
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-snug text-navy sm:text-3xl lg:text-4xl">
              {policy.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm sm:text-base font-normal leading-relaxed text-navy/80">
              {policy.description}
            </p>

            {/* Quick Policy Highlights Bar */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-light/60 pt-5">
              <div className="flex items-center gap-2.5 rounded-xl bg-[#FAF9F5] p-3 border border-gray-light/50">
                <Receipt size={18} className="text-brand-green shrink-0" />
                <span className="text-xs font-bold text-navy/90">Giá niêm yết đã gồm VAT 100%</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-[#FAF9F5] p-3 border border-gray-light/50">
                <Truck size={18} className="text-brand-green shrink-0" />
                <span className="text-xs font-bold text-navy/90">Minh bạch chi phí vận chuyển & lắp đặt</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-[#FAF9F5] p-3 border border-gray-light/50">
                <FileText size={18} className="text-brand-green shrink-0" />
                <span className="text-xs font-bold text-navy/90">Hóa đơn điện tử hợp pháp</span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid (Sidebar Navigation | Article Content) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
            
            {/* LEFT COLUMN: Sticky Navigation & Company Legal (lg:col-span-4) */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                
                {/* Navigation Card */}
                <div className="rounded-3xl border border-gray-light/70 bg-white p-5 sm:p-6 shadow-sm overflow-hidden">
                  <div className="mb-4 flex items-center justify-between border-b border-gray-light/60 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <Layers size={14} className="text-brand-green" />
                      Danh mục chính sách
                    </h2>
                    <span className="text-[11px] font-bold text-navy/40">
                      {POLICY_NAV_LINKS.length} quy định
                    </span>
                  </div>

                  <nav>
                    <ul className="space-y-1.5">
                      {POLICY_NAV_LINKS.map(({ href, label }) => {
                        const active = href === `/chinh-sach/${policy.slug}`;
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              scroll={false}
                              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all ${
                                active
                                  ? "bg-brand-green/10 font-bold text-brand-green border-l-4 border-brand-green shadow-2xs"
                                  : "font-semibold text-navy/75 hover:bg-[#FAF9F5] hover:text-navy"
                              }`}
                            >
                              <span className="leading-snug pr-2">{label}</span>
                              <ChevronRight
                                size={14}
                                className={`shrink-0 transition-transform ${
                                  active
                                    ? "text-brand-green translate-x-0.5"
                                    : "text-navy/30 group-hover:translate-x-0.5 group-hover:text-navy/60"
                                }`}
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>

                {/* Company Legal Trust Box */}
                <div className="rounded-3xl border border-gray-light/70 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-navy">
                    <Building2 size={15} className="text-brand-green shrink-0" />
                    <span>Đơn vị chủ quản</span>
                  </div>

                  <div className="space-y-2 text-xs text-navy/80">
                    <p className="font-extrabold text-navy leading-snug">
                      {COMPANY_LEGAL.legalName}
                    </p>
                    <p className="text-[11px] text-navy/60 leading-tight">
                      MST: <strong className="text-navy">{COMPANY_LEGAL.taxCode}</strong>
                    </p>
                    <p className="text-[11px] text-navy/70 leading-relaxed">
                      {COMPANY_LEGAL.address}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-light/60 flex items-center gap-2">
                    <a
                      href={`tel:${COMPANY_LEGAL.phoneTel}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-2xs"
                    >
                      <Phone size={13} />
                      <span>{COMPANY_LEGAL.phone}</span>
                    </a>
                    <a
                      href={COMPANY_LEGAL.zaloUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#0068FF] py-2.5 text-xs font-bold text-white hover:bg-[#0056d6] transition-colors shadow-2xs"
                    >
                      <MessageCircle size={13} />
                      <span>Zalo tư vấn</span>
                    </a>
                  </div>
                </div>

              </div>
            </aside>

            {/* RIGHT COLUMN: Formatted Policy Content (lg:col-span-8) */}
            <article className="lg:col-span-8">
              <div className="rounded-3xl border border-gray-light/70 bg-white p-6 sm:p-9 shadow-sm">
                <PolicyContent sections={policy.sections} />
              </div>
            </article>

          </div>
        </div>
      </main>

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
