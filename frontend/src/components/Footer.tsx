"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram, ArrowUp } from "lucide-react";

export default function Footer() {
  const handleScrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#2a2c2d] text-gray-300 pt-20 pb-8 relative z-10 leading-relaxed font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Col 1: Brand Profile */}
          <div className="lg:col-span-4 lg:pr-8 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex items-end leading-none bg-white p-2 rounded-sm select-none">
                <span className="text-[#769b52] text-2xl tracking-tight font-medium">
                  TA
                </span>
                <span className="text-gray-900 text-2xl tracking-tight font-medium ml-1">
                  HOUSE
                </span>
              </div>
            </Link>
            <p className="text-xs font-light text-gray-400 leading-relaxed mb-6 max-w-sm text-left">
              Chúng tôi cam kết mang đến sản phẩm chính hãng, chất lượng cao
              cùng dịch vụ tận tâm để nâng tầm không gian sống của bạn.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-[#769b52] hover:border-[#769b52] hover:text-white transition-all"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-[#769b52] hover:border-[#769b52] hover:text-white transition-all"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-[#769b52] hover:border-[#769b52] hover:text-white transition-all"
                title="Youtube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-[#769b52] hover:border-[#769b52] hover:text-white transition-all"
                title="TikTok"
              >
                {/* Tiktok inline SVG/Icon */}
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.58-.73v7.05c-.01 2.3-.92 4.67-2.68 6.13-1.91 1.61-4.7 2.11-7.05 1.53-2.58-.63-4.82-2.73-5.39-5.38-.68-3.11.83-6.57 3.75-7.7 1-.39 2.08-.53 3.14-.46v4.03c-.87-.1-1.78.07-2.51.6-.9.65-1.34 1.88-1.07 2.97.29 1.17 1.42 2.07 2.62 2.01 1.34.07 2.62-.93 2.73-2.28.02-1.34.01-2.68.01-4.02V0l.86.02Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Categories Links */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <h4 className="text-sm text-white font-medium mb-6 uppercase tracking-wider">
              Danh mục
            </h4>
            <ul className="space-y-4 text-left">
              <li>
                <Link href="/products?cat=Kitchen" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Thiết bị nhà bếp
                </Link>
              </li>
              <li>
                <Link href="/products?cat=Lock" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Khóa thông minh
                </Link>
              </li>
              <li>
                <Link href="/products?cat=Water" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Thiết bị lọc nước
                </Link>
              </li>
              <li>
                <Link href="/products?cat=Cabinet" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Phụ kiện tủ bếp
                </Link>
              </li>
              <li>
                <Link href="/products?cat=Smart" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Thiết bị thông minh
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support Links */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <h4 className="text-sm text-white font-medium mb-6 uppercase tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="space-y-4 text-left">
              <li>
                <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Thanh toán &amp; vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact details */}
          <div className="lg:col-span-4 relative flex flex-col items-start text-left">
            <h4 className="text-sm text-white font-medium mb-6 uppercase tracking-wider">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                <span className="text-xs text-gray-400 font-light leading-relaxed">
                  961A Kha Vạn Cân, P. Linh Xuân,
                  <br />
                  TP. Thủ Đức, TP. HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                <a href="tel:0938824479" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  0938 824 479
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-gray-400" />
                <a href="mailto:info@takit.vn" className="text-xs text-gray-400 hover:text-white transition-colors font-light">
                  info@takit.vn
                </a>
              </li>
            </ul>

            {/* Back to top button */}
            <button 
              onClick={handleScrollToTop}
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#769b52] hover:bg-[#658744] rounded-full flex items-center justify-center text-white transition-colors cursor-pointer shadow-lg shadow-[#769b52]/10"
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-500 font-light">
            © 2024 TA HOUSE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors font-light">
              Điều khoản sử dụng
            </a>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors font-light">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
