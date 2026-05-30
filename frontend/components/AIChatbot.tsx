"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Paperclip, Send, ShieldCheck, Smartphone, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HouseIcon } from "@/components/ui/icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Message = {
  id: string;
  sender: "user" | "ai";
  text: React.ReactNode;
  time: string;
};

// ---------------------------------------------------------------------------
// Keyword-based reply engine
// ---------------------------------------------------------------------------
function getReply(input: string): React.ReactNode {
  const q = input.toLowerCase();

  if (q.includes("bếp mới")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Tư vấn thiết kế &amp; làm bếp mới 🍳</p>
        <p>TA HOUSE cung cấp giải pháp trọn gói thiết bị bếp &amp; phụ kiện tủ bếp thông minh nhập khẩu chính hãng (Bosch, Hafele, Kaff, Cata...):</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Bếp từ &amp; Hút mùi:</strong> Đồng bộ, tự động cảm biến, tiết kiệm điện năng.</li>
          <li><strong>Phụ kiện tủ bếp:</strong> Giá bát đĩa nâng hạ, giá xoong nồi xoay góc inox 304 cao cấp.</li>
          <li><strong>Bồn rửa &amp; Vòi:</strong> Kháng khuẩn, chống ồn hiệu quả.</li>
        </ul>
        <p className="text-[11px] text-navy/60 italic mt-1">Đội ngũ kỹ thuật hỗ trợ khảo sát và lên bản vẽ thiết kế lắp ráp 3D miễn phí cho gia đình bạn.</p>
      </div>
    );
  }

  if (q.includes("sửa bếp")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Dịch vụ sửa chữa &amp; nâng cấp bếp chuyên nghiệp 🛠️</p>
        <p>Chúng tôi chuyên hỗ trợ nâng cấp, sửa chữa thiết bị nhà bếp:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Thay thế mặt kính bếp từ, sửa mạch bếp từ Châu Âu.</li>
          <li>Vệ sinh, bảo dưỡng hệ thống hút mùi âm tủ định kỳ.</li>
          <li>Thay ray trượt, bản lề hơi giảm chấn cũ bằng hệ tủ inox 304 cao cấp.</li>
        </ul>
        <p>Hãy liên hệ Hotline/Zalo: <strong>0938 824 479</strong> hoặc gửi hình ảnh khu vực bếp cần cải tạo để được khảo sát tận nhà ngay hôm nay.</p>
      </div>
    );
  }

  if (q.includes("thay khóa cửa") || q.includes("thay khóa")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Tư vấn khóa điện tử &amp; khóa vân tay thông minh 🔑</p>
        <p>Để chọn được dòng khóa cửa phù hợp nhất (Kaadas, Philips, Yale, Hafele, Samsung...), xin quý khách vui lòng cung cấp thêm thông tin:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Chất liệu cửa:</strong> Cửa gỗ tự nhiên, cửa gỗ công nghiệp hay cửa nhôm kính?</li>
          <li><strong>Độ rộng đố cửa:</strong> Đố cửa tối thiểu đạt từ 9cm - 11cm trở lên để lắp khóa tiêu chuẩn.</li>
          <li><strong>Phương thức mở:</strong> Vân tay, mã số, thẻ từ, chìa cơ dự phòng hoặc quản lý từ xa qua App Wifi.</li>
        </ul>
        <p className="text-[11px] text-navy/60 italic">Bảo hành 2 năm tận nơi - Hỗ trợ kỹ thuật khẩn cấp 24/7 tại TP.HCM.</p>
      </div>
    );
  }

  if (q.includes("nhôm kính")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Khóa thông minh cho cửa nhôm kính 🪟</p>
        <p>Các dòng khóa vân tay chuyên dụng cho cửa nhôm Xingfa, cửa nhôm cỏ, cửa lùa trượt có đố cửa nhỏ (chỉ từ 5cm - 8cm):</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Thiết kế ruột khóa siêu mỏng:</strong> Chống nước tuyệt đối IP65 khi lắp đặt ngoài hiên.</li>
          <li><strong>Công nghệ vân tay FPC:</strong> Nhận diện vân tay siêu nhạy trong 0.5s kể cả tay ẩm ướt.</li>
          <li>Đầy đủ chức năng mở bằng vân tay, thẻ từ, mã số, chìa khóa cơ và kết nối qua điện thoại.</li>
        </ul>
      </div>
    );
  }

  if (q.includes("khóa cổng")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Khóa cổng vân tay ngoài trời cao cấp 🚪</p>
        <p>Giải pháp khóa thông minh bảo vệ cổng sắt, cổng gỗ ngoài trời chịu mưa nắng khắc nghiệt:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Chống nước IP68:</strong> Thiết kế vỏ hợp kim nguyên khối siêu bền bỉ, tích hợp hộp che mưa chuyên dụng.</li>
          <li><strong>Bảo mật 2 chiều:</strong> Yêu cầu vân tay/thẻ từ cả chiều đi vào và đi ra, ngăn chặn kẻ gian luồn tay qua khe cổng.</li>
          <li>Hệ thống cảnh báo phá khóa và cạy cửa thông minh.</li>
        </ul>
      </div>
    );
  }

  if (q.includes("két sắt")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Két sắt vân tay thông minh cao cấp 💼</p>
        <p>TA HOUSE cung cấp các dòng két sắt thông minh chính hãng Philips, Kaadas bảo mật tối tân:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Mở khóa bằng nhận diện tĩnh mạch ngón tay hoặc vân tay 3D đa điểm chống giả mạo.</li>
          <li>Hệ thống chốt khóa đúc đặc đa chiều chống khoan cắt.</li>
          <li>Gửi thông báo báo động trực tiếp về điện thoại khi có người cố tình dò mật mã.</li>
        </ul>
      </div>
    );
  }

  if (q.includes("gửi hình") || q.includes("ảnh") || q.includes("hình ảnh")) {
    return (
      <div className="space-y-2">
        <p className="font-bold text-brand-green">Gửi hình ảnh chụp thực tế để được tư vấn chính xác nhất 📸</p>
        <p>Quý khách vui lòng gửi ảnh chụp tổng thể mặt trước, mặt sau và đố cửa (đối với khóa) hoặc khoang tủ bếp cũ cần cải tạo.</p>
        <p className="bg-brand-green/10 p-2.5 rounded-lg border border-brand-green/20">
          👉 Quý khách có thể gửi trực tiếp qua Zalo Hotline:{" "}
          <a href="tel:0938824479" className="font-bold underline text-brand-green">0938 824 479</a>{" "}
          (Click để gọi) hoặc chọn file hình ảnh từ nút đính kèm bên dưới.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p>Cảm ơn anh/chị đã quan tâm đến dịch vụ của TA HOUSE! Chuyên viên hỗ trợ sẽ liên hệ tư vấn chi tiết cho anh/chị ngay.</p>
      <p>Quý khách cũng có thể để lại số điện thoại hoặc gọi trực tiếp Hotline Zalo: <strong>0938 824 479</strong> để giải đáp thắc mắc nhanh nhất.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Welcome message content
// ---------------------------------------------------------------------------
const WELCOME_MESSAGE: Message = {
  id: "welcome",
  sender: "ai",
  text: (
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
  ),
  time: "10:30",
};

// ---------------------------------------------------------------------------
// Bot avatar (shared between message list and typing indicator)
// ---------------------------------------------------------------------------
function BotAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden border border-brand-green/15 shadow-sm">
      <img src="/logoTAicon.svg" alt="TA House Icon" className="h-full w-full object-contain" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AIChatbot() {
  const { isChatbotOpen, setIsChatbotOpen } = useApp();
  const nextIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string, label?: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId("user"), sender: "user", text: label ?? text, time: getTime() },
    ]);
    setInputValue("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId("ai"),
          sender: "ai",
          text: (
            <div className="font-sans text-[13px] leading-relaxed text-navy text-left">
              {getReply(text)}
            </div>
          ),
          time: getTime(),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      sendMessage("gửi hình để tư vấn", `📷 Đính kèm ảnh: ${e.target.files[0].name}`);
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-brand-green text-white shadow-[0_10px_30px_rgba(121,193,67,0.4)] transition-all hover:bg-lime-dark hover:scale-105"
            aria-label="Mở khung tư vấn trực tuyến"
          >
            <MessageCircle className="h-8 w-8 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 flex h-[640px] w-[94vw] max-w-[400px] flex-col overflow-hidden rounded-[28px] bg-cream shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-[72px] items-center justify-between bg-[#092f3a] px-5 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs">
                  <img src="/logoTAicon.svg" alt="TA House Icon" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-sans text-[15px] font-black uppercase tracking-wider text-white">
                    TA HOUSE
                  </h3>
                  <span className="text-[11px] font-medium text-brand-green">
                    Trợ lý tư vấn giải pháp
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-cream/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Đang online
                </span>
                <button
                  onClick={() => setIsChatbotOpen(false)}
                  className="cursor-pointer rounded-lg p-1 text-cream/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Đóng chat"
                >
                  <X className="h-5 w-5 stroke-[2.2]" />
                </button>
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

            {/* Message list */}
            <div className="flex-1 overflow-y-auto bg-warm-cream/50 px-4 py-5 space-y-6 invisible-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  {msg.sender === "ai" ? (
                    <div className="flex gap-2.5 items-start">
                      <BotAvatar />
                      <div className="max-w-[78%] rounded-2xl rounded-tl-sm border border-gray-light bg-white p-4 shadow-xs">
                        {msg.text}
                        <span className="block mt-2 text-right text-[9px] font-semibold text-navy/40">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-green p-4 font-sans text-[13px] font-semibold leading-relaxed text-white shadow-sm">
                        <p className="text-left">{msg.text}</p>
                        <span className="block mt-2 text-right text-[9px] font-semibold text-white/70">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5 items-start">
                  <BotAvatar />
                  <div className="rounded-2xl rounded-tl-sm border border-gray-light bg-white px-4 py-3 shadow-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40 [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40 [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input bar */}
            <div className="bg-white px-4 pb-2 pt-1">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-full border border-gray-light bg-cream/45 px-4.5 py-1.5 focus-within:border-brand-green/60"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="flex-1 border-none bg-transparent py-1.5 text-[12px] font-semibold text-navy placeholder-navy/35 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer p-1 text-navy/40 hover:text-brand-green transition-colors"
                  aria-label="Đính kèm ảnh"
                >
                  <Paperclip className="h-4.5 w-4.5 rotate-45 stroke-[2.2]" />
                </button>
                <button
                  type="submit"
                  className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm transition-all hover:scale-105 hover:bg-lime-dark"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                </button>
              </form>
            </div>

            {/* Guarantee banner */}
            <div className="flex h-11 shrink-0 items-center justify-around bg-[#F5F1EA]/70 px-2 text-[10px] font-bold text-navy/80">
              <div className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-brand-green" />
                <span>Tư vấn miễn phí</span>
              </div>
              <div className="flex items-center gap-1">
                <HouseIcon className="h-3.5 w-3.5 text-brand-green" />
                <span>Khảo sát tận nơi</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                <span>Bảo hành chính hãng</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
