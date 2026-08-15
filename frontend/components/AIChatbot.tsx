"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Paperclip, Send, ShieldCheck, Smartphone, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HouseIcon } from "@/components/ui/icons";
import { streamChat } from "@/lib/api/chat";
import type { ChatMessage as ApiChatMessage } from "@/lib/types/chat";
import { COMPANY_LEGAL } from "@/data/company-legal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
  time: string;
  streaming?: boolean;
};

const FALLBACK_REPLY = `Xin lỗi, hệ thống tư vấn đang bận. Quý khách vui lòng gọi Hotline / Zalo: ${COMPANY_LEGAL.phonesDisplay} để được hỗ trợ nhanh nhất.`;

// ---------------------------------------------------------------------------
// Markdown-lite renderer for streamed AI replies
// ---------------------------------------------------------------------------
function formatBold(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${index}`} className="font-bold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${index}`}>{part}</React.Fragment>;
  });
}

function formatInline(text: string, keyPrefix = "inline"): React.ReactNode[] {
  // Images first: ![alt](url)
  const withImages = text.split(/(!\[[^\]]*\]\([^)]+\))/g);

  return withImages.flatMap((chunk, chunkIndex) => {
    const imageMatch = chunk.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      return (
        <a
          key={`${keyPrefix}-img-${chunkIndex}`}
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="my-2 block overflow-hidden rounded-xl border border-gray-light bg-cream"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || "Hình sản phẩm"}
            className="mx-auto max-h-52 w-full object-contain p-2"
            loading="lazy"
          />
        </a>
      );
    }

    // Links: [label](url) — skip already-consumed image syntax
    const withLinks = chunk.split(/(\[[^\]]+\]\([^)]+\))/g);
    return withLinks.flatMap((segment, segmentIndex) => {
      const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <a
            key={`${keyPrefix}-a-${chunkIndex}-${segmentIndex}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-semibold text-brand-green underline underline-offset-2 hover:text-lime-dark"
          >
            {label}
          </a>
        );
      }
      return formatBold(segment, `${keyPrefix}-${chunkIndex}-${segmentIndex}`);
    });
  });
}

function ChatMessageContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-2 break-words font-sans text-[13px] leading-relaxed text-navy text-left [overflow-wrap:anywhere]">
      {blocks.map((block, blockIndex) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Standalone markdown image block
        const soloImage = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (soloImage) {
          return (
            <div key={blockIndex} className="min-w-0">
              {formatInline(trimmed, `block-${blockIndex}`)}
            </div>
          );
        }

        const lines = block.split("\n");
        const isList = lines.every(
          (line) => /^\s*[-*]\s/.test(line) || line.trim() === "",
        );

        if (isList && lines.some((line) => /^\s*[-*]\s/.test(line))) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-4">
              {lines
                .filter((line) => /^\s*[-*]\s/.test(line))
                .map((line, lineIndex) => (
                  <li key={lineIndex}>
                    {formatInline(
                      line.replace(/^\s*[-*]\s+/, ""),
                      `list-${blockIndex}-${lineIndex}`,
                    )}
                  </li>
                ))}
            </ul>
          );
        }

        return (
          <div key={blockIndex} className="whitespace-pre-wrap">
            {formatInline(block, `p-${blockIndex}`)}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Welcome message content
// ---------------------------------------------------------------------------
const WELCOME_MESSAGE: Message = {
  id: "welcome",
  sender: "ai",
  content: "",
  time: "10:30",
};

function WelcomeContent() {
  return (
    <div className="space-y-2 text-left font-sans text-[13px] leading-relaxed text-navy">
      <p className="text-[14px]">Chào anh/chị 👋</p>
      <p className="font-bold">TA HOUSE có thể hỗ trợ:</p>
      <div className="space-y-1 pl-1">
        {[
          "Chọn thiết bị bếp phù hợp",
          "Tư vấn khóa điện tử theo loại cửa",
          "Báo giá và chính sách bảo hành",
          "Gợi ý giải pháp theo ngân sách",
        ].map((item) => (
          <p key={item} className="flex items-center gap-1.5 font-semibold text-navy/90">
            <span className="text-brand-green font-bold">✓</span> {item}
          </p>
        ))}
      </div>
      <p className="pt-1 mt-1 font-semibold border-t border-gray-light/30">
        Anh/chị đang cần hỗ trợ nội dung nào ạ?
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bot avatar (shared between message list and typing indicator)
// ---------------------------------------------------------------------------
function BotAvatar() {
  return (
    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full overflow-hidden border border-brand-green/15 shadow-sm">
      <img src="/logoTAicon.svg" alt="TA House Icon" className="h-full w-full object-contain" />
    </div>
  );
}

function toApiHistory(messages: Message[]): ApiChatMessage[] {
  return messages
    .filter((msg) => msg.id !== "welcome" && !msg.streaming && msg.content.trim())
    .map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AIChatbot() {
  const { isChatbotOpen, setIsChatbotOpen } = useApp();
  const nextIdRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const getTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const nextId = (sender: Message["sender"]) => `${++nextIdRef.current}-${sender}`;

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string, label?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: nextId("user"),
      sender: "user",
      content: label ?? trimmed,
      time: getTime(),
    };

    const aiMessageId = nextId("ai");
    const aiMessage: Message = {
      id: aiMessageId,
      sender: "ai",
      content: "",
      time: getTime(),
      streaming: true,
    };

    const history = toApiHistory(messages);

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const reply = await streamChat(trimmed, history, (content) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content, time: getTime() } : msg,
          ),
        );
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: reply.trim() || FALLBACK_REPLY,
                streaming: false,
                time: getTime(),
              }
            : msg,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: FALLBACK_REPLY,
                streaming: false,
                time: getTime(),
              }
            : msg,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      sendMessage(
        "Tôi muốn gửi hình ảnh để được tư vấn. Hãy hướng dẫn tôi cách gửi ảnh phù hợp.",
        `📷 Đính kèm ảnh: ${e.target.files[0].name}`,
      );
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isChatbotOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="flex h-14 w-14 sm:h-16 sm:w-16 cursor-pointer items-center justify-center rounded-full bg-brand-green text-white shadow-[0_10px_30px_rgba(121,193,67,0.4)] transition-all hover:bg-lime-dark hover:scale-105 active:scale-95"
            aria-label="Mở khung tư vấn trực tuyến"
          >
            <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* Backdrop overlay on mobile */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsChatbotOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Chat window - Responsive: Bottom sheet on mobile (<640px), Floating card on desktop (>=640px) */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[86dvh] max-h-[86dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[620px] sm:max-h-[640px] sm:w-[400px] sm:max-w-[400px] sm:rounded-[28px]"
          >
            {/* Header with mobile drag indicator */}
            <div className="flex flex-col shrink-0 bg-[#092f3a] text-white shadow-md">
              {/* Mobile grab handle */}
              <div className="flex justify-center pt-2 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-white/30" />
              </div>

              <div className="flex h-15 sm:h-16 items-center justify-between px-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs">
                    <img src="/logoTAicon.svg" alt="TA House Icon" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-sans text-[14px] sm:text-[15px] font-black uppercase tracking-wider text-white leading-tight">
                      TA HOUSE
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-medium text-brand-green">
                      Trợ lý tư vấn giải pháp
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-cream/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Online
                  </span>
                  <button
                    onClick={() => setIsChatbotOpen(false)}
                    className="cursor-pointer rounded-lg p-1.5 text-cream/80 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Đóng chat"
                  >
                    <X className="h-5 w-5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Message list - dynamically scrolls without breaking layout */}
            <div
              ref={messagesContainerRef}
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-warm-cream/50 px-3.5 sm:px-4 py-4 sm:py-5 space-y-5 invisible-scrollbar"
            >
              {messages.map((msg) => {
                if (msg.sender === "ai" && msg.streaming && !msg.content) {
                  return null;
                }

                return (
                <div key={msg.id} className="space-y-1">
                  {msg.sender === "ai" ? (
                    <div className="flex w-full min-w-0 gap-2 sm:gap-2.5 items-start">
                      <BotAvatar />
                      <div className="min-w-0 max-w-[min(82%,calc(100%-2.5rem))] overflow-hidden rounded-2xl rounded-tl-sm border border-gray-light bg-white p-3.5 sm:p-4 shadow-xs">
                        {msg.id === "welcome" ? (
                          <WelcomeContent />
                        ) : (
                          <ChatMessageContent content={msg.content} />
                        )}
                        <span className="block mt-2 text-right text-[9px] font-semibold text-navy/40">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="min-w-0 max-w-[82%] overflow-hidden break-words rounded-2xl rounded-tr-sm bg-brand-green p-3.5 sm:p-4 font-sans text-[13px] font-semibold leading-relaxed text-white shadow-sm [overflow-wrap:anywhere]">
                        <p className="text-left whitespace-pre-wrap">{msg.content}</p>
                        <span className="block mt-2 text-right text-[9px] font-semibold text-white/70">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && !messages.some((msg) => msg.streaming && msg.content) && (
                <div className="flex gap-2.5 items-start">
                  <BotAvatar />
                  <div className="rounded-2xl rounded-tl-sm border border-gray-light bg-white px-4 py-3 shadow-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40 [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40 [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="shrink-0 bg-white px-3.5 sm:px-4 pb-2 pt-1.5 border-t border-gray-light/40">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-full border border-gray-light bg-cream/45 px-3.5 sm:px-4.5 py-1.5 focus-within:border-brand-green/60"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={isTyping}
                  className="flex-1 min-w-0 border-none bg-transparent py-1 text-[13px] font-semibold text-navy placeholder-navy/35 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  className="cursor-pointer p-1 text-navy/40 hover:text-brand-green transition-colors disabled:opacity-50"
                  aria-label="Đính kèm ảnh"
                >
                  <Paperclip className="h-4.5 w-4.5 rotate-45 stroke-[2.2]" />
                </button>
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm transition-all hover:scale-105 hover:bg-lime-dark disabled:opacity-50 disabled:hover:scale-100"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                </button>
              </form>
            </div>

            {/* Guarantee banner with safe-area padding for mobile */}
            <div className="flex h-10 sm:h-11 shrink-0 items-center justify-around bg-[#F5F1EA]/80 px-2 pb-[env(safe-area-inset-bottom,0px)] text-[9px] sm:text-[10px] font-bold text-navy/80 border-t border-gray-light/30">
              <div className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-brand-green shrink-0" />
                <span>Tư vấn miễn phí</span>
              </div>
              <div className="flex items-center gap-1">
                <HouseIcon className="h-3.5 w-3.5 text-brand-green shrink-0" />
                <span>Khảo sát tận nơi</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-green shrink-0" />
                <span>Bảo hành chính hãng</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
