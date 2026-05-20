"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Lock, Sparkles, Shield, Star, CheckCircle, ChevronRight, Phone, Send, Info, Eye,
  RefreshCw, Trash2, X, AlertTriangle, Fingerprint, Wifi, Key, CreditCard, Camera
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, CATEGORIES, Product } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloating from "@/components/SocialFloating";
// import AIChatbot from "@/components/AIChatbot";

// Local assets for mock installation gallery
const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80", title: "Lắp đặt khóa KL-990 trên cửa gỗ gõ đỏ Đại sảnh biệt thự" },
  { url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", title: "Lắp đặt khóa KL-888 chung cư cao cấp Vinhomes" },
  { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", title: "Cửa nhôm Xingfa lắp khóa chống nước KL-660" },
  { url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80", title: "Khóa cửa cổng sắt ngoài trời 2 mặt vân tay KL-400" },
  { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", title: "Lắp đặt két sắt thông minh KS-100 âm tủ gia đình" },
  { url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", title: "Hệ thống khóa khách sạn KL-300 tại resort Phú Quốc" }
];

export default function Home() {
  const {
    wishlist,
    toggleWishlist,
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    toggleTechnologyFilter,
    clearFilters,
    setIsChatbotOpen,
    setChatbotProductContext
  } = useApp();

  // Testimonial auto slider state
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      name: "Anh Hoàng Nguyễn",
      title: "Chủ biệt thự Vinhomes Riverside, Hà Nội",
      avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80",
      review: "Tôi cực kỳ hài lòng với khóa đại sảnh Kassler KL-990 Gold. Khóa thiết kế cổ điển đúc đồng rất uy nghi, hợp tông biệt thự tân cổ điển của tôi. Tính năng Face ID nhận diện cực nhạy kể cả ban đêm.",
      stars: 5
    },
    {
      name: "Chị Thảo Mai",
      title: "Chủ chuỗi căn hộ dịch vụ cao cấp, TP. Hồ Chí Minh",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      review: "Dòng khóa nhôm KL-660 chống nước lắp cho hệ cửa Xingfa của tôi hoạt động bền bỉ, mưa hắt trực tiếp vẫn mở rất mượt. Dịch vụ lắp đặt trọn gói của Kassler cực kỳ chuyên nghiệp và nhanh gọn.",
      stars: 5
    },
    {
      name: "Anh Minh Đức",
      title: "Giám đốc vận hành Văn phòng TechHub, Đà Nẵng",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      review: "Khóa cửa kính KL-550 lắp cho văn phòng không cần khoan kính rất tiện lợi. Tính năng kết xuất dữ liệu chấm công hàng tháng qua cổng USB giúp bộ phận hành chính của công ty tiết kiệm rất nhiều thời gian.",
      stars: 5
    }
  ];

  // Lead contact form states
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "", product: "", message: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Gallery zoom lightbox modal state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // FAQ accordion active state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto testimonial transition
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Filtering products logic
  const filteredProducts = PRODUCTS.filter((product) => {
    // 1. Search Query Match
    const matchesSearch = searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Filter
    const matchesCategory = filters.category === "all" || product.category === filters.category;

    // 3. Color Filter
    const matchesColor = filters.color === "all" || 
      product.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase()));

    // 4. Technology Filters
    const matchesTechs = filters.technologies.length === 0 ||
      filters.technologies.every(tech => product.technologies.includes(tech));

    return matchesSearch && matchesCategory && matchesColor && matchesTechs;
  });

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadForm.name && leadForm.phone) {
      setLeadSubmitted(true);
      // In a real app, this posts to /api/leads
      console.log("Captured Lead Contact:", leadForm);
      setLeadForm({ name: "", phone: "", email: "", product: "", message: "" });
      setTimeout(() => setLeadSubmitted(false), 8000);
    }
  };

  const handleOpenAIChatContext = (product: Product) => {
    setChatbotProductContext(product);
    setIsChatbotOpen(true);
  };

  return (
    <>
      <Header />

      <main className="flex-1 pt-20">
        
        {/* 1. HERO SECTION */}
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-gold/15 bg-black">
          {/* Elegant Dark Gold Background Gradients */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gold/10 blur-[130px] pointer-events-none" />
            <div className="absolute inset-0 hero-gradient pointer-events-none" />
            <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1920&q=80')" }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-zinc-950/80 text-gold text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Công nghệ khóa bảo mật AI thế hệ mới
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-tight">
              Khóa Cửa Thông Minh <br />
              <span className="gold-gradient-text">Thế Hệ Mới Kassler</span>
            </h1>

            {/* Sub-heading details */}
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-light">
              An toàn - Sang trọng - Công nghệ AI sinh trắc học tối cao. Nâng tầm kiến trúc biệt thự, nhà phố hiện đại với giải pháp bảo mật tiêu chuẩn châu Âu từ CHLB Đức.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full max-w-md">
              <button
                onClick={() => document.getElementById("products-listing")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-dark to-gold text-[#050505] font-black uppercase tracking-wider rounded-full shadow-lg shadow-gold/10 hover:shadow-gold/20 hover:scale-103 active:scale-98 transition-all text-sm cursor-pointer"
              >
                Khám phá sản phẩm
              </button>
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950/80 border border-gold/40 text-gold font-bold uppercase tracking-wider rounded-full hover:bg-gold/5 transition-all text-sm text-center"
              >
                Nhận tư vấn kỹ thuật
              </a>
            </div>

            {/* Small Spec Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl w-full border-t border-zinc-900 pt-8">
              {[
                { label: "BẢO MẬT TUYỆT ĐỐI", desc: "FaceID 3D & Vân tay FPC Thụy Điển" },
                { label: "CHẤT LIỆU CAO CẤP", desc: "Đồng dát vàng 24K, Thép Inox 304" },
                { label: "KẾT NỐI TOÀN DIỆN", desc: "Điều khiển Wifi App thông minh" },
                { label: "BẢO HÀNH CHÍNH HÃNG", desc: "Uy tín 24 - 36 tháng tận nhà" }
              ].map((spec, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gold tracking-widest mb-1.5">{spec.label}</span>
                  <span className="text-xs text-zinc-400 font-light text-center">{spec.desc}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Golden Floating particles backdrop decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[30%] left-[15%] w-2 h-2 rounded-full bg-gold/30 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute top-[60%] right-[20%] w-3 h-3 rounded-full bg-gold/20 animate-ping" style={{ animationDuration: "5s" }} />
            <div className="absolute bottom-[20%] left-[40%] w-1.5 h-1.5 rounded-full bg-gold/45 animate-pulse" />
          </div>
        </section>

        {/* 2. CORE VALUES / BENEFIT GRID */}
        <section className="py-20 bg-zinc-950 border-b border-zinc-900 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest mb-3">TẠI SAO CHỌN KASSLER?</h2>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Đỉnh Cao Công Nghệ Bảo Mật Cửa Ra Vào
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Fingerprint className="w-8 h-8 text-gold" />, 
                  title: "Công Nghệ Vân Tay FPC Thụy Điển", 
                  desc: "Nhận diện sinh trắc học dựa trên nhiệt độ, áp suất, điện dung của cơ thể sống. Thời gian quét chưa đầy 0.5 giây, chống sao chép và làm giả vân tay tuyệt đối." 
                },
                { 
                  icon: <Camera className="w-8 h-8 text-gold" />, 
                  title: "Nhận Diện Khuôn Mặt Face ID 3D", 
                  desc: "Camera hồng ngoại kép quét đa chiều mô hình chiều sâu khuôn mặt. Tự động nhận dạng chính xác trong đêm tối, ngăn chặn việc sử dụng ảnh chụp và video mở cửa." 
                },
                { 
                  icon: <Wifi className="w-8 h-8 text-gold" />, 
                  title: "Điều Khiển Thông Minh Qua Điện Thoại", 
                  desc: "Xem lịch sử đóng mở trực tuyến, nhận cảnh báo đẩy khi có đột nhập phá hoại, tạo mật mã dùng 1 lần (OTP) từ xa cho bạn bè và người thân." 
                }
              ].map((value, idx) => (
                <div 
                  key={idx} 
                  className="glass-panel glass-panel-hover p-8 rounded-2xl transition-all duration-300 flex flex-col gap-5 border border-gold/10"
                >
                  <div className="w-14 h-14 rounded-xl bg-gold/5 border border-gold/25 flex items-center justify-center shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. PRODUCT SHOWCASE (SEARCH, MULTI-FILTER & LISTING GRID) */}
        <section id="products-listing" className="py-24 bg-luxury-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Main Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-xs font-bold text-gold uppercase tracking-widest mb-3">DANH MỤC THIẾT BỊ</h2>
                <h3 className="text-3xl font-extrabold text-white tracking-wide">
                  Hệ Thống Sản Phẩm Kassler Cao Cấp
                </h3>
              </div>
              
              {/* Active filters status reset */}
              {(filters.category !== "all" || filters.color !== "all" || filters.technologies.length > 0 || searchQuery !== "") && (
                <button
                  onClick={clearFilters}
                  className="self-start md:self-end flex items-center gap-1.5 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-xs font-bold uppercase rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* A. FILTER SIDEBAR (Desktop) */}
              <aside className="lg:col-span-1 flex flex-col gap-6 bg-luxury-dark border border-gold/15 p-6 rounded-2xl h-fit sticky top-24">
                <div className="border-b border-zinc-800 pb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bộ lọc tìm kiếm</h4>
                </div>

                {/* Filter 1: Categories */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dòng Sản Phẩm</span>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    <button
                      onClick={() => updateFilters({ category: "all" })}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${
                        filters.category === "all" 
                          ? "bg-gold text-[#050505] font-bold" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      }`}
                    >
                      Tất cả sản phẩm ({PRODUCTS.length})
                    </button>
                    {CATEGORIES.map((cat) => {
                      const count = PRODUCTS.filter(p => p.category === cat.slug).length;
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => updateFilters({ category: cat.slug })}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex justify-between items-center ${
                            filters.category === cat.slug 
                              ? "bg-gold text-[#050505] font-bold" 
                              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            filters.category === cat.slug ? "bg-[#050505]/20 text-[#050505]" : "bg-zinc-900 text-zinc-500"
                          }`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter 2: Colors */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Màu sắc</span>
                  <select
                    value={filters.color}
                    onChange={(e) => updateFilters({ color: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="all">Tất cả màu sắc</option>
                    <option value="vàng">Màu Vàng Gold</option>
                    <option value="đồng">Màu Đồng Cổ</option>
                    <option value="đen">Màu Đen Nhám</option>
                    <option value="bạc">Màu Bạc Chrome</option>
                  </select>
                </div>

                {/* Filter 3: High-end Techs checkboxes */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Công Nghệ Bảo Mật</span>
                  <div className="flex flex-col gap-2 mt-1.5">
                    {[
                      { key: "Face ID 3D", label: "Nhận diện FaceID 3D" },
                      { key: "FPC Biometric Thụy Điển", label: "Vân tay FPC Thụy Điển" },
                      { key: "Wifi Tuya App", label: "App quản lý qua Wifi" },
                      { key: "Chống nước IP66", label: "Chống nước IP66" },
                      { key: "Chống nước IP67", label: "Chống nước ngoài trời IP67" },
                      { key: "Mật mã ảo", label: "Xáo trộn mật mã ảo" }
                    ].map((tech) => (
                      <label 
                        key={tech.key} 
                        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={filters.technologies.includes(tech.key)}
                          onChange={() => toggleTechnologyFilter(tech.key)}
                          className="w-3.5 h-3.5 accent-gold border-zinc-700 bg-zinc-900 rounded"
                        />
                        <span>{tech.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Direct AI assistant support block */}
                <div className="border-t border-zinc-850 pt-6 mt-2 flex flex-col gap-4 bg-gold/5 p-4 rounded-xl border border-gold/15">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold animate-bounce" />
                    <span className="text-xs font-bold text-white">Bạn đang phân vân?</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                    Hãy hỏi Trợ lý ảo AI của Kassler để tìm được mẫu khóa thích hợp cho loại cửa nhà bạn ngay tức khắc.
                  </p>
                  <button
                    onClick={() => setIsChatbotOpen(true)}
                    className="w-full py-2 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md hover:brightness-105 active:scale-97 transition-all cursor-pointer"
                  >
                    Hỏi Trợ lý AI ngay
                  </button>
                </div>
              </aside>

              {/* B. PRODUCT GRID & SEARCH BAR */}
              <div className="lg:col-span-3 flex flex-col gap-8">
                
                {/* Real-time search bar & Sort indicators */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-luxury-dark border border-zinc-900 px-4 py-3 rounded-xl w-full justify-between">
                  <div className="text-xs text-zinc-400">
                    Hiển thị <strong className="text-gold font-bold">{filteredProducts.length}</strong> sản phẩm tương thích
                  </div>
                  
                  {searchQuery !== "" && (
                    <div className="text-xs text-zinc-500">
                      Kết quả cho từ khóa: <span className="text-white italic">"{searchQuery}"</span>
                    </div>
                  )}
                </div>

                {/* Main responsive grid display */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                      const isInWishlist = wishlist.includes(product.id);
                      const isComparing = compareList.some((p) => p.id === product.id);

                      return (
                        <div 
                          key={product.id}
                          className="glass-panel group relative rounded-2xl border border-gold/15 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full hover:shadow-2xl hover:shadow-gold/5"
                        >
                          
                          {/* Image box with premium indicators */}
                          <div className="relative h-56 bg-zinc-900/60 overflow-hidden flex items-center justify-center border-b border-zinc-900 group">
                            
                            {/* SVG Luxury Placeholder instead of missing JPGs */}
                            <div className="absolute inset-0 opacity-15 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${product.images[0]})` }} />
                            
                            {/* Interactive Lock Symbol overlay */}
                            <div className="relative w-16 h-16 rounded-full bg-luxury-black/70 border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors duration-300">
                              <Lock className="w-7 h-7 text-gold group-hover:scale-110 transition-transform" />
                            </div>

                            {/* Top left category badge */}
                            <span className="absolute top-4 left-4 px-2.5 py-1 bg-zinc-950/80 border border-gold/25 text-gold text-[9px] font-bold uppercase tracking-wider rounded-md">
                              {product.categoryName}
                            </span>

                            {/* Top right quick actions (Wishlist, Compare) */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className={`p-2 rounded-full border bg-zinc-950/80 hover:bg-gold/15 transition-all text-xs focus:outline-none ${
                                  isInWishlist ? "border-gold text-gold" : "border-zinc-800 text-zinc-500"
                                }`}
                                title={isInWishlist ? "Xóa khỏi mục yêu thích" : "Lưu vào mục yêu thích"}
                              >
                                <Star className={`w-3.5 h-3.5 ${isInWishlist ? "fill-gold" : ""}`} />
                              </button>

                              <button
                                onClick={() => {
                                  if (isComparing) {
                                    removeFromCompare(product.id);
                                  } else {
                                    addToCompare(product);
                                  }
                                }}
                                className={`p-2 rounded-full border bg-zinc-950/80 hover:bg-gold/15 transition-all text-xs focus:outline-none ${
                                  isComparing ? "border-gold text-gold" : "border-zinc-800 text-zinc-500"
                                }`}
                                title="So sánh sản phẩm"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isComparing ? "animate-spin-slow" : ""}`} />
                              </button>
                            </div>

                            {/* Highlight tech indicators at the bottom edge */}
                            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 overflow-hidden">
                              {product.technologies.slice(0, 2).map((tech, i) => (
                                <span key={i} className="px-2 py-0.5 bg-luxury-dark/95 text-zinc-400 border border-zinc-850 rounded text-[9px] font-light truncate">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Content descriptions info */}
                          <div className="p-5 flex flex-col flex-1 gap-3">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-bold text-gold tracking-widest font-mono">{product.code}</span>
                                <span className="text-[10px] text-zinc-500">Bảo hành {product.warranty} tháng</span>
                              </div>
                              <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                                {product.name}
                              </h4>
                            </div>

                            <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                              {product.shortDescription}
                            </p>

                            {/* Features list bullet points preview */}
                            <div className="flex flex-col gap-1 my-1">
                              {product.features.slice(0, 2).map((feat, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                  <CheckCircle className="w-3 h-3 text-gold shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </div>
                              ))}
                            </div>

                            {/* Estimated Price bracket */}
                            <div className="border-t border-zinc-900 pt-4 mt-auto flex items-center justify-between">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Tầm giá tham khảo:</span>
                                <span className="text-xs font-black text-white font-mono">{product.priceRange}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenAIChatContext(product)}
                                  className="p-2 border border-gold/30 hover:border-gold bg-transparent hover:bg-gold/5 rounded-lg text-gold"
                                  title="Tư vấn AI tức thì"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                
                                <Link
                                  href={`/products/${product.id}`}
                                  className="inline-flex items-center justify-center px-3.5 py-2 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-bold uppercase rounded-lg shadow shadow-gold/5 hover:brightness-105 transition-all"
                                >
                                  Chi tiết
                                </Link>
                              </div>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-luxury-dark border border-gold/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
                    <AlertTriangle className="w-12 h-12 text-gold animate-bounce" />
                    <div>
                      <h4 className="text-lg font-bold text-white">Không tìm thấy sản phẩm phù hợp</h4>
                      <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed font-light">
                        Vui lòng điều chỉnh lại bộ lọc tìm kiếm của bạn hoặc ấn nút dưới đây để khôi phục mặc định ban đầu.
                      </p>
                    </div>
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2.5 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-bold uppercase rounded-lg shadow-md mt-2"
                    >
                      Khôi phục mặc định
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>

        {/* 4. PRODUCT COMPARISON DRAWER MODULE (Extra Feature) */}
        {compareList.length > 0 && (
          <section id="compare-drawer" className="fixed bottom-0 left-0 w-full bg-luxury-dark border-t border-gold/30 shadow-2xl z-40 max-h-[85vh] overflow-y-auto backdrop-blur-xl animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              
              {/* Drawer Top Header Control */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-gold animate-spin-slow" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">So sánh chi tiết thiết bị ({compareList.length}/3)</h4>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearCompare}
                    className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 focus:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa so sánh
                  </button>
                  <button
                    onClick={clearCompare}
                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Side by side comparison grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {compareList.map((product) => (
                  <div key={product.id} className="bg-luxury-dark/90 border border-gold/15 p-5 rounded-xl flex flex-col relative">
                    
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-3 right-3 p-1 rounded-full bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors focus:outline-none"
                      title="Xóa sản phẩm khỏi so sánh"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-4">
                      <div className="w-12 h-12 bg-zinc-900 border border-gold/25 rounded flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-gold/60" />
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="text-xs font-bold text-white truncate">{product.name}</h5>
                        <span className="text-[10px] font-mono text-gold">{product.code}</span>
                      </div>
                    </div>

                    {/* Comparison Specifications Block */}
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Dòng sản phẩm:</span>
                        <span className="text-zinc-300 font-medium">{product.categoryName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Tầm giá tham khảo:</span>
                        <span className="text-gold font-bold font-mono">{product.priceRange}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Kích thước thân khóa:</span>
                        <span className="text-zinc-300">{product.specifications.dimensions}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Chất liệu đúc:</span>
                        <span className="text-zinc-300">{product.specifications.material}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Loại nguồn Pin:</span>
                        <span className="text-zinc-300">{product.specifications.battery}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Cách thức mở cửa:</span>
                        <span className="text-zinc-300 flex flex-wrap gap-1 mt-1">
                          {product.specifications.openingMethods.map((m, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-850 text-[9px] rounded text-zinc-400">{m}</span>
                          ))}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Công nghệ tích hợp:</span>
                        <span className="text-zinc-300 flex flex-wrap gap-1 mt-1">
                          {product.technologies.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-gold/5 border border-gold/15 text-[9px] rounded text-gold">{t}</span>
                          ))}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Chế độ bảo hành:</span>
                        <span className="text-emerald-400 font-semibold">{product.warranty} tháng chính hãng</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-900 flex gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 text-center py-2 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-bold uppercase rounded-lg shadow-md"
                      >
                        Chi tiết sản phẩm
                      </Link>
                      <button
                        onClick={() => handleOpenAIChatContext(product)}
                        className="px-3 border border-gold/30 hover:border-gold text-gold rounded-lg hover:bg-gold/5 transition-all"
                        title="Hỏi AI mẫu khóa này"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* 5. INSTALLATION SHOWCASE GALLERY (Extra Feature) */}
        <section className="py-24 bg-zinc-950 border-y border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest mb-3">HÌNH ẢNH THỰC TẾ</h2>
              <h3 className="text-3xl font-extrabold text-white tracking-wide">
                Dự Án Lắp Đặt Hoàn Thiện Thực Tế
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-3 font-light leading-relaxed">
                Được lắp đặt hoàn thiện bởi đội ngũ kỹ thuật viên lành nghề của Kassler Việt Nam tại các căn biệt thự, chung cư và nhà phố cao cấp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GALLERY_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxImage(img)}
                  className="group relative h-72 rounded-2xl border border-gold/15 overflow-hidden cursor-pointer shadow-lg hover:shadow-gold/5 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108" style={{ backgroundImage: `url(${img.url})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  {/* Zoom glass overlay icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center backdrop-blur-sm">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gold tracking-widest font-mono uppercase">Kassler Project 0{idx + 1}</span>
                    <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1">{img.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CUSTOMER TESTIMONIALS SLIDER SECTION */}
        <section id="testimonials" className="py-24 bg-luxury-black relative overflow-hidden">
          {/* Subtle light sphere vector */}
          <div className="absolute top-[50%] right-[-10%] w-[40%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest mb-3">Ý KIẾN KHÁCH HÀNG</h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">Khách Hàng Nói Gề Về Chúng Tôi</h3>
            </div>

            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-gold/10 relative shadow-2xl">
              <div className="absolute -top-6 left-12 w-12 h-12 rounded-full bg-gold flex items-center justify-center text-[#050505] font-black text-3xl font-serif">“</div>
              
              {/* Slider content wrapper */}
              <div className="flex flex-col items-center text-center gap-6 animate-fadeIn">
                <p className="text-sm sm:text-base text-zinc-300 italic leading-relaxed font-light">
                  {testimonials[activeTestimonial].review}
                </p>

                {/* Rating Gold Stars */}
                <div className="flex gap-1">
                  {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="w-12 h-12 rounded-full border border-gold/20 overflow-hidden relative shrink-0">
                    <img 
                      src={testimonials[activeTestimonial].avatar} 
                      alt={testimonials[activeTestimonial].name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white">{testimonials[activeTestimonial].name}</h4>
                    <span className="text-[11px] text-gold font-light">{testimonials[activeTestimonial].title}</span>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-350 focus:outline-none ${
                      activeTestimonial === idx ? "bg-gold w-6" : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 7. FAQ ACCORDION SECTION */}
        <section id="faq" className="py-24 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold text-gold uppercase tracking-widest mb-3">HỎI ĐÁP KỸ THUẬT</h2>
              <h3 className="text-3xl font-extrabold text-white tracking-wide">Những Câu Hỏi Thường Gặp</h3>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  q: "Cửa nhôm Xingfa có lắp được khóa vân tay Kassler không?",
                  a: "Lắp đặt hoàn toàn tốt. Kassler đã nghiên cứu và phát triển dòng khóa chuyên biệt Kassler KL-660 Slim Plus sở hữu thân khóa siêu hẹp chỉ rộng 38mm chuyên dụng cho các đố cửa nhỏ như nhôm Xingfa, nhựa lõi thép. Khóa tích hợp ruột khóa móc lùa chuyên biệt cho cửa lùa trượt hoặc chốt ngang cho cửa quay mở rộng."
                },
                {
                  q: "Khóa hết pin đột ngột mà chìa cơ không mang theo phải làm thế nào?",
                  a: "Trong trường hợp hết pin khẩn cấp khi đang ở ngoài cửa, tất cả các mẫu khóa thông minh Kassler đều thiết kế cổng tiếp nguồn khẩn cấp USB hoặc Type-C ở mặt trước phía đáy khóa. Bạn chỉ cần cắm nguồn điện tạm thời từ sạc dự phòng điện thoại di động để cung cấp điện tức thì cho khóa, sau đó thực hiện mở khóa bằng vân tay, thẻ từ hoặc mật mã như thường lệ rồi vào thay pin mới."
                },
                {
                  q: "Dữ liệu vân tay, mật mã của gia đình có bị lưu trữ trực tuyến không?",
                  a: "Tuyệt đối an toàn. Mọi dữ liệu sinh trắc học vân tay, mật mã, Face ID đều được mã hóa bằng chip bảo mật chuẩn ngân hàng đặt trực tiếp trên bo mạch cục bộ của khóa. Ứng dụng điện thoại chỉ nhận các mã lệnh truy cập đóng/mở được mã hóa ngẫu nhiên và thông báo nhật ký truy xuất. Không có bất kỳ dữ liệu hình ảnh khuôn mặt hay dấu vân tay thô nào truyền tải qua internet để tránh bị tấn công mạng."
                },
                {
                  q: "Quy trình khảo sát, giao hàng và lắp đặt được tiến hành ra sao?",
                  a: "Khi bạn để lại thông tin tư vấn, nhân viên kỹ thuật của Kassler sẽ liên hệ kiểm tra chất liệu và đo đạc đố cửa nhà bạn (độ dày, độ rộng) trực tuyến hoặc khảo sát trực tiếp tại công trình. Sau khi xác nhận mẫu khóa phù hợp, kỹ thuật viên sẽ mang máy móc đến vận chuyển và lắp đặt hoàn thiện miễn phí ngay tại nhà bạn trong vòng 2-4 giờ (Áp dụng tại nội thành Hà Nội và TP.HCM). Các tỉnh thành khác sẽ có chi nhánh liên kết hỗ trợ lắp trọn gói."
                }
              ].map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div 
                    key={i}
                    className="bg-luxury-dark border border-gold/15 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-sm sm:text-base text-white hover:text-gold transition-colors focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-gold shrink-0 transition-transform duration-350 ${isOpen ? "rotate-90" : ""}`} />
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-zinc-900/60 text-xs sm:text-sm text-zinc-400 leading-relaxed font-light animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. CONTACT FORM SECTION */}
        <section id="contact" className="py-24 bg-luxury-black relative z-10 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column Text details */}
              <div className="flex flex-col gap-6">
                <h2 className="text-xs font-bold text-gold uppercase tracking-widest">LIÊN HỆ TƯ VẤN</h2>
                <h3 className="text-3xl font-extrabold text-white tracking-wide leading-tight">
                  Khảo Sát Lắp Đặt & Nhận Báo Giá Chiết Khấu Ưu Đãi
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Hãy điền đầy đủ thông tin vào mẫu khảo sát bên cạnh. Đội ngũ chuyên gia kỹ thuật của Kassler Việt Nam sẽ liên hệ ngay trong vòng 15 phút để tư vấn các thông số cửa phù hợp và gửi bảng giá chiết khấu dự án ưu đãi tốt nhất cho bạn.
                </p>

                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Tổng đài giải đáp kỹ thuật:</span>
                      <strong className="text-white text-sm">1900 8888 (Phím số 2)</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Chính sách đặc biệt:</span>
                      <strong className="text-white text-sm">Khảo sát & Lắp đặt miễn phí trọn gói nội thành</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Glassmorphism contact form */}
              <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-gold/15 shadow-2xl relative">
                {leadSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-4 animate-fadeIn">
                    <CheckCircle className="w-16 h-16 text-gold animate-bounce" />
                    <div>
                      <h4 className="text-xl font-bold text-white">Gửi Thông Tin Thành Công!</h4>
                      <p className="text-xs text-zinc-400 max-w-xs mt-2 leading-relaxed font-light">
                        Cảm ơn bạn đã quan tâm đến Kassler. Chuyên viên tư vấn kỹ thuật sẽ gọi lại ngay cho bạn qua số điện thoại đã đăng ký để hoàn tất khảo sát lắp đặt.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="flex flex-col gap-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Họ và tên *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.name}
                          onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          placeholder="Ví dụ: 0988888888"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Địa chỉ Email</label>
                        <input
                          type="email"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="Ví dụ: email@gmail.com"
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Sản phẩm quan tâm</label>
                        <select
                          value={leadForm.product}
                          onChange={(e) => setLeadForm({ ...leadForm, product: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-xl text-xs text-zinc-400 focus:outline-none"
                        >
                          <option value="">Chọn sản phẩm (Nếu có)</option>
                          {PRODUCTS.map(p => (
                            <option key={p.id} value={p.code}>{p.code} - {p.categoryName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Yêu cầu khảo sát hoặc lời nhắn</label>
                      <textarea
                        rows={4}
                        value={leadForm.message}
                        onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                        placeholder="Hãy ghi chi tiết chất liệu cửa của bạn (Cửa gỗ đố hẹp, cửa cổng ngoài trời,...) để nhân viên tư vấn mang đúng ruột khóa tương ứng nhé."
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-gold/10 hover:shadow-gold/25 hover:brightness-105 active:scale-98 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Đăng ký tư vấn miễn phí
                    </button>

                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Lightbox zoom modal for installation gallery */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="max-w-4xl w-full flex flex-col gap-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()} // stops bubble up to close parent
          >
            <div className="relative w-full h-[60vh] rounded-2xl overflow-hidden border border-gold/30 bg-zinc-950 flex items-center justify-center">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.title}
                className="max-h-full max-w-full object-contain" 
              />
            </div>
            <p className="text-sm font-semibold text-gold text-center">{lightboxImage.title}</p>
          </div>
        </div>
      )}

      <Footer />
      <SocialFloating />
      {/* <AIChatbot /> */}
    </>
  );
}
