"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Facebook, Youtube, Send, CheckCircle2, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CATEGORIES } from "@/data/products";

export default function Footer() {
  const { updateFilters, theme } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000); // resets after 5s
    }
  };

  const handleCategoryClick = (slug: string) => {
    updateFilters({ category: slug });
    document.getElementById("products-listing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[var(--background)] border-t border-gold/10 pt-16 pb-8 relative z-10">
      
      {/* Brand Partners Marquee Slider (Extra feature) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h4 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">Đối tác thương hiệu toàn cầu</h4>
        <div className="overflow-hidden relative w-full py-4 border-y border-zinc-900/50">
          <div className="flex gap-16 items-center whitespace-nowrap animate-scroll-marquee">
            {/* Double the logos to support endless sliding marquee effect */}
            {["KASSLER EUROPE", "FPC SWEDEN", "TUYA SMART", "YALE CO.", "MILRE KOREA", "SCHLAGE USA", "PHILIPS SMART", "KASSLER EUROPE", "FPC SWEDEN", "TUYA SMART", "YALE CO.", "MILRE KOREA", "SCHLAGE USA", "PHILIPS SMART"].map((partner, index) => (
              <span 
                key={index}
                className="text-lg font-black tracking-widest text-zinc-600 hover:text-gold transition-colors font-mono cursor-default"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Company Profile */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg border border-gold/30 bg-zinc-950 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gold" />
              </div>
              <span className="text-lg font-black tracking-widest text-white font-sans">
                KASSLER<span className="text-gold font-light text-xxs align-super">®</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Thương hiệu khóa cửa thông minh cao cấp xuất xứ CHLB Đức. Đem đến giải pháp bảo mật tuyệt đối, thiết kế sang trọng đẳng cấp và ứng dụng các công nghệ AI sinh trắc học tiên phong hàng đầu thế giới.
            </p>
            
            {/* Social Medias */}
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 hover:bg-gold/15 text-zinc-400 hover:text-gold transition-all" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 hover:bg-gold/15 text-zinc-400 hover:text-gold transition-all" title="Youtube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-zinc-900 hover:bg-gold/15 text-zinc-400 hover:text-gold transition-all font-bold text-xs leading-none" title="Zalo Official">
                Zalo
              </a>
              <a href="#" className="p-2.5 rounded-full bg-zinc-900 hover:bg-gold/15 text-zinc-400 hover:text-gold transition-all font-bold text-xs leading-none" title="TikTok">
                Tiktok
              </a>
            </div>
          </div>

          {/* Column 2: Categories & Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold pl-3">Sản phẩm nổi bật</h3>
            <ul className="flex flex-col gap-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="text-sm text-zinc-400 hover:text-gold transition-colors text-left focus:outline-none"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Corporate Policies */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold pl-3">Chính sách & Hỗ trợ</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="#faq" className="text-sm text-zinc-400 hover:text-gold transition-colors">
                  Chính sách bảo hành 36 tháng
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-sm text-zinc-400 hover:text-gold transition-colors">
                  Chính sách vận chuyển & Lắp đặt
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-sm text-zinc-400 hover:text-gold transition-colors">
                  Quy trình bảo trì định kỳ
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-sm text-zinc-400 hover:text-gold transition-colors">
                  Hỏi đáp kỹ thuật FAQs
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-gold hover:underline font-medium">
                  Cổng quản trị nội dung Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletters / Subscribe */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold pl-3">Đăng ký Nhận Tin</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Nhận thông tin cập nhật về các mẫu khóa cao cấp mới nhất và các chương trình ưu đãi độc quyền.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                placeholder="Địa chỉ Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-4 pr-12 py-3 bg-zinc-900 border border-gold/15 focus:border-gold rounded-lg text-sm text-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 p-2 bg-gradient-to-r from-gold-dark to-gold text-[#050505] rounded-md hover:brightness-115 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-2 text-xs text-gold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                Đăng ký thành công! Cảm ơn bạn đã quan tâm.
              </div>
            )}
          </div>

        </div>

        {/* Detailed Address Grid + Google Maps Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12 pb-8 border-t border-zinc-900">
          
          {/* Showroom Contacts Info */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">Công ty Cổ phần Kassler Việt Nam</h4>
            <div className="flex items-start gap-3 text-sm text-zinc-400">
              <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span>
                <strong>Showroom chính:</strong> 123 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <span>
                <strong>Hotline tư vấn 24/7:</strong> 1900 8888 / 0988.888.888
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <span>
                <strong>Email liên hệ:</strong> info@kassler-vietnam.vn
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Clock className="w-4 h-4 text-gold shrink-0" />
              <span>
                <strong>Giờ làm việc:</strong> 8:00 - 21:00 (Cả Thứ Bảy & Chủ Nhật)
              </span>
            </div>
          </div>

          {/* Google Maps Embed iframe */}
          <div className="lg:col-span-2 w-full h-48 rounded-xl overflow-hidden border border-gold/15 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1m3!1m2!1s0x3135ac9a0397cc31%3A0xe1db09c8558cf778!2zMTIzIE5ndXnhu4VuIFRyw6NpLCBUaMaw4bujbmcgxJDDrG5oLCBUaGFuaCBYdcOibiwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ 
                border: 0, 
                filter: theme === "dark" ? "grayscale(1) invert(0.92) contrast(1.2)" : "grayscale(0.2) contrast(1.05)" 
              }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Kassler Vietnam Google Map Location"
            />
          </div>

        </div>

        {/* Bottom Rights Reserved */}
        <div className="pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} KASSLER VIETNAM. Bản quyền được bảo hộ. Thiết kế bởi Antigravity.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-gold transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-gold transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-gold transition-colors">Sơ đồ trang</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
