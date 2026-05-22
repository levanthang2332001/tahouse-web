"use client";

import React from "react";
import { Phone } from "lucide-react";

export default function SocialFloating() {
  return (
    <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-4">
      {/* Zalo Button */}
      <a 
        href="https://zalo.me" 
        target="_blank" 
        rel="noreferrer" 
        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform duration-300 font-bold text-xs cursor-pointer" 
        title="Chat qua Zalo"
      >
        Zalo
      </a>

      {/* Hotline Call Button */}
      <a 
        href="tel:19008899" 
        className="w-12 h-12 bg-lime rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform duration-300 cursor-pointer" 
        title="Gọi hotline"
      >
        <Phone size={20} />
      </a>
    </div>
  );
}
