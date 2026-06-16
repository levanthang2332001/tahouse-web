"use client";

import React from "react";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialFloating from "@/components/SocialFloating";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import BrandsSection from "@/components/home/BrandsSection";
import SolutionsSection from "@/components/home/SolutionsSection";
import NewsSection from "@/components/home/NewsSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral text-navy antialiased selection:bg-brand-green selection:text-white">
      <Header />
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <BrandsSection />
      <SolutionsSection />
      <NewsSection />
      <CtaBanner />
      <Footer />
      <SocialFloating />
      <AIChatbot />
    </div>
  );
}
