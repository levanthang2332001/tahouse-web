import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-[#1a1a1a]">
      <Header />
      <section className="relative border-b border-black/5 pb-20 pt-36">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:text-lime">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-[#1a1a1a]">Liên hệ</span>
          </div>
          <h1 className="mb-4 font-serif text-4xl font-light leading-tight tracking-tight sm:text-5xl">
            Liên hệ tư vấn
          </h1>
          <p className="max-w-xl text-xs font-medium text-zinc-500 sm:text-sm">
            Đặt lịch khảo sát công trình miễn phí tận nơi hoặc nhận tư vấn chi tiết từ chuyên gia TA HOUSE.
          </p>
        </div>
      </section>
      <section className="flex-grow py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-lime" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Địa chỉ</h2>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              961A Kha Vạn Cân, P. Linh Xuân,
              <br />
              TP. Thủ Đức, TP. HCM
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Phone className="h-5 w-5 text-lime" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Hotline</h2>
            </div>
            <a href="tel:19008899" className="text-lg font-black text-[#1a1a1a] hover:text-lime">
              1900 8899
            </a>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-lime" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Email</h2>
            </div>
            <a href="mailto:info@tahouse.vn" className="text-sm font-bold text-[#1a1a1a] hover:text-lime">
              info@tahouse.vn
            </a>
          </div>
        </div>
      </section>
      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
