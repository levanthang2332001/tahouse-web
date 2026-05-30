"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  LayoutGrid,
  Leaf,
  Lock,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Utensils,
  Wrench,
} from "lucide-react";
import { GoGoal } from "react-icons/go";
import { GiAutoRepair } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import content from "@/data/content.json";

export default function Home() {
  const [activeBrand, setActiveBrand] = useState(0);
  const [activeSolution, setActiveSolution] = useState(0);

  const brands = [
    { name: "BOSCH", style: "font-sans font-bold tracking-tighter" },
    { name: "YALE", style: "font-serif italic tracking-wider" },
    { name: "HAFELE", style: "font-sans font-extrabold tracking-widest" },
    { name: "SAMSUNG", style: "font-sans font-semibold tracking-normal" },
    { name: "KAADAS", style: "font-sans font-black tracking-tight" },
    { name: "PHILIPS", style: "font-sans font-black tracking-wide" },
  ];

  const solutions = [
    {
      title: content.home.solutions.items[0].title,
      desc: content.home.solutions.items[0].desc,
      img: "/pic/khoa2.jpg",
      icon: ShieldCheck,
    },
    {
      title: content.home.solutions.items[1].title,
      desc: content.home.solutions.items[1].desc,
      img: "/pic/bep2.webp",
      icon: Utensils,
    },
  ];

  const services = [
    {
      title: "Khóa điện tử - khóa vân tay",
      desc: "+ 150 sản phẩm",
      catId: "lock-parent",
      icon: Lock,
      img: "/pic/khoa.jpg",
      imgClass: "object-contain bg-white p-3",
    },
    {
      title: "Két sắt thông minh",
      desc: "+ 150 sản phẩm",
      catId: "Smart",
      icon: Shield,
      img: "/pic/ket.webp",
      imgClass: "object-contain bg-white p-3",
    },
    {
      title: "Thiết bị bếp",
      desc: "+ 150 sản phẩm",
      catId: "Kitchen",
      icon: Flame,
      img: "/pic/bep.webp",
      imgClass: "object-cover",
    },
    {
      title: "Phụ kiện tủ bếp",
      desc: "+ 150 sản phẩm",
      catId: "Cabinet",
      icon: LayoutGrid,
      img: "/pic/phukienbep.webp",
      imgClass: "object-cover",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBrand((prev) => (prev + 1) % brands.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [brands.length]);

  return (
    <div className="min-h-screen bg-neutral text-navy antialiased selection:bg-brand-green selection:text-white">
      <Header />
      <section className="relative w-full bg-white overflow-hidden py-12 lg:py-20 flex items-center min-h-[550px] lg:min-h-[650px] border-b border-gray-light/35">
        {/* Right-aligned Background Image with elegant split fade */}
        <div className="absolute top-0 right-0 h-full w-full lg:w-1/2 z-0">
          <div className="relative h-full w-full">
            <Image
              src="/parner.png"
              alt="TA HOUSE Smart Kitchen Solutions"
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Smooth Fade Overlay to merge the image with the Warm White Cream background on the left */}
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white from-0% to-transparent to-25% z-10" />
          </div>
        </div>

        {/* Content Container (Left Aligned on desktop) */}
        <div className="relative z-20 mx-auto flex w-full max-w-[1440px] px-6 lg:px-12">
          <div className="max-w-2xl text-left bg-white/85 p-6 rounded-2xl backdrop-blur-xs lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {/* Subtitle Accent Champagne with line */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-[1.5px] w-8 bg-champagne" />
              <span className="text-xs font-bold uppercase tracking-widest text-champagne">
                SMART LIVING SOLUTIONS
              </span>
            </motion.div>

            {/* Title Primary Navy bold */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 font-sans text-3xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-navy lg:tracking-tighter"
            >
              Thiết bị phù hợp<br />cho từng gia đình
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 max-w-lg text-sm font-semibold leading-relaxed text-navy/80 md:text-base align-middle"
            >
              <img 
                src="/logoTAtitle1.svg" 
                alt="TA HOUSE" 
                className="inline-block h-3.5 md:h-[15px] w-auto align-middle mr-1 relative top-[2px]" 
              />{" "}
              chuyên tư vấn giải pháp thiết bị bếp, phụ kiện tủ bếp và khóa điện tử phù hợp với nhu cầu sử dụng thực tế.
            </motion.p>

            {/* Checklist items inline separated by dots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row sm:items-center gap-y-3.5 gap-x-6 mb-10 text-sm font-semibold text-navy"
            >
              <div className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 shadow-xs transition-transform duration-300 group-hover:scale-110">
                  <GoGoal size={16} />
                </div>
                <span className="tracking-wide">Chọn đúng</span>
              </div>
              <span className="hidden sm:inline text-navy/25">•</span>
              <div className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 shadow-xs transition-transform duration-300 group-hover:scale-110">
                  <GiAutoRepair size={16} />
                </div>
                <span className="tracking-wide">Lắp đúng</span>
              </div>
              <span className="hidden sm:inline text-navy/25">•</span>
              <div className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 shadow-xs transition-transform duration-300 group-hover:scale-110">
                  <MdOutlineSecurity size={16} />
                </div>
                <span className="tracking-wide">Sử dụng lâu dài</span>
              </div>
            </motion.div>

            {/* Buttons Pill shaped */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/products"
                className="flex items-center gap-2 bg-brand-green hover:bg-lime-dark px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-brand-green/20"
              >
                Tư vấn giải pháp
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="group flex items-center gap-2 bg-cream border border-gray-light hover:border-brand-green hover:text-brand-green px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-navy transition-all shadow-sm"
              >
                Xem sản phẩm
                <LayoutGrid className="h-4 w-4 text-navy/70 group-hover:text-brand-green transition-colors" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="w-full bg-cream py-16 border-y border-gray-light/35">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 md:grid-cols-4 md:gap-0"
        >
          {content.home.stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
              className="flex flex-col items-center px-4 text-center md:border-r border-gray-light/40 last:border-r-0"
            >
              <span className="mb-2 font-serif text-6xl md:text-7xl tracking-normal text-brand-green">
                {stat.value}
                <span className="text-4xl">{stat.suffix}</span>
              </span>
              <span className="mb-1 text-sm font-semibold text-navy">{stat.label}</span>
              <span className="text-xs text-navy/60">{stat.sublabel}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="categories" className="w-full bg-white py-12 lg:py-16">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-[1440px] px-6 lg:px-12 text-center"
        >
          {/* Left/Right Aligned Heading Layout */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
            className="flex flex-col md:flex-row md:items-end md:justify-between text-left mb-12 gap-6"
          >
            <div className="space-y-3 max-w-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-champagne">
                DỊCH VỤ CỦA CHÚNG TÔI
              </h3>
              <h2 className="font-sans text-3xl font-bold leading-tight text-navy md:text-4xl">
                Giải pháp toàn diện<br />cho không gian sống hiện đại
              </h2>
              <div className="h-[3px] w-12 bg-brand-green mt-4 rounded-full" />
            </div>
            <Link
              href="/products"
              className="group flex items-center gap-2 shrink-0 text-xs font-bold uppercase tracking-wider text-navy/70 hover:text-brand-green transition-colors pb-1"
            >
              {content.home.categories.viewAll}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* 4 columns layout with high-quality custom service cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  variants={{
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                  }}
                  className="rounded-2xl border border-gray-light bg-cream text-left shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-brand-green/30 transition-all duration-300 group overflow-hidden"
                >
                  <Link href={`/products?cat=${service.catId}`} className="block cursor-pointer flex-grow flex flex-col justify-between">
                    {/* Full-bleed Category Image at the top of the card */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral shadow-inner border-b border-gray-light/35">
                      <Image
                        src={service.img}
                        alt={service.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 25vw"
                        className={`${service.imgClass || "object-cover"} transition-transform duration-750 group-hover:scale-105`}
                      />
                    </div>
                    {/* Content wrapper with inner padding at the bottom */}
                    <div className="p-6 lg:p-7 pt-5">
                      <div className="flex items-center justify-between gap-4">
                        {/* Title and count on the left */}
                        <div className="flex-grow">
                          <h4 className="text-base lg:text-lg font-bold uppercase tracking-wide text-navy group-hover:text-brand-green transition-colors leading-tight min-h-[3rem] lg:min-h-[3.5rem] flex items-center">
                            {service.title}
                          </h4>
                          <p className="text-xs font-semibold text-navy/60 mt-2 leading-relaxed">
                            {service.desc}
                          </p>
                        </div>
                        {/* Circular arrow icon on the right */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-green/20 bg-brand-green/5 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="relative w-full overflow-hidden bg-navy py-12 select-none">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 text-left md:flex-row lg:px-12">
          <div className="relative z-10 flex w-full items-center justify-between md:block md:w-1/4">
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-green">
                {content.home.partners.prefix}
              </h3>
              <h2 className="text-base font-semibold uppercase tracking-wide text-cream">
                {content.home.partners.title}
              </h2>
            </div>
            <button onClick={() => setActiveBrand((prev) => (prev + 1) % brands.length)} className="text-gray-400 transition-colors hover:text-white md:hidden">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          <div className="flex w-full items-center justify-between gap-8 opacity-70 md:w-3/4">
            <button onClick={() => setActiveBrand((prev) => (prev - 1 + brands.length) % brands.length)} className="hidden shrink-0 cursor-pointer text-gray-500 transition-colors hover:text-white md:block">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="relative flex-1 overflow-hidden py-1">
              <div className="flex w-full items-center justify-around gap-4">
                {brands.map((brand, idx) => (
                  <span
                    key={brand.name}
                    className={`whitespace-nowrap text-cream transition-all duration-500 ${brand.style} ${activeBrand === idx ? "scale-110 text-brand-green opacity-100 font-bold" : "opacity-40 hover:opacity-100"}`}
                  >
                    {brand.name}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveBrand((prev) => (prev + 1) % brands.length)} className="hidden shrink-0 cursor-pointer text-gray-500 transition-colors hover:text-white md:block">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      <section id="solutions" className="w-full overflow-hidden bg-neutral py-20 lg:py-28">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 px-6 lg:flex-row lg:gap-24 lg:px-12"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
            }}
            className="text-left lg:w-1/3"
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-green">
              {content.home.solutions.prefix}
            </h3>
            <h2 className="mb-6 whitespace-pre-line font-serif text-4xl leading-tight text-navy lg:text-5xl">
              {content.home.solutions.title}
            </h2>
            <p className="mb-10 text-base leading-relaxed text-navy/70">
              {content.home.solutions.items[activeSolution].desc}
            </p>
            <Link href="#contact" className="inline-flex items-center gap-4 border border-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-navy transition-all hover:bg-navy hover:text-cream">
              {content.home.solutions.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
            }}
            className="relative h-[400px] w-full lg:h-[600px] lg:w-2/3"
          >
            {/* Smooth rounded image wrapper with clip to prevent cutting of the terracotta card */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSolution}
                  src={solutions[activeSolution].img}
                  alt={solutions[activeSolution].title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 z-10 w-[85%] max-w-[340px] rounded-2xl bg-[#A14833] p-8 text-left text-white shadow-xl sm:w-[80%] lg:-left-[170px] lg:bottom-12 border border-white/10 transition-all duration-300">
              <div className="mb-6 flex items-start gap-4">
                {(() => {
                  const Icon = solutions[activeSolution].icon;
                  return <Icon className="h-8 w-8 shrink-0 opacity-90 text-white" />;
                })()}
                <p className="text-sm font-bold leading-snug">{solutions[activeSolution].title}</p>
              </div>
              <Link href="/products" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white transition-colors">
                Xem chi tiết
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="absolute bottom-6 right-6 z-10 flex gap-3">
              <button onClick={() => setActiveSolution((prev) => (prev - 1 + solutions.length) % solutions.length)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition-colors hover:bg-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setActiveSolution((prev) => (prev + 1) % solutions.length)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm transition-colors hover:bg-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section id="news" className="w-full bg-cream py-20 lg:py-28 border-t border-gray-light/35">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-[1440px] px-6 lg:px-12"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
            className="mb-12 flex flex-col justify-between gap-6 text-left md:flex-row md:items-end"
          >
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-green">
                {content.home.news.prefix}
              </h3>
            </div>
            <Link href="#categories" className="flex items-center gap-2 text-xs font-semibold text-navy/70 transition-colors hover:text-brand-green">
              {content.home.news.viewAll}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.home.news.articles.map((article, idx) => {
              const img = [
                "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80",
              ][idx];

              return (
                <motion.article
                  key={article.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                  }}
                  className="group flex cursor-pointer flex-col gap-6 text-left sm:flex-row"
                >
                  <div className="relative aspect-video shrink-0 overflow-hidden rounded-sm bg-gray-200 shadow-xs sm:w-1/2 sm:aspect-square">
                    <Image
                      src={img}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-2 sm:w-1/2">
                    <div>
                      <span className="mb-3 block text-xs text-gray-500">{article.date}</span>
                      <h4 className="mb-4 line-clamp-3 text-sm font-semibold leading-snug text-navy transition-colors group-hover:text-brand-green">
                        {article.title}
                      </h4>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-semibold text-navy/60 transition-colors group-hover:text-brand-green">
                      Xem thêm
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Call-to-Action Brand Banner */}
      <section className="w-full bg-navy py-14 text-cream border-t border-cream/10 select-none">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 px-6 md:flex-row lg:px-12">
          <div className="text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-cream">
              Đang làm nhà <span className="text-brand-green">•</span> sửa bếp <span className="text-brand-green">•</span> thay khóa điện tử?
            </h2>
            <p className="text-sm md:text-base font-normal text-cream/80 mt-3">
              Liên hệ TA HOUSE để được tư vấn giải pháp phù hợp nhất với nhu cầu của gia đình.
            </p>
          </div>
          <Link
            href="#contact"
            className="group flex shrink-0 items-center gap-2.5 rounded-full bg-brand-green px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-lime-dark shadow-md shadow-brand-green/20"
          >
            Liên hệ tư vấn
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
