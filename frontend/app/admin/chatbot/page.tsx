"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  RefreshCw,
  User,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { FormattedText } from "@/components/ui/FormattedText";
import { streamChat } from "@/lib/api/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào Quản trị viên! Tôi là trợ lý AI tích hợp RAG của TA HOUSE. Bạn có thể đặt câu hỏi để kiểm tra khả năng tư vấn sản phẩm, báo giá, khuyến mãi và đường dẫn Zalo chuyên viên.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const finalReply = await streamChat(text, history, (partial) => {
        setStreamingContent(partial);
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: finalReply,
        },
      ]);
      setStreamingContent("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi trò chuyện với AI");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Không thể kết nối đến mô hình ngôn ngữ hoặc máy chủ RAG backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Lịch sử kiểm thử đã được xóa. Bạn có thể gửi câu hỏi mới để tiếp tục kiểm tra RAG Chatbot.",
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
              Trợ lý AI & RAG Chatbot
            </h1>
            <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 font-bold">
              Streaming RAG
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-navy/60 mt-1">
            Kiểm thử phản hồi trực tiếp từ mô hình AI kết hợp cơ sở tri thức sản phẩm TA HOUSE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="text-xs font-semibold gap-1.5 h-8 text-navy/70"
          >
            <Trash2 size={13} />
            <span>Xóa đoạn chat</span>
          </Button>
        </div>
      </div>

      {/* Chat Messages Card Container */}
      <div className="flex-1 rounded-3xl bg-white border border-gray-light/80 shadow-xs flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isBot = m.role === "assistant";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isBot ? "self-start" : "self-end flex-row-reverse ml-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black shadow-xs ${
                    isBot
                      ? "bg-navy text-brand-green"
                      : "bg-brand-green text-navy"
                  }`}
                >
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    isBot
                      ? "bg-[#FAF9F5] text-navy border border-gray-light/70"
                      : "bg-navy text-white font-medium"
                  }`}
                >
                  <FormattedText content={m.content} />
                </div>
              </div>
            );
          })}

          {/* Streaming Bubble */}
          {loading && streamingContent && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="h-8 w-8 rounded-xl bg-navy text-brand-green flex items-center justify-center shrink-0 text-xs font-black shadow-xs">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs bg-[#FAF9F5] text-navy border border-gray-light/70">
                <FormattedText content={streamingContent} />
                <span className="inline-block w-1.5 h-3 ml-1 bg-brand-green animate-pulse" />
              </div>
            </div>
          )}

          {loading && !streamingContent && (
            <div className="flex items-center gap-2 text-xs text-navy/50 italic py-2">
              <RefreshCw size={13} className="animate-spin text-brand-green" />
              <span>AI đang tra cứu cơ sở tri thức sản phẩm...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-[#FAF9F5] border-t border-gray-light/80 flex items-center gap-2 shrink-0"
        >
          <Input
            type="text"
            placeholder="Nhập câu hỏi thử nghiệm (VD: Khóa nào có nhận diện Face ID giá dưới 20 triệu?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 text-xs h-10 bg-white"
          />

          <Button
            type="submit"
            variant="brand"
            disabled={loading || !input.trim()}
            className="h-10 px-4 text-xs font-bold gap-1.5"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Gửi thử</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
