"use client";

import React from "react";
import { MessageSquare, PhoneCall, Send, HelpCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SocialFloating() {
  const { setIsChatbotOpen } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3.5 items-end">
      
      {/* AI Chatbot Launcher Floating Text */}
      <div className="group relative flex items-center gap-2">
        <span className="hidden sm:inline-block px-3 py-1.5 bg-[var(--dark-bg)] border border-gold/20 text-gold text-xs font-semibold rounded-lg shadow-xl translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md">
          Chat với Trợ lý AI
        </span>
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="relative w-12 h-12 rounded-full gold-gradient-bg text-[#050505] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 hover:rotate-6 transition-all duration-300 group cursor-pointer"
          title="Trợ lý ảo AI"
        >
          <HelpCircle className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#050505] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#050505]" />
        </button>
      </div>

      {/* Hotline Call Button */}
      <div className="group relative flex items-center gap-2">
        <span className="hidden sm:inline-block px-3 py-1.5 bg-[var(--dark-bg)] border border-gold/20 text-zinc-300 text-xs font-semibold rounded-lg shadow-xl translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md">
          Hotline: 1900 8888
        </span>
        <a
          href="tel:19008888"
          className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Gọi Hotline tư vấn"
        >
          <PhoneCall className="w-5 h-5 group-hover:animate-bounce" />
        </a>
      </div>

      {/* Zalo Contact */}
      <div className="group relative flex items-center gap-2">
        <span className="hidden sm:inline-block px-3 py-1.5 bg-[var(--dark-bg)] border border-gold/20 text-zinc-300 text-xs font-semibold rounded-lg shadow-xl translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md">
          Chat Zalo
        </span>
        <a
          href="https://zalo.me/0988888888"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 font-black text-sm"
          title="Chat Zalo hỗ trợ"
        >
          Zalo
        </a>
      </div>

      {/* Messenger Contact */}
      <div className="group relative flex items-center gap-2">
        <span className="hidden sm:inline-block px-3 py-1.5 bg-[var(--dark-bg)] border border-gold/20 text-zinc-300 text-xs font-semibold rounded-lg shadow-xl translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md">
          Facebook Messenger
        </span>
        <a
          href="https://m.me/kassler"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Chat Facebook Messenger"
        >
          <MessageSquare className="w-5 h-5" />
        </a>
      </div>

      {/* Telegram Contact */}
      <div className="group relative flex items-center gap-2">
        <span className="hidden sm:inline-block px-3 py-1.5 bg-[var(--dark-bg)] border border-gold/20 text-zinc-300 text-xs font-semibold rounded-lg shadow-xl translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md">
          Telegram Channel
        </span>
        <a
          href="https://t.me/kassler_lock"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-sky-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Kênh Telegram"
        >
          <Send className="w-5 h-5" />
        </a>
      </div>

    </div>
  );
}
