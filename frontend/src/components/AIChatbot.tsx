"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Send, Sparkles, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, Product } from "@/data/products";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  suggestedProducts?: Product[];
}

function generateId(): string {
  return Math.random().toString();
}

// Offline fallback answer generator in case of API failure
const generateLocalResponse = (query: string, chatbotProductContext: Product | null): { text: string; products?: Product[] } => {
  const q = query.toLowerCase();
  
  if (q.includes("so sánh") || q.includes("khác gì") || q.includes("vs")) {
    const matchingProds = PRODUCTS.filter(p => q.includes(p.code.toLowerCase().split(" ")[0]) || q.includes(p.id.toLowerCase().split("-")[1]));
    if (matchingProds.length >= 2) {
      const [p1, p2] = matchingProds;
      return {
        text: `Dưới đây là so sánh nhanh giữa **${p1.name} (${p1.code})** và **${p2.name} (${p2.code})**:\n\n1. **Chất liệu**: \n   - *${p1.code}*: ${p1.specifications.material}\n   - *${p2.code}*: ${p2.specifications.material}\n\n2. **Công nghệ chính**:\n   - *${p1.code}*: ${p1.technologies.join(", ")}\n   - *${p2.code}*: ${p2.technologies.join(", ")}\n\n3. **Thời gian bảo hành**:\n   - *${p1.code}*: ${p1.warrantyText}\n   - *${p2.code}*: ${p2.warrantyText}\n\n4. **Phân khúc giá**:\n   - *${p1.code}*: ${p1.priceRange}\n   - *${p2.code}*: ${p2.priceRange}\n\nCả hai đều là những thiết bị vô cùng cao cấp từ **TA HOUSE**. Quý khách muốn chọn giải pháp nào phù hợp hơn cho ngôi nhà mình?`,
        products: [p1, p2]
      };
    }
    return {
      text: "TA HOUSE cung cấp rất nhiều giải pháp thiết bị cao cấp. Để so sánh, bạn có thể nhập tên mã sản phẩm (Ví dụ: 'So sánh TA-9800 với TA-8500') hoặc xem trực tiếp tính năng so sánh ở trang sản phẩm nhé!",
      products: PRODUCTS.slice(0, 2)
    };
  }

  if (q.includes("khóa") || q.includes("khoa") || q.includes("cửa") || q.includes("cua")) {
    const prods = PRODUCTS.filter(p => p.category === "Lock");
    return {
      text: "Đối với **Khóa thông minh**, TA HOUSE hiện phân phối 2 dòng khóa thượng hạng:\n- **TA-9800 PREMIUM** (FaceID 3D, camera chuông hình, App Wifi): Giá **18.500.000 VNĐ**.\n- **TA-8500 SLIM** (Vân tay Push-Pull, thiết kế dáng Slim tinh tế): Giá **9.200.000 VNĐ**.\n\nCả hai mẫu đều được hỗ trợ khảo sát và lắp đặt tại công trình miễn phí 100%. Bạn đang cần lắp cho cửa gỗ hay cửa nhôm kính?",
      products: prods
    };
  }

  if (q.includes("bếp") || q.includes("bep") || q.includes("nấu") || q.includes("nau")) {
    const prods = PRODUCTS.filter(p => p.category === "Kitchen");
    return {
      text: "Cho gian **Bếp thông minh**, TA HOUSE có những lựa chọn cao cấp hàng đầu nhập khẩu:\n- **Bếp Từ Đa Điểm Bosch PXX975DC1E**: Bosch Đức chính hãng, điều khiển đa điểm FlexInduction, giá **32.500.000 VNĐ**.\n- **Lò Nướng Đối Lưu Malloca MOV-72ED**: Dung tích 72L nướng đối lưu 3D, làm sạch Hydroclean, giá **16.900.000 VNĐ**.\n- **Chậu Rửa Bát Đá Granite Konox**: Nhập khẩu Ý, bột đá tự nhiên thạch anh kháng khuẩn, giá **11.950.000 VNĐ**.\n\nBạn muốn tìm hiểu thiết kế lắp âm tủ cho sản phẩm nào?",
      products: prods
    };
  }

  if (q.includes("lọc nước") || q.includes("loc nuoc") || q.includes("smith")) {
    const prods = PRODUCTS.filter(p => p.category === "Water");
    return {
      text: "**Máy Lọc Nước R.O A.O. Smith RO-M2** là lựa chọn tuyệt vời cho tủ bếp:\n- Thiết kế không bình chứa siêu gọn nhẹ lắp âm tủ gầm bếp.\n- Màng lọc RO-Side Stream độc quyền Mỹ nâng cao tỷ lệ nước thu hồi, vòi nước thông minh hiển thị chỉ số tinh khiết TDS và cảnh báo tuổi thọ lõi lọc trực tiếp.\n- Giá tham khảo: **14.200.000 VNĐ** (Bảo hành 12 tháng chính hãng).",
      products: prods
    };
  }

  if (q.includes("giá") || q.includes("bao nhiêu tiền") || q.includes("gia")) {
    if (chatbotProductContext) {
      return {
        text: `Dòng sản phẩm **${chatbotProductContext.name}** mà quý khách đang tham khảo có giá là **${chatbotProductContext.priceRange}** (Đã bao gồm chi phí lắp đặt tận nơi bởi đội ngũ kỹ sư TA HOUSE và chế độ bảo hành vàng chính hãng).\n\nNếu quý khách đặt trọn gói hệ thống nội thất/bếp, TA HOUSE luôn có chính sách chiết khấu cực ưu đãi. Hãy để lại thông tin ở biểu mẫu Liên hệ hoặc gọi điện hotline 1900 8899 nhé!`
      };
    }
    return {
      text: "Các thiết bị nhập khẩu chính hãng tại TA HOUSE có giá dao động từ **5.400.000 VNĐ** (Phụ kiện tủ bếp Hafele) đến **32.500.000 VNĐ** (Bếp từ Bosch nhập Đức). Mức giá này đã trọn gói khảo sát lắp đặt tận nhà. Bạn muốn nhận báo giá chi tiết sản phẩm cụ thể nào?"
    };
  }

  if (q.includes("bảo hành") || q.includes("chính sách")) {
    return {
      text: "Chính sách bảo hành tại **TA HOUSE** vô cùng uy tín:\n- Bảo hành **36 tháng** đối với Khóa FaceID TA-9800 và Lò nướng Malloca.\n- Bảo hành **60 tháng (5 năm)** đối với Chậu rửa bát đá Granite Konox Ý.\n- Bảo hành **24 tháng** đối với Bếp Bosch, Khóa vân tay TA-8500, Giá kho Hafele và Smart Hub TA-Core.\n- Bảo hành điện tử kích hoạt trực tuyến tức thì ngay khi hoàn thiện bàn giao."
    };
  }

  // Default matching code lookup
  const matched = PRODUCTS.find(p => q.includes(p.code.toLowerCase().split(" ")[0]) || q.includes(p.id.toLowerCase()));
  if (matched) {
    return {
      text: `Tôi thấy bạn đang hỏi về dòng **${matched.name} (${matched.code})**.\n\nĐây là thông số chính:\n- **Kích thước**: ${matched.specifications.dimensions}\n- **Chất liệu**: ${matched.specifications.material}\n- **Nổi bật**: ${matched.features[0]}.\n\nBạn cần tư vấn chi tiết hơn về cách lắp đặt hay chính sách bảo hành của mẫu này?`,
      products: [matched]
    };
  }

  return {
    text: "Cảm ơn câu hỏi của bạn. Để nhận được tư vấn cụ thể nhất, quý khách có thể gửi câu hỏi liên quan đến sản phẩm, chính sách bảo hành, hoặc chọn một trong các phím chức năng gợi ý phía dưới. Bạn cũng có thể đăng ký khảo sát tận nhà miễn phí ở trang Liên hệ nhé!",
    products: PRODUCTS.slice(0, 3)
  };
};

