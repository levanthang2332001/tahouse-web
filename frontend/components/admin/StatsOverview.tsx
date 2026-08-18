"use client";

import React from "react";
import { Package, Flame, Tag, Layers, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  stats?: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
    onSaleProducts: number;
  };
  loading?: boolean;
}

export function StatsOverview({ stats, loading = false }: StatsOverviewProps) {
  const cards = [
    {
      title: "Tổng số sản phẩm",
      value: stats?.totalProducts ?? 0,
      description: "Đang hiển thị trên catalog",
      icon: Package,
      color: "bg-blue-500/10 text-blue-600 border-blue-200/50",
      accent: "text-navy",
    },
    {
      title: "Sản phẩm ưu đãi",
      value: stats?.onSaleProducts ?? 0,
      description: "Có cấu hình giá giảm",
      icon: Flame,
      color: "bg-rose-500/10 text-rose-600 border-rose-200/50",
      accent: "text-rose-600",
    },
    {
      title: "Thương hiệu đối tác",
      value: stats?.totalBrands ?? 0,
      description: "Kassler, Philips, Bosch...",
      icon: Tag,
      color: "bg-amber-500/10 text-amber-600 border-amber-200/50",
      accent: "text-navy",
    },
    {
      title: "Danh mục sản phẩm",
      value: stats?.totalCategories ?? 0,
      description: "Khóa, két, bếp, quạt, lọc nước",
      icon: Layers,
      color: "bg-brand-green/15 text-[#437920] border-brand-green/30",
      accent: "text-[#437920]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="overflow-hidden border border-gray-light/70 shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-navy/60">
                  {c.title}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${c.color}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3">
                {loading ? (
                  <div className="h-8 w-16 bg-black/5 animate-pulse rounded-lg" />
                ) : (
                  <div className={`text-2xl sm:text-3xl font-black ${c.accent}`}>
                    {c.value}
                  </div>
                )}
                <p className="mt-1 text-[11px] font-medium text-navy/50">
                  {c.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
