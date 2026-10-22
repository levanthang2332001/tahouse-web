"use client";

import React from "react";
import { Phone } from "lucide-react";
import { SiZalo } from "react-icons/si";
import { useStoreInfo } from "@/context/StoreInfoContext";

export default function SocialFloating({ className = "flex" }: { className?: string }) {
  const store = useStoreInfo();
  return (
    <div className={`fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-30 flex-col gap-3 ${className}`}>
      <a
        href={store.zaloUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
        title={`Chat Zalo ${store.phone}`}
      >
        <SiZalo className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
      </a>
      <a
        href={`tel:${store.phoneTel}`}
        className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-brand-green text-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
        title={`Gọi hotline ${store.phone}`}
      >
        <Phone size={18} className="sm:h-5 sm:w-5" />
      </a>
    </div>
  );
}

