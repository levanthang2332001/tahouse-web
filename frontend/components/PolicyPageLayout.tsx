"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

/**
 * Quy tắc chữ trang chính sách:
 * - Breadcrumb / nhãn cột: IN HOA + đậm (nhãn UI)
 * - H1 tiêu đề trang: đậm, chữ thường (đúng như data, không ép hoa)
 * - Mô tả / meta: chữ thường
 * - Menu sidebar: chữ thường; mục đang mở: đậm + xanh
 * - Tên công ty pháp lý: IN HOA + đậm
 */
export default function PolicyPageLayout({ policy }: PolicyPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral text-navy">
      <Header />
      <section className="relative border-b border-gray-light/35 pb-5 pt-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-navy/55">
            <Link href="/" className="hover:text-brand-green">
              Trang chủ
            </Link>
            <ChevronRight size={12} />
            <Link href="/chinh-sach/chu-quan-tmdt" className="hover:text-brand-green">
              Chính sách
            </Link>
            <ChevronRight size={12} />
            <span className="font-semibold normal-case tracking-normal text-navy">
              {policy.shortTitle}
            </span>
          </div>

          <h1 className="mb-2 font-serif text-3xl font-bold leading-tight tracking-tight text-navy sm:text-[2.5rem]">
            {policy.title}
          </h1>

          <p className="max-w-2xl text-[15px] font-normal leading-relaxed text-navy/65">
            {policy.description}
          </p>
          <p className="mt-2 text-xs font-normal text-navy/45">
            Hiệu lực từ {COMPANY_LEGAL.policyEffectiveDate} · Phiên bản{" "}
            {COMPANY_LEGAL.policyVersion}
          </p>
        </div>
      </section>

      <section className="flex-grow py-6 lg:py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-12 lg:px-8">
          <aside className="lg:col-span-4">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-gray-light bg-cream p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-navy">
                Chính sách mua hàng
              </h2>
              <nav>
                <ul className="space-y-2.5">
                  {POLICY_NAV_LINKS.map(({ href, label }) => {
                    const active = href === `/chinh-sach/${policy.slug}`;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          scroll={false}
                          className={`block min-h-[1.25rem] text-[13px] leading-snug transition-colors hover:text-brand-green ${
                            active
                              ? "font-semibold text-brand-green"
                              : "font-normal text-navy/70"
                          }`}
                        >
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-6 border-t border-gray-light/70 pt-5 text-xs font-normal leading-relaxed text-navy/60">
                <p className="font-bold uppercase tracking-wide text-navy">
                  {COMPANY_LEGAL.legalName}
                </p>
                <p className="mt-1.5 font-normal">{COMPANY_LEGAL.englishName}</p>
                <p className="mt-0.5 font-normal">{COMPANY_LEGAL.abbreviatedName}</p>
                <p className="mt-1.5 font-normal">
                  <span className="font-semibold text-navy/75">MST:</span>{" "}
                  {COMPANY_LEGAL.taxCode}
                </p>
                <p className="mt-1 font-normal">{COMPANY_LEGAL.address}</p>
                <p className="mt-1 font-normal">
                  <span className="font-semibold text-navy/75">Hotline:</span>{" "}
                  {COMPANY_LEGAL.phone}
                </p>
              </div>
            </div>
          </aside>

          <article className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-light bg-cream p-6 sm:p-8">
              <PolicyContent sections={policy.sections} />
            </div>
          </article>
        </div>
      </section>

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
