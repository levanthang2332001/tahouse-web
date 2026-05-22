"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Smartphone, Sparkles, Leaf, 
  ArrowRight, ChevronLeft, ChevronRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloating from "@/components/SocialFloating";
import AIChatbot from "@/components/AIChatbot";
import content from "@/data/content.json";

export default function Home() {
  const [activeBrand, setActiveBrand] = useState(0);
  const brands = [
    { name: "BOSCH", style: "font-sans font-bold tracking-tighter" },
    { name: "YALE", style: "font-serif italic tracking-wider" },
    { name: "HÄFELE", style: "font-sans font-extrabold tracking-widest" },
    { name: "SAMSUNG", style: "font-sans font-semibold tracking-normal" },
    { name: "KAADAS", style: "font-sans font-black tracking-tight" },
    { name: "PHILIPS", style: "font-sans font-black tracking-wide" }
  ];

  // Auto-scroll partners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBrand((prev) => (prev + 1) % brands.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [brands.length]);

  const handleNextBrand = () => {
    setActiveBrand((prev) => (prev + 1) % brands.length);
  };

  const handlePrevBrand = () => {
    setActiveBrand((prev) => (prev - 1 + brands.length) % brands.length);
  };

  // Solutions slider
  const [activeSolution, setActiveSolution] = useState(0);
  const solutions = [
    {
      title: content.home.solutions.items[0].title,
      desc: content.home.solutions.items[0].desc,
      img: "https://images.unsplash.com/photo-1510137600163-2729bc6959a6?auto=format&fit=crop&q=80",
      link: "/products?cat=Lock"
    },
    {
      title: content.home.solutions.items[1].title,
      desc: content.home.solutions.items[1].desc,
      img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80",
      link: "/products?cat=Kitchen"
    }
  ];

  return (
    <div className="bg-[#fcfbf9] text-[#2a2a2a] antialiased selection:bg-[#769b52] selection:text-white min-h-screen font-sans">
      <Header />
      
      {/* 1. HERO SECTION */}
      <section className="w-full h-[calc(100vh-80px)] min-h-[650px] max-h-[900px] relative flex items-center overflow-hidden">
        {/* Background Image with elegant zooming */}
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80" 
            alt="Modern Kitchen and Smart Lock Interior" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col text-left">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-cursive text-5xl lg:text-6xl text-[#769b52] mb-4 inline-block transform -rotate-2 select-none"
            >
              {content.home.hero.prefix}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-serif text-5xl lg:text-7xl xl:text-8xl tracking-tight uppercase text-white leading-[1.1] mb-6 font-normal whitespace-pre-line"
            >
              {content.home.hero.title}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base lg:text-lg text-gray-200 mb-10 font-light leading-relaxed max-w-lg"
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
                className="bg-[#769b52] hover:bg-[#658744] text-white text-xs lg:text-sm uppercase tracking-wider px-8 py-4 transition-colors font-medium flex items-center gap-2"
              >
                {content.home.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/products" 
                className="text-xs lg:text-sm uppercase tracking-wider text-white hover:text-[#769b52] transition-colors font-medium flex items-center gap-2 group"
              >
                {content.home.hero.ctaSecondary}
                <div className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center group-hover:border-[#769b52] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Benefits bar inside hero */}
        <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/10 hidden lg:block z-20">
          <div className="max-w-[1440px] mx-auto px-12 py-6">
            <div className="grid grid-cols-4 gap-8 text-left">
              {content.home.benefits.map((b, idx) => {
                const Icon = [ShieldCheck, Smartphone, Sparkles, Leaf][idx] || ShieldCheck;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="text-[#769b52]">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-white font-medium">
                        {b.title}
                      </h3>
                      <p className="text-xs text-gray-300 font-light mt-0.5">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="w-full bg-[#ebe8df] py-16">
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.1 }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-x-0 md:divide-x border-gray-300"
        >
          {content.home.stats.map((s, idx) => (
            <motion.div 
              key={idx} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              style={{ willChange: "transform, opacity" }}
              className="flex flex-col items-center text-center px-4"
            >
              <span className="font-serif text-5xl tracking-tight text-[#769b52] mb-2 font-normal">
                {s.value}
                <span className="text-3xl">{s.suffix}</span>
              </span>
              <span className="text-sm text-gray-900 font-medium mb-1">
                {s.label}
              </span>
              <span className="text-xs text-gray-500 font-light">{s.sublabel}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="w-full bg-[#faf9f6] py-20 lg:py-28">
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.1 }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1440px] mx-auto px-6 lg:px-12"
        >
          
          {/* Section Header */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            style={{ willChange: "transform, opacity" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left"
          >
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#769b52] font-medium mb-3">
                {content.home.categories.prefix}
              </h3>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-gray-900 font-normal leading-tight whitespace-pre-line">
                {content.home.categories.title}
              </h2>
            </div>
            <Link 
              href="/products" 
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-2 shrink-0"
            >
              {content.home.categories.viewAll}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {content.home.categories.items.map((cat, idx) => {
              const img = [
                "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80"
              ][idx] || "";
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <Link href="/products?cat=Lock" className="group block cursor-pointer text-left">
                    <div className="bg-[#eeeae2] rounded-md overflow-hidden aspect-[4/3] mb-4 relative shadow-sm">
                      <img 
                        src={img} 
                        alt={cat.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm uppercase tracking-wide text-gray-900 font-medium mb-1 group-hover:text-[#769b52] transition-colors leading-tight">
                          {cat.title}
                        </h4>
                        <p className="text-xs text-gray-500 font-light">{cat.count}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 group-hover:bg-[#769b52] group-hover:text-white group-hover:border-[#769b52] transition-all shrink-0">
                        <ArrowRight className="w-3 h-3 transform -rotate-45" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

        </motion.div>
      </section>

      {/* 4. PARTNERS SECTION */}
      <section className="w-full bg-[#27292a] py-12 relative overflow-hidden select-none">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-12 text-left">
          
          <div className="md:w-1/4 shrink-0 relative z-10 flex items-center justify-between w-full md:block">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#769b52] font-medium mb-1">
                {content.home.partners.prefix}
              </h3>
              <h2 className="text-white text-base uppercase tracking-wide font-medium">
                {content.home.partners.title}
              </h2>
            </div>
            <button 
              onClick={handleNextBrand} 
              className="md:hidden text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Carousel Brands bar */}
          <div className="w-full md:w-3/4 flex items-center justify-between gap-8 opacity-70">
            <button 
              onClick={handlePrevBrand} 
              className="hidden md:block text-gray-500 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-hidden py-1 relative">
              <div className="flex items-center justify-around w-full gap-4">
                {brands.map((b, idx) => (
                  <span 
                    key={idx}
                    className={`text-white transition-all duration-500 whitespace-nowrap select-none ${b.style} ${
                      activeBrand === idx ? "text-[#769b52] scale-110 opacity-100" : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    {b.name}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleNextBrand} 
              className="hidden md:block text-gray-500 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. SOLUTIONS FEATURE SECTION */}
      <section className="w-full bg-[#f4f3ec] py-20 lg:py-28 overflow-hidden">
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center"
        >
          
          {/* Left Text Column */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
            }}
            style={{ willChange: "transform, opacity" }}
            className="lg:w-1/3 text-left"
          >
            <h3 className="text-xs uppercase tracking-widest text-[#769b52] font-medium mb-3">
              {content.home.solutions.prefix}
            </h3>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight text-gray-900 mb-6 font-normal leading-tight whitespace-pre-line">
              {content.home.solutions.title}
            </h2>
            <p className="text-base text-gray-600 mb-10 font-light leading-relaxed">
              {content.home.solutions.items[activeSolution].desc}
            </p>
            <Link 
              href="/products" 
              className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-xs uppercase tracking-wider px-8 py-3.5 transition-all font-medium inline-flex items-center gap-4"
            >
              {content.home.solutions.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right Image Container */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
            }}
            style={{ willChange: "transform, opacity" }}
            className="lg:w-2/3 relative w-full h-[400px] lg:h-[600px] shadow-lg rounded-sm overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeSolution}
                src={solutions[activeSolution].img} 
                alt="Modern TA House Interior"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Floating Solution Card */}
            <div className="absolute bottom-0 left-0 lg:-left-12 lg:bottom-12 bg-[#a35e4e] text-white p-8 w-[85%] sm:w-[80%] max-w-[340px] rounded-sm shadow-xl text-left z-10 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <ShieldCheck className="w-8 h-8 shrink-0 font-light opacity-80" />
                <p className="text-sm font-medium leading-snug">
                  {solutions[activeSolution].title}
                </p>
              </div>
              <Link 
                href={solutions[activeSolution].link} 
                className="text-xs uppercase tracking-wider font-medium flex items-center gap-2 group text-white/95 hover:text-white"
              >
                Xem chi tiết
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Slide Arrows Overlay */}
            <div className="absolute bottom-6 right-6 flex gap-3 z-10">
              <button 
                onClick={() => setActiveSolution((prev) => (prev - 1 + solutions.length) % solutions.length)}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setActiveSolution((prev) => (prev + 1) % solutions.length)}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 6. NEWS SECTION */}
      <section id="news" className="w-full bg-[#faf9f6] py-20 lg:py-28">
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.1 }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1440px] mx-auto px-6 lg:px-12"
        >
          
          {/* Header */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            style={{ willChange: "transform, opacity" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left"
          >
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#769b52] font-medium mb-3">
                {content.home.news.prefix}
              </h3>
            </div>
            <Link 
              href="/products" 
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-2 shrink-0"
            >
              {content.home.news.viewAll}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.home.news.articles.map((art, i) => {
              const img = [
                "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1528312635001-4be7c33bd6df?auto=format&fit=crop&q=80"
              ][i] || "";
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <article className="flex flex-col sm:flex-row gap-6 group cursor-pointer text-left">
                    <div className="sm:w-1/2 aspect-video sm:aspect-square overflow-hidden rounded-sm bg-gray-200 shrink-0 shadow-xs">
                      <img 
                        src={img} 
                        alt={art.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="sm:w-1/2 flex flex-col justify-between py-2">
                      <div>
                        <span className="text-xs text-gray-500 font-light mb-3 block">
                          {art.date}
                        </span>
                        <h4 className="text-sm text-gray-900 font-medium leading-snug mb-4 group-hover:text-[#769b52] transition-colors line-clamp-3">
                          {art.title}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-600 font-medium flex items-center gap-2 group-hover:text-[#769b52] transition-colors">
                        Xem thêm
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                </motion.div>
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
