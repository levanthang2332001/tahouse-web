"use client";

import React from "react";
import { Phone } from "lucide-react";

export default function SocialFloating() {
  return (
    <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-4">
      <a
        href="https://zalo.me"
        target="_blank"
        rel="noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xl transition-transform duration-300 hover:scale-110"
        title="Chat qua Zalo"
      >
        Zalo
      </a>
      <a
        href="tel:19008899"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-white shadow-xl transition-transform duration-300 hover:scale-110"
        title="Gọi hotline"
      >
        <Phone size={20} />
      </a>
    </div>
  );
}