export default function AIChatbot() {
  const { isChatbotOpen, setIsChatbotOpen, chatbotProductContext, setChatbotProductContext } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize conversations
  useEffect(() => {
    if (messages.length === 0) {
      if (chatbotProductContext) {
        setTimeout(() => {
          setMessages([
            {
              id: "welcome-product",
              sender: "ai",
              text: `Xin chào! Tôi là Trợ lý ảo **TA HOUSE AI**. Tôi thấy bạn đang quan tâm đến sản phẩm **${chatbotProductContext.name} (${chatbotProductContext.code})**.\n\nSản phẩm này nổi bật với công nghệ: *${chatbotProductContext.technologies.slice(0, 3).join(", ")}* và được bảo hành chính hãng lên đến **${chatbotProductContext.warranty} tháng**.\n\nBạn cần tôi giải đáp thông số kỹ thuật hay tư vấn phương án lắp đặt cho sản phẩm này?`,
              timestamp: new Date()
            }
          ]);
        }, 0);
      } else {
        setTimeout(() => {
          setMessages([
            {
              id: "welcome",
              sender: "ai",
              text: "Xin chào! Tôi là Trợ lý ảo của thương hiệu **TA HOUSE** - Chuyên phân phối thiết bị nhà bếp thông minh và khóa cửa điện tử cao cấp.\n\nTên tôi là **TA HOUSE AI**. Tôi có thể giới thiệu các dòng khóa vân tay FaceID cao cấp, bếp từ đa điểm Bosch Đức, máy lọc nước AO Smith Mỹ, hoặc tư vấn giải pháp điều khiển Smart Home Hub.\n\nHôm nay tôi có thể giúp gì cho căn nhà của quý khách?",
              timestamp: new Date()
            }
          ]);
        }, 0);
      }
    }
  }, [chatbotProductContext, messages.length]);

  // Handle product context switches when chatbot is opened from different details pages
  useEffect(() => {
    if (chatbotProductContext && messages.length > 0) {
      const isContextAlreadyWelcomed = messages.some(m => m.id === `welcome-${chatbotProductContext.id}`);
      if (!isContextAlreadyWelcomed) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `welcome-${chatbotProductContext.id}`,
              sender: "ai",
              text: `Tôi đã cập nhật thông tin sản phẩm bạn đang xem: **${chatbotProductContext.name} (${chatbotProductContext.code})**.\n\nSản phẩm này thuộc phân khúc khoảng **${chatbotProductContext.priceRange}** và làm từ chất liệu cao cấp *${chatbotProductContext.specifications.material}*.\n\nBạn muốn tôi giải thích các tính năng nổi bật, so sánh nó với mẫu khác hay hướng dẫn lắp đặt chi tiết?`,
              timestamp: new Date()
            }
          ]);
        }, 0);
      }
    }
  }, [chatbotProductContext, messages]);

  // Keep chat scrolled to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message to screen
    const userMsg: Message = {
      id: generateId(),
      sender: "user",
      text,
      timestamp: new Date()
    };
    
    // Prepare temporary messages state to send to backend API
    const updatedMessages = [...messages, userMsg];
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // 2. Fetch live reply from Next.js server API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.text
          })),
          productContext: chatbotProductContext
        })
      });

      if (!response.ok) {
        throw new Error(`API error response status ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);

      if (!data.text) {
        throw new Error("Empty text returned from backend API");
      }

      // Add AI reply skeleton to screen
      const aiMsg: Message = {
        id: generateId(),
        sender: "ai",
        text: "",
        timestamp: new Date(),
        suggestedProducts: data.products
      };
      setMessages(prev => [...prev, aiMsg]);

      // Premium Typewriter streaming animation (word-by-word)
      const words = data.text.split(" ");
      let currentWordIndex = 0;
      let streamedText = "";
      
      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          streamedText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
          setMessages(prev => 
            prev.map(m => m.id === aiMsg.id ? { ...m, text: streamedText } : m)
          );
          currentWordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 30);

    } catch (apiError) {
      console.warn("API route failed or key unconfigured. Utilizing smart offline local engine fallback:", apiError);
      
      // 3. Fallback to resilient local offline search parser
      setTimeout(() => {
        setIsTyping(false);
        const fallbackRes = generateLocalResponse(text, chatbotProductContext);
        
        const aiMsg: Message = {
          id: generateId(),
          sender: "ai",
          text: "",
          timestamp: new Date(),
          suggestedProducts: fallbackRes.products
        };
        setMessages(prev => [...prev, aiMsg]);

        // Local word-by-word streaming animation
        const words = fallbackRes.text.split(" ");
        let currentWordIndex = 0;
        let streamedText = "";
        
        const interval = setInterval(() => {
          if (currentWordIndex < words.length) {
            streamedText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
            setMessages(prev => 
              prev.map(m => m.id === aiMsg.id ? { ...m, text: streamedText } : m)
            );
            currentWordIndex++;
          } else {
            clearInterval(interval);
          }
        }, 30);

      }, 1000);
    }
  };

  if (!isChatbotOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[92vw] sm:w-[420px] h-[550px] bg-white/95 dark:bg-graphite-dark/95 border border-lime/20 rounded-3xl shadow-2xl flex flex-col backdrop-blur-xl z-50 animate-fadeIn overflow-hidden text-graphite dark:text-warm-light transition-all duration-300">
      
      {/* Chatbot Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-warm-cream/50 to-white dark:from-graphite dark:to-graphite-dark border-b border-lime/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime/10 text-lime border border-lime/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-lime animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-graphite dark:text-warm-light">TA HOUSE AI Assistant</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Chuyên viên hỗ trợ trực tuyến
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setIsChatbotOpen(false);
            setChatbotProductContext(null);
          }}
          className="p-1.5 rounded-lg hover:bg-graphite/5 dark:hover:bg-warm-light/5 text-zinc-400 hover:text-graphite dark:hover:text-warm-light transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
              msg.sender === "user"
                ? "bg-lime text-white font-bold rounded-tr-none shadow-md shadow-lime/10"
                : "bg-warm-cream/50 dark:bg-graphite/60 border border-graphite/5 dark:border-warm-light/5 text-graphite/90 dark:text-warm-cream/90 rounded-tl-none"
            }`}>
              {/* Renders linebreaks and markdown bold tags */}
              <p className="whitespace-pre-wrap">
                {msg.text.split("**").map((part, index) => 
                  index % 2 === 1 ? <strong key={index} className="text-lime dark:text-lime-light font-black">{part}</strong> : part
                )}
              </p>

              {/* Show suggested products inside AI answer */}
              {msg.sender === "ai" && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-graphite/5 dark:border-warm-light/5 flex flex-col gap-2">
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Sản phẩm đề xuất liên quan:</p>
                  {msg.suggestedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      onClick={() => setIsChatbotOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-graphite/80 border border-graphite/5 dark:border-warm-light/5 hover:border-lime/40 transition-all group shadow-sm"
                    >
                      <span className="text-[11px] font-bold text-graphite/80 dark:text-warm-cream/80 group-hover:text-lime truncate max-w-[170px]">{p.code} - {p.categoryName}</span>
                      <span className="text-[9px] text-lime font-black flex items-center gap-0.5 group-hover:underline shrink-0 uppercase tracking-wider">
                        Xem <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Animated Stream Typing Cursor Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-warm-cream/40 dark:bg-graphite/40 border border-graphite/5 dark:border-warm-light/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-lime/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-lime/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-lime/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* Suggested Fast Questions Tray */}
      <div className="px-5 py-2 border-t border-graphite/5 dark:border-warm-light/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0 bg-warm-cream/10 dark:bg-graphite/20">
        {[
          "Tư vấn khóa vân tay cửa gỗ",
          "Bếp từ đa điểm Bosch Đức",
          "Chậu rửa bát Konox từ Ý",
          "Máy lọc nước RO AO Smith",
          "Chính sách bảo hành sản phẩm"
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 bg-white dark:bg-graphite border border-graphite/5 dark:border-warm-light/5 hover:border-lime hover:text-lime text-[10px] text-zinc-500 dark:text-zinc-400 rounded-full font-bold transition-all focus:outline-none shrink-0 shadow-sm cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Message Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-4 bg-warm-cream/30 dark:bg-graphite border-t border-graphite/5 dark:border-warm-light/5 flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Nhập câu hỏi của bạn tại đây..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-graphite-dark border border-graphite/10 dark:border-warm-light/10 focus:border-lime rounded-xl text-xs text-graphite dark:text-warm-light placeholder-zinc-400 focus:outline-none font-bold"
        />
        <button
          type="submit"
          className="p-3 bg-lime text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
