"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Send, Sparkles, MessageSquare, ArrowRight, RefreshCw, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, Product } from "@/data/products";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  suggestedProducts?: Product[];
}

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
        setMessages([
          {
            id: "welcome-product",
            sender: "ai",
            text: `Xin chào! Tôi là Trợ lý ảo AI Kassler. Tôi thấy bạn đang quan tâm đến dòng khóa **${chatbotProductContext.name} (${chatbotProductContext.code})**. \n\nDòng khóa này nổi bật với công nghệ: *${chatbotProductContext.technologies.slice(0, 3).join(", ")}* và thời gian bảo hành lên đến **${chatbotProductContext.warranty} tháng**.\n\nBạn cần tôi giải đáp thông số kỹ thuật hay tư vấn lắp đặt cho sản phẩm này?`,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages([
          {
            id: "welcome",
            sender: "ai",
            text: "Xin chào! Tôi là Trợ lý ảo AI của thương hiệu khóa thông minh Kassler. \n\nTên tôi là **Kassler AI**. Tôi có thể giới thiệu các dòng khóa cao cấp, so sánh tính năng giữa các sản phẩm hoặc tư vấn loại khóa phù hợp nhất cho loại cửa nhà bạn (cửa nhôm Xingfa, cửa gỗ biệt thự, cửa kính văn phòng,...). \n\nHôm nay tôi có thể giúp gì cho bạn?",
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [chatbotProductContext, messages.length]);

  // Handle product context switches when chatbot is opened from different details pages
  useEffect(() => {
    if (chatbotProductContext && messages.length > 0) {
      const isContextAlreadyWelcomed = messages.some(m => m.id === `welcome-${chatbotProductContext.id}`);
      if (!isContextAlreadyWelcomed) {
        setMessages(prev => [
          ...prev,
          {
            id: `welcome-${chatbotProductContext.id}`,
            sender: "ai",
            text: `Tôi đã cập nhật thông tin sản phẩm mục tiêu: **${chatbotProductContext.name} (${chatbotProductContext.code})**. \n\nSản phẩm này có giá tầm phân khúc **${chatbotProductContext.priceRange}** và làm từ chất liệu cao cấp *${chatbotProductContext.specifications.material}*.\n\nBạn muốn tôi giải thích các tính năng, so sánh nó với mẫu khác hay gửi hướng dẫn lắp đặt?`,
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [chatbotProductContext, messages]);

  // Keep chat scrolled to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 2. Generate simulated streaming reply after small delay
    setTimeout(() => {
      const response = generateAIResponse(text);
      
      // Simulate streaming response
      setIsTyping(false);
      
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: "",
        timestamp: new Date(),
        suggestedProducts: response.products
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Stream word by word
      const words = response.text.split(" ");
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
      }, 50);

    }, 1200);
  };

  const generateAIResponse = (query: string): { text: string; products?: Product[] } => {
    const q = query.toLowerCase();
    
    // Check if user is asking for product comparisons
    if (q.includes("so sánh") || q.includes("khác gì") || q.includes("vs")) {
      const matchingProds = PRODUCTS.filter(p => q.includes(p.code.toLowerCase().split(" ")[0]));
      
      if (matchingProds.length >= 2) {
        const [p1, p2] = matchingProds;
        return {
          text: `Dưới đây là so sánh chi tiết giữa **${p1.name} (${p1.code})** và **${p2.name} (${p2.code})**:\n\n1. **Chất liệu**: \n   - *${p1.code}*: ${p1.specifications.material}\n   - *${p2.code}*: ${p2.specifications.material}\n\n2. **Công nghệ chính**:\n   - *${p1.code}*: ${p1.technologies.join(", ")}\n   - *${p2.code}*: ${p2.technologies.join(", ")}\n\n3. **Thời gian bảo hành**:\n   - *${p1.code}*: ${p1.warranty} tháng\n   - *${p2.code}*: ${p2.warranty} tháng\n\n4. **Phân khúc giá**:\n   - *${p1.code}*: ${p1.priceRange}\n   - *${p2.code}*: ${p2.priceRange}\n\nCả hai mẫu đều rất cao cấp. Nếu bạn thích vẻ cổ điển hoàng gia thì mẫu ${p1.code} dát vàng là sự lựa chọn số 1. Còn nếu nhà bạn căn hộ hiện đại tối giản thì mẫu ${p2.code} là lý tưởng nhất.`,
          products: [p1, p2]
        };
      }

      // Default comparison answer if not specific products matching
      return {
        text: "Kassler có rất nhiều mẫu khóa cửa cao cấp. Để so sánh, bạn có thể nhập tên mã sản phẩm (Ví dụ: 'So sánh KL-990 với KL-888') hoặc sử dụng tính năng **So sánh sản phẩm** bằng cách ấn biểu tượng So sánh ở góc các thẻ sản phẩm nhé!",
        products: PRODUCTS.slice(0, 2)
      };
    }

    // Recommendation based on door category
    if (q.includes("cửa nhôm") || q.includes("xingfa")) {
      const prods = PRODUCTS.filter(p => p.category === "khoa-cua-nhom");
      return {
        text: "Đối với **Cửa nhôm Xingfa** hoặc cửa nhựa đố hẹp, bạn bắt buộc phải dùng các dòng khóa thiết kế ruột thanh mảnh chuyên dụng. Dòng khóa bán chạy nhất của chúng tôi là **Kassler KL-660 Slim Plus**.\n\nSản phẩm này đạt tiêu chuẩn kháng nước **IP66**, vân tay 360 độ siêu nhạy và hỗ trợ mở khóa qua App Wifi Tuya thông minh từ xa. Bạn có muốn xem thêm chi tiết sản phẩm này?",
        products: prods
      };
    }

    if (q.includes("cửa kính") || q.includes("cường lực")) {
      const prods = PRODUCTS.filter(p => p.category === "khoa-cua-kinh");
      return {
        text: "Cho **Cửa kính cường lực** (phổ biến ở các văn phòng, cửa hàng), Kassler cung cấp dòng sản phẩm **Kassler KL-550 Glass**.\n\nƯu điểm vượt trội là **lắp đặt dạng kẹp thông minh không cần khoan lỗ kính**, hỗ trợ chấm công kết xuất dữ liệu Excel qua cổng USB, lưu trữ lên đến 150 vân tay và 300 thẻ từ. Phù hợp tuyệt đối cho văn phòng hiện đại.",
        products: prods
      };
    }

    if (q.includes("cửa cổng") || q.includes("ngoài trời")) {
      const prods = PRODUCTS.filter(p => p.category === "khoa-cua-cong");
      return {
        text: "Với **Cửa cổng ngoài trời**, yêu cầu an ninh cực cao và kháng nước mạnh. Dòng khóa **Kassler KL-400 Gate** làm hoàn toàn bằng **Inox 304 đúc nguyên khối chống cắt phá**, đạt chuẩn chống nước **IP67** mưa ngập, đặc biệt trang bị cảm biến vân tay 2 mặt trong/ngoài cực an toàn.",
        products: prods
      };
    }

    if (q.includes("đại sảnh") || q.includes("biệt thự") || q.includes("tổ ấm") || q.includes("cổ điển")) {
      const prods = PRODUCTS.filter(p => p.category === "khoa-dai-sanh");
      return {
        text: "Dành riêng cho các căn **Đại sảnh biệt thự, lâu đài sang trọng**, chúng tôi đề xuất tuyệt phẩm **Kassler KL-990 Luxury Gold**.\n\nKhóa được đúc đồng nguyên chất, mạ vàng 24K thủ công tinh xảo kết hợp công nghệ **Face ID 3D** quét hồng ngoại ban đêm hồng ngoại, mang lại vẻ quyền quý hoàng tộc và mức độ an toàn cao nhất.",
        products: prods
      };
    }

    if (q.includes("két sắt") || q.includes("két thông minh")) {
      const prods = PRODUCTS.filter(p => p.category === "ket-sat-thong-minh");
      return {
        text: "Nếu bạn tìm kiếm thiết bị lưu giữ tài sản, **Két sắt thông minh Kassler KS-100 Safe** là lựa chọn hoàn hảo.\n\nĐược đúc bằng thép carbon cường lực siêu dày 10 ly chống cháy ở 1200 độ C trong 2 tiếng, hệ thống mở khóa vân tay ẩn tích hợp núm xoay tự động và bọc da nhung Alcantara xa xỉ bên trong.",
        products: prods
      };
    }

    if (q.includes("bảo hành") || q.includes("chính sách")) {
      return {
        text: "Kassler áp dụng chế độ bảo hành cực kỳ uy tín cho khách hàng:\n- Bảo hành **36 tháng** đối với dòng Khóa đại sảnh (KL-990) và Két sắt thông minh (KS-100).\n- Bảo hành **24 tháng** đối với tất cả các dòng khóa cửa gỗ, cửa nhôm, cửa kính, cửa cổng khác.\n- Hỗ trợ đổi mới 1-đổi-1 trong vòng 30 ngày nếu có lỗi kỹ thuật từ nhà sản xuất. Lắp đặt tận nơi miễn phí tại Hà Nội và TP.HCM."
      };
    }

    if (q.includes("giá") || q.includes("bao nhiêu tiền")) {
      if (chatbotProductContext) {
        return {
          text: `Dòng sản phẩm **${chatbotProductContext.name}** bạn đang xem thuộc phân khúc giá tham khảo khoảng **${chatbotProductContext.priceRange}** (đã bao gồm nhân công lắp đặt trọn gói & bảo hành chính hãng).\n\nNếu mua theo dự án số lượng lớn, chúng tôi sẽ áp dụng chiết khấu đặc biệt cực tốt. Hãy để lại số điện thoại ở phần Liên hệ để chuyên viên gọi điện báo giá ưu đãi nhất nhé!`
        };
      }
      return {
        text: "Các dòng khóa Kassler chính hãng dao động từ khoảng **5.500.000 VNĐ** (khóa cửa kính, cửa nhôm) lên tới trên **30.000.000 VNĐ** (khóa đại sảnh mạ vàng dát ngọc). Mức giá này đã bao gồm dịch vụ lắp đặt tận nhà và bảo hành chính hãng từ 2 đến 3 năm."
      };
    }

    // Default response using product features search
    const matchingProduct = PRODUCTS.find(p => q.includes(p.code.toLowerCase()) || q.includes(p.id));
    if (matchingProduct) {
      return {
        text: `Tôi thấy bạn đang hỏi về **${matchingProduct.name} (${matchingProduct.code})**.\n\nĐây là thông số nổi bật:\n- **Kích thước**: ${matchingProduct.specifications.dimensions}\n- **Chất liệu**: ${matchingProduct.specifications.material}\n- **Nguồn điện**: ${matchingProduct.specifications.battery}\n- **Cách thức mở**: ${matchingProduct.specifications.openingMethods.join(", ")}.\n\nKhóa đang có sẵn hàng lắp đặt trong ngày!`,
        products: [matchingProduct]
      };
    }

    // Standard fallback chatbot response
    return {
      text: "Cảm ơn câu hỏi của bạn. Để tôi tư vấn tốt nhất, bạn có thể tham khảo các câu hỏi thường gặp dưới đây hoặc để lại số điện thoại liên hệ. Kassler hỗ trợ khảo sát vị trí lắp đặt miễn phí tận nơi!",
      products: PRODUCTS.slice(0, 3)
    };
  };

  if (!isChatbotOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[92vw] sm:w-[420px] h-[550px] bg-[var(--dark-bg)]/95 border border-gold/20 rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl z-50 animate-fadeIn overflow-hidden">
      
      {/* Chatbot Header */}
      <div className="px-4 py-4 bg-gradient-to-r from-zinc-950 to-[var(--dark-bg)] border-b border-gold/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-gold animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Kassler AI Smart Assistant</h3>
            <span className="flex items-center gap-1.5 text-xxs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Trực tuyến (Phản hồi tức thì)
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setIsChatbotOpen(false);
            setChatbotProductContext(null);
          }}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.sender === "user"
                ? "bg-gradient-to-r from-gold-dark to-gold text-[#050505] font-medium rounded-tr-none"
                : "bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-none"
            }`}>
              {/* Renders linebreaks and markdown bold tags */}
              <p className="whitespace-pre-wrap">
                {msg.text.split("**").map((part, index) => 
                  index % 2 === 1 ? <strong key={index} className="text-white font-bold">{part}</strong> : part
                )}
              </p>

              {/* Show suggested products inside AI answer */}
              {msg.sender === "ai" && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
                  <p className="text-xxs text-zinc-500 font-semibold uppercase tracking-wider">Sản phẩm liên quan đề xuất:</p>
                  {msg.suggestedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => setIsChatbotOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-gold/10 hover:border-gold/30 transition-all group"
                    >
                      <span className="text-xs font-semibold text-zinc-300 group-hover:text-gold truncate max-w-[170px]">{p.code} - {p.categoryName}</span>
                      <span className="text-[10px] text-gold font-bold flex items-center gap-1 group-hover:underline shrink-0">
                        Chi tiết <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* Suggested Fast Questions Tray */}
      <div className="px-4 py-2 border-t border-zinc-900 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0">
        {[
          "Tư vấn khóa cửa nhôm Xingfa",
          "So sánh KL-990 với KL-888",
          "Khóa cửa kính không khoan lỗ",
          "Chính sách bảo hành bao lâu?",
          "Khóa cổng sắt ngoài trời"
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 bg-zinc-950 border border-gold/10 hover:border-gold text-xxs text-zinc-400 hover:text-gold rounded-full transition-all focus:outline-none shrink-0"
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
        className="p-4 bg-zinc-950/80 border-t border-zinc-900/60 flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Nhập câu hỏi của bạn tại đây..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-zinc-900 border border-gold/10 focus:border-gold rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          className="p-2.5 bg-gradient-to-r from-gold-dark to-gold text-[#050505] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
