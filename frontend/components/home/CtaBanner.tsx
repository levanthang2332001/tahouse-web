"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="w-full bg-navy py-14 text-cream border-t border-cream/10 select-none">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 px-6 md:flex-row lg:px-12">
        <div className="text-left space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-cream">
            Đang làm nhà <span className="text-brand-green">•</span> sửa bếp{" "}
            <span className="text-brand-green">•</span> thay khóa điện tử?
          </h2>
          <p className="text-sm md:text-base font-normal text-cream/80 mt-3">
            Liên hệ TA HOUSE để được tư vấn giải pháp phù hợp nhất với nhu cầu của gia đình.
          </p>
        </div>
        <Link
          href="#contact"
          className="group flex shrink-0 items-center gap-2.5 rounded-full bg-brand-green px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-lime-dark shadow-md shadow-brand-green/20"
        >
          Liên hệ tư vấn
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
