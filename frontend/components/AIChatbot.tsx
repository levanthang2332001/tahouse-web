"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

const quickReplies = [
  "Tư vấn khóa vân tay",
  "Bếp từ Bosch",
  "Chính sách bảo hành",
];

function getReply(input: string) {
  const query = input.toLowerCase();

  if (query.includes("khóa")) {
    return "TA HOUSE hiện có nhiều dòng khóa thông minh cho cửa gỗ, cửa nhôm và biệt thự. Nếu bạn cần, tôi có thể tư vấn theo loại cửa và mức đầu tư.";
  }

  if (query.includes("bếp")) {
    return "Nhóm giải pháp bếp tập trung vào bếp từ, lò nướng và phụ kiện đồng bộ. Bạn có thể mô tả diện tích bếp hoặc nhu cầu sử dụng để tôi gợi ý phù hợp hơn.";
  }

  if (query.includes("bảo hành")) {
    return "Các sản phẩm được định vị ở phân khúc chính hãng, có hỗ trợ tư vấn, lắp đặt và bảo hành theo từng nhóm sản phẩm. Khi cần báo giá chi tiết, bạn nên để lại loại sản phẩm quan tâm.";
  }

  return "Tôi có thể hỗ trợ giới thiệu khóa thông minh, giải pháp bếp và thông tin bảo hành. Hãy nhập nhu cầu cụ thể hơn để tôi gợi ý đúng nhóm sản phẩm.";
}

export default function AIChatbot() {
  const { isChatbotOpen, setIsChatbotOpen } = useApp();
  const nextIdRef = useRef(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào, tôi là trợ lý TA HOUSE. Tôi có thể hỗ trợ tư vấn nhanh về khóa thông minh, thiết bị bếp và thông tin bảo hành.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createId = (sender: Message["sender"]) => {
    nextIdRef.current += 1;
    return `${nextIdRef.current}-${sender}`;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) {
      return;
    }

    const userMessage: Message = {
      id: createId("user"),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: createId("ai"),
          sender: "ai",
          text: getReply(text),
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  if (!isChatbotOpen) {
    return (
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-brand-green px-5 py-3 text-sm font-medium text-white shadow-xl transition-colors hover:bg-lime-dark"
      >
        <Sparkles className="h-4 w-4" />
        Tư vấn nhanh
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[92vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-brand-green/20 bg-cream/95 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-brand-green/10 bg-gradient-to-r from-neutral to-cream px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-green/20 bg-brand-green/10 text-brand-green">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-navy">
              TA HOUSE AI
            </h3>
            <span className="text-[10px] font-bold text-emerald-500">
              Hỗ trợ trực tuyến
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsChatbotOpen(false)}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-navy/5 hover:text-navy"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                message.sender === "user"
                  ? "rounded-tr-none bg-brand-green font-bold text-white"
                  : "rounded-tl-none border border-gray-light bg-neutral text-navy"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-none border border-gray-light bg-neutral px-4 py-3">
              <span className="text-xs text-zinc-500">Đang soạn...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-gray-light bg-cream px-5 py-2">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            className="shrink-0 rounded-full border border-gray-light bg-white px-3 py-1.5 text-[10px] font-bold text-zinc-500 transition-all hover:border-brand-green hover:text-brand-green"
          >
            {reply}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(inputValue);
        }}
        className="flex gap-2 border-t border-gray-light bg-neutral p-4"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
          className="flex-1 rounded-xl border border-gray-light bg-white px-4 py-2.5 text-xs text-navy placeholder-zinc-400 focus:border-brand-green focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-brand-green p-3 text-white transition-all hover:scale-105"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
