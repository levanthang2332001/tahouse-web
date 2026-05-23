"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-10 w-full bg-[#2a2c2d] pb-8 pt-20 font-sans leading-relaxed text-gray-300 transition-colors duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start lg:col-span-4 lg:pr-8">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex items-end rounded-sm bg-white p-2 leading-none">
                <span className="text-2xl font-medium tracking-tight text-[#769b52]">TA</span>
                <span className="ml-1 text-2xl font-medium tracking-tight text-gray-900">HOUSE</span>
              </div>
            </Link>
            <p className="mb-6 max-w-sm text-left text-xs leading-relaxed text-gray-400">
              Chúng tôi tập trung vào giải pháp chính hãng, thẩm mỹ và đồng bộ cho không gian sống hiện đại.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition-all hover:border-[#769b52] hover:bg-[#769b52] hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-6 text-sm font-medium uppercase tracking-wider text-white">
              Danh mục
            </h4>
            <ul className="space-y-4 text-left text-xs text-gray-400">
              <li><Link href="#categories">Khóa cửa vân tay</Link></li>
              <li><Link href="#categories">Khóa khuôn mặt</Link></li>
              <li><Link href="#solutions">Thiết bị nhà bếp</Link></li>
              <li><Link href="#solutions">Phụ kiện cửa</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-start lg:col-span-2">
            <h4 className="mb-6 text-sm font-medium uppercase tracking-wider text-white">
              Hỗ trợ
            </h4>
            <ul className="space-y-4 text-left text-xs text-gray-400">
              <li><Link href="#news">Tin tức</Link></li>
              <li><Link href="#contact">Tư vấn</Link></li>
              <li><Link href="#solutions">Giải pháp</Link></li>
            </ul>
          </div>

          <div className="relative flex flex-col items-start text-left lg:col-span-4">
            <h4 className="mb-6 text-sm font-medium uppercase tracking-wider text-white">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-xs font-light leading-relaxed text-gray-400">
                  961A Kha Vạn Cân, P. Linh Xuân,
                  <br />
                  TP. Thủ Đức, TP. HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <a href="tel:0938824479" className="text-xs font-light text-gray-400">
                  0938 824 479
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <a href="mailto:info@takit.vn" className="text-xs font-light text-gray-400">
                  info@takit.vn
                </a>
              </li>
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#769b52] text-white shadow-lg shadow-[#769b52]/10 transition-colors hover:bg-[#658744]"
              aria-label="Cuộn lên đầu trang"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-700/50 pt-8 md:flex-row">
          <p className="text-[11px] font-light text-gray-500">
            © 2026 TA HOUSE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] font-light text-gray-500">
              Điều khoản sử dụng
            </a>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-[11px] font-light text-gray-500">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
