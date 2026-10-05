"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PolicyContent } from "@/components/PolicyContent";
import SocialFloating from "@/components/SocialFloating";
import type { SitePage } from "@/data/site-pages";

type InfoPageLayoutProps = {
  page: SitePage;
  breadcrumbLabel: string;
};

export default function InfoPageLayout({
  page,
  breadcrumbLabel,
}: InfoPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral text-navy">
      <Header />
      <section className="relative border-b border-gray-light/35 pb-5 pt-4">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-navy/55">
            <Link href="/" className="hover:text-brand-green">
              Trang chủ
            </Link>
            <ChevronRight size={12} />
            <span className="font-semibold normal-case tracking-normal text-navy">
              {breadcrumbLabel}
            </span>
          </div>

          <h1 className="mb-2 font-serif text-3xl font-bold leading-tight tracking-tight text-navy sm:text-[2.5rem]">
            {page.title}
          </h1>
          <p className="max-w-2xl text-[15px] font-normal leading-relaxed text-navy/65">
            {page.description}
          </p>
        </div>
      </section>

      <section className="grow py-6 lg:py-8">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <article className="rounded-2xl border border-gray-light bg-cream p-6 sm:p-8">
            <PolicyContent sections={page.sections} />
          </article>
        </div>
      </section>

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
