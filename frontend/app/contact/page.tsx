import Link from "next/link";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import { COMPANY_LEGAL } from "@/data/company-legal";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral text-navy">
      <Header />
      <section className="relative border-b border-gray-light/35 pb-8 pt-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-navy/60">
            <Link href="/" className="hover:text-brand-green">
              Trang chủ
            </Link>
            <ChevronRight size={12} />
            <span className="font-bold text-navy">Liên hệ</span>
          </div>
          <h1 className="mb-3 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Liên hệ tư vấn
          </h1>
          <p className="max-w-xl text-xs font-bold text-navy/70 sm:text-sm">
            Đặt lịch khảo sát công trình miễn phí tận nơi hoặc nhận tư vấn chi tiết từ chuyên gia{" "}
            {COMPANY_LEGAL.tradeName}.
          </p>
        </div>
      </section>
      <section className="flex-grow py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-gray-light bg-cream p-6">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-brand-green" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navy">Địa chỉ</h2>
            </div>
            <p className="text-sm font-bold leading-relaxed text-navy/70">
              {COMPANY_LEGAL.address}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-light bg-cream p-6">
            <div className="mb-4 flex items-center gap-3">
              <Phone className="h-5 w-5 text-brand-green" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navy">Hotline</h2>
            </div>
            <a
              href={`tel:${COMPANY_LEGAL.phoneTel}`}
              className="text-lg font-black text-navy transition-colors hover:text-brand-green"
            >
              {COMPANY_LEGAL.phone}
            </a>
            <p className="mt-2 text-xs font-semibold text-navy/55">
              Giờ làm việc: {COMPANY_LEGAL.workingHours}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-light bg-cream p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-brand-green" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-navy">Email</h2>
            </div>
            <a
              href={`mailto:${COMPANY_LEGAL.email}`}
              className="text-sm font-bold text-navy transition-colors hover:text-brand-green"
            >
              {COMPANY_LEGAL.email}
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
