"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Lock, Star, Sparkles, Phone, MessageSquare, Shield, CheckCircle,
  ChevronRight, Bookmark, ArrowRight, Settings, Info, BookOpen, AlertCircle
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, Product } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloating from "@/components/SocialFloating";
// import AIChatbot from "@/components/AIChatbot";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const { 
    wishlist, 
    toggleWishlist, 
    recentlyViewed, 
    addToRecentlyViewed, 
    addToCompare, 
    compareList,
    setIsChatbotOpen,
    setChatbotProductContext
  } = useApp();

  // Find product in database
  const product = PRODUCTS.find((p) => p.id === productId);

  // States
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "guide" | "faq">("specs");
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZoomed, setIsZoomed] = useState(false);

  // Load product & recently viewed triggers
  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      addToRecentlyViewed(product.id);
    }
  }, [product, productId]);

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-1 py-32 flex flex-col items-center justify-center text-center px-4 bg-luxury-black min-h-[70vh]">
          <AlertCircle className="w-16 h-16 text-gold animate-pulse mb-6" />
          <h1 className="text-2xl font-extrabold text-white mb-2">Sản Phẩm Không Tồn Tại</h1>
          <p className="text-xs text-zinc-400 max-w-sm mb-8 leading-relaxed">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống Kassler.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-black uppercase rounded-lg shadow-lg"
          >
            Quay về trang chủ
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const isInWishlist = wishlist.includes(product.id);
  const isComparing = compareList.some((p) => p.id === product.id);

  // Magnifying Zoom Effect on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
    setIsZoomed(false);
  };

  // Recommendations: Other products in same category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // Recently Viewed Details mapped to actual Product definitions
  const recentlyViewedProducts = recentlyViewed
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined && p.id !== product.id)
    .slice(0, 4);

  const handleOpenAIChatContext = () => {
    setChatbotProductContext(product);
    setIsChatbotOpen(true);
  };

  return (
    <>
      <Header />

      <main className="flex-1 pt-24 pb-20 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 border-b border-zinc-900 pb-4">
            <Link href="/" className="hover:text-gold transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/" className="hover:text-gold transition-colors">Sản phẩm</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-300 font-medium truncate">{product.name}</span>
          </nav>

          {/* Product Showcase Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* COLUMN 1: IMAGE GALLERY WITH ZOOM LENS */}
            <div className="flex flex-col gap-4">
              
              {/* Primary Image Viewer */}
              <div 
                className="relative h-[320px] sm:h-[450px] bg-zinc-900/60 border border-gold/15 rounded-2xl overflow-hidden flex items-center justify-center cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={handleMouseLeave}
              >
                {/* SVG Visual Background overlay */}
                <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${selectedImage})` }} />
                
                {/* Actual Product Display */}
                <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-luxury-black/80 border border-gold/20 flex items-center justify-center transition-all duration-300">
                  <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-gold" style={isZoomed ? zoomStyle : {}} />
                </div>

                <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/80 border border-gold/25 text-gold text-[10px] font-bold uppercase tracking-wider rounded-md">
                  {product.categoryName}
                </div>

                <div className="absolute bottom-4 right-4 text-zinc-500 text-xxs flex items-center gap-1.5 bg-luxury-black/85 px-3 py-1.5 rounded-lg border border-zinc-900">
                  <Info className="w-3.5 h-3.5" /> Di chuột để phóng to 2X
                </div>
              </div>

              {/* Thumbnails Navigation Row */}
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`h-20 bg-zinc-900/40 border rounded-xl flex items-center justify-center transition-all overflow-hidden relative ${
                      selectedImage === img ? "border-gold bg-zinc-900" : "border-zinc-800 hover:border-gold/30"
                    }`}
                  >
                    <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                    <Lock className={`w-6 h-6 ${selectedImage === img ? "text-gold" : "text-zinc-600"}`} />
                  </button>
                ))}
                {/* Simple fallback thumbnails to complete grid of 4 */}
                {[...Array(Math.max(0, 4 - product.images.length))].map((_, i) => (
                  <button
                    key={i}
                    disabled
                    className="h-20 bg-zinc-950 border border-zinc-900/50 rounded-xl flex items-center justify-center text-zinc-800"
                  >
                    <Lock className="w-5 h-5 opacity-20" />
                  </button>
                ))}
              </div>

            </div>

            {/* COLUMN 2: PRODUCT SPECIFIC INFO BRACKET */}
            <div className="flex flex-col gap-6">
              
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold text-xxs font-bold uppercase rounded-md font-mono">{product.code}</span>
                  <span className="text-zinc-500 text-xs flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-500" /> Hàng chính hãng
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Estimate Price Bracket */}
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Tầm giá khảo sát & lắp trọn gói:</span>
                  <strong className="text-xl sm:text-2xl font-black text-white font-mono">{product.priceRange}</strong>
                </div>
                <span className="text-xxs text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded">
                  Bảo hành {product.warranty} tháng
                </span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Technologies Pill Badges */}
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5">Công nghệ tích hợp cao cấp:</span>
                <div className="flex flex-wrap gap-2">
                  {product.technologies.map((tech, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 bg-gold/5 border border-gold/20 text-gold text-xs font-semibold rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color selectors */}
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Tùy chọn màu sắc thiết kế:</span>
                <div className="flex items-center gap-4">
                  {product.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-3.5 h-3.5 rounded-full bg-gold border border-white/20 shadow" />
                      <span>{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Actions Bar */}
              <div className="border-y border-zinc-900 py-6 my-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <button
                  onClick={handleOpenAIChatContext}
                  className="flex flex-col items-center justify-center p-3 bg-gold/5 border border-gold/25 hover:border-gold rounded-xl text-center gap-1.5 transition-all group cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-gold group-hover:scale-110 transition-transform animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Tư vấn AI</span>
                </button>

                <a
                  href="tel:19008888"
                  className="flex flex-col items-center justify-center p-3 bg-zinc-900 border border-zinc-800 hover:border-gold/30 rounded-xl text-center gap-1.5 transition-all group"
                >
                  <Phone className="w-5 h-5 text-zinc-400 group-hover:text-gold transition-colors" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Gọi điện hotline</span>
                </a>

                <a
                  href="https://zalo.me/0988888888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 bg-zinc-900 border border-zinc-800 hover:border-gold/30 rounded-xl text-center gap-1.5 transition-all group"
                >
                  <MessageSquare className="w-5 h-5 text-zinc-400 group-hover:text-gold transition-colors" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Chat Zalo</span>
                </a>

                <button
                  onClick={() => {
                    if (isComparing) {
                      router.push("/");
                    } else {
                      addToCompare(product);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl text-center gap-1.5 transition-all focus:outline-none ${
                    isComparing 
                      ? "border-gold bg-gold/5 text-gold" 
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-gold/30"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isComparing ? "fill-gold" : ""}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isComparing ? "Xem So sánh" : "Lưu So sánh"}
                  </span>
                </button>

              </div>

            </div>

          </div>

          {/* Tabbed technical details & guide sheets */}
          <div className="border-t border-zinc-900 pt-16 mb-20">
            
            {/* Tabs List */}
            <div className="flex border-b border-zinc-900 overflow-x-auto whitespace-nowrap scrollbar-none gap-8 mb-8 shrink-0">
              {[
                { key: "specs", label: "Thông số kỹ thuật", icon: <Settings className="w-4 h-4" /> },
                { key: "features", label: "Tính năng chi tiết", icon: <CheckCircle className="w-4 h-4" /> },
                { key: "guide", label: "Hướng dẫn lắp đặt", icon: <BookOpen className="w-4 h-4" /> },
                { key: "faq", label: "Câu hỏi thường gặp FAQs", icon: <Info className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all focus:outline-none shrink-0 ${
                    activeTab === tab.key 
                      ? "border-gold text-gold" 
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels Contents */}
            <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-zinc-900/60 min-h-[250px] animate-fadeIn">
              
              {/* Specs tab */}
              {activeTab === "specs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-zinc-900">
                      <span className="text-zinc-500 font-medium">Kích thước sản phẩm</span>
                      <span className="text-white font-semibold text-right">{product.specifications.dimensions}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-900">
                      <span className="text-zinc-500 font-medium">Chất liệu chế tạo</span>
                      <span className="text-white font-semibold text-right">{product.specifications.material}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-900">
                      <span className="text-zinc-500 font-medium">Nguồn điện sử dụng</span>
                      <span className="text-white font-semibold text-right">{product.specifications.battery}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-zinc-900">
                      <span className="text-zinc-500 font-medium">Phương thức mở cửa</span>
                      <span className="text-gold font-bold text-right">{product.specifications.openingMethods.join(", ")}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-900">
                      <span className="text-zinc-500 font-medium">Cơ chế chốt khóa</span>
                      <span className="text-white font-semibold text-right">{product.specifications.lockingMechanism}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-900">
                      <span className="text-zinc-500 font-medium">Bảo hành chính hãng</span>
                      <span className="text-emerald-400 font-semibold text-right">{product.warranty} tháng (Nhà sản xuất)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features tab */}
              {activeTab === "features" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  {product.features.map((feat, i) => (
                    <div key={i} className="flex gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-900/60 leading-relaxed">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block mb-1">Tính năng ưu việt 0{i + 1}</strong>
                        <span className="text-zinc-400 font-light">{feat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Installation Guide tab */}
              {activeTab === "guide" && (
                <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
                    <Settings className="w-5 h-5 text-gold animate-spin-slow" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Các bước lắp ráp chuẩn hóa kỹ thuật</h4>
                  </div>
                  <ol className="list-decimal pl-5 space-y-3 font-light">
                    {product.installationManual.map((step, i) => (
                      <li key={i} className="pl-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 p-4 rounded-xl bg-gold/5 border border-gold/15 flex items-start gap-3">
                    <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 leading-normal">
                      <strong>Lưu ý quan trọng:</strong> Quy trình khoan đục đố cửa yêu cầu máy đục chuyên dụng độ chính xác cao. Chúng tôi khuyến nghị quý khách sử dụng dịch vụ lắp ráp miễn phí của Kassler để tránh hư hại thẩm mỹ của thớ cửa gỗ/nhôm kính.
                    </p>
                  </div>
                </div>
              )}

              {/* Product specific FAQ tab */}
              {activeTab === "faq" && (
                <div className="space-y-6 text-sm">
                  {product.faq.map((fq, i) => (
                    <div key={i} className="border-b border-zinc-900/65 pb-6 last:border-0 last:pb-0">
                      <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        {fq.question}
                      </h4>
                      <p className="text-zinc-400 font-light pl-3.5 leading-relaxed">{fq.answer}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* Related Products display */}
          {relatedProducts.length > 0 && (
            <section className="mb-20">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sản phẩm cùng phân khúc</h3>
                <Link href="/" className="text-xs text-gold font-bold flex items-center gap-1 hover:underline">
                  Xem thêm <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <Link 
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="glass-panel group rounded-xl border border-zinc-900 p-4 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-40 bg-zinc-900/80 rounded-lg flex items-center justify-center border border-zinc-900 overflow-hidden mb-4">
                      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${p.images[0]})` }} />
                      <Lock className="w-7 h-7 text-gold/60 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-gold block mb-1">{p.code}</span>
                    <h4 className="text-xs font-bold text-white group-hover:text-gold transition-colors truncate">{p.name}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-2">{p.priceRange}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recently Viewed Carousel display */}
          {recentlyViewedProducts.length > 0 && (
            <section>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sản phẩm bạn vừa xem</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyViewedProducts.map((p) => (
                  <Link 
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="glass-panel group rounded-xl border border-zinc-900 p-4 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-40 bg-zinc-900/80 rounded-lg flex items-center justify-center border border-zinc-900 overflow-hidden mb-4">
                      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${p.images[0]})` }} />
                      <Lock className="w-7 h-7 text-gold/60 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-gold block mb-1">{p.code}</span>
                    <h4 className="text-xs font-bold text-white group-hover:text-gold transition-colors truncate">{p.name}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-2">{p.priceRange}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
      <SocialFloating />
      {/* <AIChatbot /> */}
    </>
  );
}
