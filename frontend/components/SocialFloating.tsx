"use client";

import React from "react";
import { Phone } from "lucide-react";
import { COMPANY_LEGAL } from "@/data/company-legal";

export default function SocialFloating() {
  return (
    <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-4">
      <a
        href={COMPANY_LEGAL.zaloUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xl transition-transform duration-300 hover:scale-110"
        title={`Chat Zalo ${COMPANY_LEGAL.phone}`}
      >
        Zalo
      </a>
      <a
        href={`tel:${COMPANY_LEGAL.phoneTel}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-white shadow-xl transition-transform duration-300 hover:scale-110"
        title={`Gọi hotline ${COMPANY_LEGAL.phone}`}
      >
        <Phone size={20} />
      </a>
    </div>
  );
}
