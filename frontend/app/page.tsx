"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
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
      img: "https://images.unsplash.com/photo-1510137600163-2729bc6959a6?auto=format&fit=crop&q=80",
    },
    {
      title: content.home.solutions.items[1].title,
      desc: content.home.solutions.items[1].desc,
      img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBrand((prev) => (prev + 1) % brands.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [brands.length]);

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#2a2a2a] antialiased selection:bg-[#769b52] selection:text-white">
      <Header />
      <section className="relative flex min-h-[650px] h-[calc(100vh-80px)] max-h-[900px] w-full items-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80"
            alt="Modern interior"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col px-6 text-left lg:px-12">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-block select-none font-cursive text-5xl text-[#769b52] lg:text-6xl"
            >
              {content.home.hero.prefix}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 whitespace-pre-line font-serif text-5xl leading-[1.1] text-white lg:text-7xl xl:text-8xl"
            >
              {content.home.hero.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-10 max-w-lg text-base leading-relaxed text-gray-200 lg:text-lg"
            >
              {content.home.hero.desc}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link
                href="/products"
                className="flex items-center gap-2 bg-[#769b52] px-8 py-4 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#658744] lg:text-sm"
              >
                {content.home.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="group flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:text-[#769b52] lg:text-sm"
              >
                {content.home.hero.ctaSecondary}
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/50 transition-colors group-hover:border-[#769b52]">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 z-20 hidden w-full border-t border-white/10 bg-black/40 backdrop-blur-md lg:block">
          <div className="mx-auto max-w-[1440px] px-12 py-6">
            <div className="grid grid-cols-4 gap-8 text-left">
              {content.home.benefits.map((benefit, idx) => {
                const Icon =
                  [ShieldCheck, Smartphone, Sparkles, Leaf][idx] || ShieldCheck;
                return (
                  <div key={benefit.title} className="flex items-center gap-4">
                    <div className="text-[#769b52]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-wide text-white">
                        {benefit.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-300">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#ebe8df] py-16">
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
              className="flex flex-col items-center px-4 text-center"
            >
              <span className="mb-2 font-serif text-5xl tracking-tight text-[#769b52]">
                {stat.value}
                <span className="text-3xl">{stat.suffix}</span>
              </span>
              <span className="mb-1 text-sm font-medium text-gray-900">{stat.label}</span>
              <span className="text-xs text-gray-500">{stat.sublabel}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="categories" className="w-full bg-[#faf9f6] py-20 lg:py-28">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
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
              <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-[#769b52]">
                {content.home.categories.prefix}
              </h3>
              <h2 className="whitespace-pre-line font-serif text-3xl leading-tight text-gray-900 md:text-4xl">
                {content.home.categories.title}
              </h2>
            </div>
            <Link href="#news" className="flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900">
              {content.home.categories.viewAll}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {content.home.categories.items.map((cat, idx) => {
              const img = [
                "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80",
              ][idx];

              return (
                <motion.div
                  key={cat.title}
                  variants={{
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                  }}
                >
                  <Link href="/products" className="group block cursor-pointer text-left">
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md bg-[#eeeae2] shadow-sm">
                      <Image
                        src={img}
                        alt={cat.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 20vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-900 transition-colors group-hover:text-[#769b52]">
                          {cat.title}
                        </h4>
                        <p className="text-xs text-gray-500">{cat.count}</p>
                      </div>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-400 transition-all group-hover:border-[#769b52] group-hover:bg-[#769b52] group-hover:text-white">
                        <ArrowRight className="h-3 w-3 -rotate-45 transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="relative w-full overflow-hidden bg-[#27292a] py-12 select-none">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 text-left md:flex-row lg:px-12">
          <div className="relative z-10 flex w-full items-center justify-between md:block md:w-1/4">
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-[#769b52]">
                {content.home.partners.prefix}
              </h3>
              <h2 className="text-base font-medium uppercase tracking-wide text-white">
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
                    className={`whitespace-nowrap text-white transition-all duration-500 ${brand.style} ${activeBrand === idx ? "scale-110 text-[#769b52] opacity-100" : "opacity-40 hover:opacity-100"}`}
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

      <section id="solutions" className="w-full overflow-hidden bg-[#f4f3ec] py-20 lg:py-28">
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
            <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-[#769b52]">
              {content.home.solutions.prefix}
            </h3>
            <h2 className="mb-6 whitespace-pre-line font-serif text-4xl leading-tight text-gray-900 lg:text-5xl">
              {content.home.solutions.title}
            </h2>
            <p className="mb-10 text-base leading-relaxed text-gray-600">
              {content.home.solutions.items[activeSolution].desc}
            </p>
            <Link href="#contact" className="inline-flex items-center gap-4 border border-gray-900 px-8 py-3.5 text-xs font-medium uppercase tracking-wider text-gray-900 transition-all hover:bg-gray-900 hover:text-white">
              {content.home.solutions.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
            }}
            className="relative h-[400px] w-full overflow-hidden rounded-sm shadow-lg lg:h-[600px] lg:w-2/3"
          >
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
            <div className="absolute bottom-0 left-0 z-10 w-[85%] max-w-[340px] rounded-sm bg-[#a35e4e] p-8 text-left text-white shadow-xl sm:w-[80%] lg:-left-12 lg:bottom-12">
              <div className="mb-6 flex items-start gap-4">
                <ShieldCheck className="h-8 w-8 shrink-0 opacity-80" />
                <p className="text-sm font-medium leading-snug">{solutions[activeSolution].title}</p>
              </div>
              <Link href="/products" className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/95 hover:text-white">
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

      <section id="news" className="w-full bg-[#faf9f6] py-20 lg:py-28">
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
              <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-[#769b52]">
                {content.home.news.prefix}
              </h3>
            </div>
            <Link href="#categories" className="flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900">
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
                  <div className="aspect-video shrink-0 overflow-hidden rounded-sm bg-gray-200 shadow-xs sm:w-1/2 sm:aspect-square">
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
                      <h4 className="mb-4 line-clamp-3 text-sm font-medium leading-snug text-gray-900 transition-colors group-hover:text-[#769b52]">
                        {article.title}
                      </h4>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors group-hover:text-[#769b52]">
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

      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
