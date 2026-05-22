"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Mail, MapPin, Clock, Send, CheckCircle2, ChevronRight 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloating from "@/components/SocialFloating";
import AIChatbot from "@/components/AIChatbot";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "survey";
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: initialService,
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập họ tên và số điện thoại liên hệ!");
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "survey",
        message: ""
      });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      {/* Showroom Addresses and Direct Lines */}
      <div className="lg:col-span-5 space-y-8">
        <div>
          <h2 className="font-serif text-3xl font-light text-graphite dark:text-warm-light mb-4 leading-tight">
            Kết nối với hệ thống <br />
            <span className="text-lime font-bold">TA HOUSE</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
            Hãy liên hệ hoặc ghé thăm trực tiếp các showroom của chúng tôi để được tư vấn thiết kế, trải nghiệm các sản phẩm bếp thông minh và khóa điện tử cao cấp nhất.
          </p>
        </div>

        <div className="space-y-6">
          {/* Hanoi Showroom */}
          <div className="p-6 bg-warm-cream/30 dark:bg-graphite/40 border border-graphite/5 dark:border-warm-light/5 rounded-2xl transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-lime/10 text-lime rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold text-graphite dark:text-warm-light text-sm uppercase tracking-wider mb-1">
                  Showroom Hà Nội
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-2">
                  Biệt thự B9-06, KĐT Vinhomes Gardenia, Hàm Nghi, Nam Từ Liêm, Hà Nội.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-lime font-bold">
                  <Clock size={13} />
                  <span>08:00 - 21:00 (Hàng ngày)</span>
                </div>
              </div>
            </div>
          </div>

          {/* HCMC Showroom */}
          <div className="p-6 bg-warm-cream/30 dark:bg-graphite/40 border border-graphite/5 dark:border-warm-light/5 rounded-2xl transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-lime/10 text-lime rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold text-graphite dark:text-warm-light text-sm uppercase tracking-wider mb-1">
                  Showroom TP. Hồ Chí Minh
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-2">
                  Số 18, Đường số 4, KĐT Him Lam, Tân Hưng, Quận 7, TP. Hồ Chí Minh.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-lime font-bold">
                  <Clock size={13} />
                  <span>08:00 - 21:00 (Hàng ngày)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hotline & Email info */}
          <div className="p-6 bg-warm-cream/30 dark:bg-graphite/40 border border-graphite/5 dark:border-warm-light/5 rounded-2xl transition-colors space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-lime/10 text-lime rounded-xl flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Hotline Tổng Đài</span>
                <a href="tel:19008899" className="text-base font-black text-graphite dark:text-warm-light hover:text-lime">
                  1900 8899
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-lime/10 text-lime rounded-xl flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Hòm Thư Hỗ Trợ</span>
                <a href="mailto:info@tahouse.vn" className="text-xs font-bold text-graphite dark:text-warm-light hover:text-lime">
                  info@tahouse.vn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded styled map frame */}
        <div className="rounded-2xl overflow-hidden border border-graphite/5 dark:border-warm-light/5 shadow-md aspect-video">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863938459424!2d105.76288677602058!3d21.03812978061352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b616428731%3A0xe54d923bcbc565f1!2sVinhomes%20Gardenia!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn" 
            className="w-full h-full border-0 grayscale dark:invert dark:opacity-80" 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Custom Inquiry Form Column */}
      <div className="lg:col-span-7">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-graphite/5 dark:border-warm-light/5 relative overflow-hidden bg-warm-cream/50 dark:bg-graphite/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-lime/5 rounded-full blur-2xl" />
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="border-b border-graphite/5 dark:border-warm-light/5 pb-4 mb-6">
                  <h3 className="font-serif text-xl text-graphite dark:text-warm-light mb-1">
                    Gửi yêu cầu khảo sát & tư vấn
                  </h3>
                  <p className="text-xs text-zinc-500 font-semibold">
                    Chúng tôi cam kết bảo mật thông tin và phản hồi ngay trong vòng 15 phút.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Họ & Tên *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A" 
                      className="bg-warm-cream/50 dark:bg-graphite border border-graphite/10 dark:border-warm-light/10 focus:border-lime rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Số điện thoại *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09xx xxx xxx" 
                      className="bg-warm-cream/50 dark:bg-graphite border border-graphite/10 dark:border-warm-light/10 focus:border-lime rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nguyenvana@gmail.com" 
                    className="bg-warm-cream/50 dark:bg-graphite border border-graphite/10 dark:border-warm-light/10 focus:border-lime rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors"
                  />
                </div>

                {/* Service Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dịch vụ yêu cầu</label>
                  <select 
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="bg-warm-cream/50 dark:bg-graphite border border-graphite/10 dark:border-warm-light/10 focus:border-lime rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="survey">Đăng ký khảo sát lắp đặt tận nhà (Miễn phí)</option>
                    <option value="lock">Tư vấn chọn mua Khóa thông minh TAHOUSE</option>
                    <option value="kitchen">Tư vấn thiết kế Thiết bị nhà bếp thông minh</option>
                    <option value="warranty">Yêu cầu bảo hành & sửa chữa sản phẩm</option>
                  </select>
                </div>

                {/* Message field */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nội dung tin nhắn / Yêu cầu chi tiết</label>
                  <textarea 
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Quý khách vui lòng cung cấp kích thước cửa hoặc nhu cầu chi tiết để TA HOUSE chuẩn bị mẫu tư vấn tốt nhất..."
                    className="bg-warm-cream/50 dark:bg-graphite border border-graphite/10 dark:border-warm-light/10 focus:border-lime rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-lime text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-lime-light transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý yêu cầu...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Gửi yêu cầu tư vấn
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-lime/10 text-lime rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif text-2xl font-light text-graphite dark:text-warm-light mb-3">
                  Gửi yêu cầu thành công!
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-8 font-semibold">
                  Cảm ơn bạn đã tin tưởng TA HOUSE. Chuyên viên kỹ thuật/tư vấn thiết kế của chúng tôi sẽ liên hệ trực tiếp cho bạn qua số điện thoại trong vòng 15 phút.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="border border-graphite/10 dark:border-warm-light/10 text-graphite dark:text-warm-light px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-graphite/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Gửi yêu cầu mới
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-warm-light dark:bg-graphite-dark text-graphite dark:text-warm-light transition-colors duration-500 min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner Section */}
      <section className="pt-36 pb-20 relative border-b border-graphite/5 dark:border-warm-light/5">
        <div className="absolute inset-0 bg-warm-cream/20 dark:bg-graphite/10 -z-10" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-6">
            <Link href="/" className="hover:text-lime">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-graphite dark:text-warm-light">Liên hệ</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-light text-graphite dark:text-warm-light mb-4 tracking-tight leading-tight">
            Liên hệ tư vấn
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium max-w-xl">
            Đặt lịch khảo sát công trình miễn phí tận nơi hoặc nhận tư vấn chi tiết từ các chuyên gia thiết bị nhà bếp và khóa cửa thông minh cao cấp.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 flex-grow">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Suspense fallback={
            <div className="py-32 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Đang tải biểu mẫu...</span>
            </div>
          }>
            <ContactFormContent />
          </Suspense>
        </div>
      </section>

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
