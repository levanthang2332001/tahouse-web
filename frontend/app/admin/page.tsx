"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  ArrowRight,
  ExternalLink,
  Edit,
  Sparkles,
  Layers,
  ChevronRight,
  Fingerprint,
  CookingPot,
  Fan,
  Vault,
  Droplets,
  DoorClosed,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { formatProductName } from "@/lib/format-product-name";
import type { Product } from "@/lib/types/product";

interface SectorItem {
  id: string;
  name: string;
  count: number;
  percentage: string;
  slugs: string[];
  subcategories: Array<{ name: string; slug: string; count: number }>;
}

interface DashboardStats {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  onSaleProducts: number;
  categoryBreakdown: Record<string, number>;
  brandBreakdown: Record<string, number>;
  sectorBreakdown?: SectorItem[];
}

const SECTOR_THEMES: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accentColor: string;
    bgBadge: string;
    textBadge: string;
    barColor: string;
    borderActive: string;
  }
> = {
  "thiet-bi-nha-bep": {
    icon: CookingPot,
    accentColor: "bg-amber-500/10 text-amber-700 border-amber-300/50",
    bgBadge: "bg-amber-100 text-amber-800",
    textBadge: "text-amber-800",
    barColor: "bg-amber-500",
    borderActive: "hover:border-amber-400/80",
  },
  "khoa-dien-tu": {
    icon: Fingerprint,
    accentColor: "bg-blue-500/10 text-blue-700 border-blue-300/50",
    bgBadge: "bg-blue-100 text-blue-800",
    textBadge: "text-blue-800",
    barColor: "bg-blue-600",
    borderActive: "hover:border-blue-400/80",
  },
  "quat-tran-den": {
    icon: Fan,
    accentColor: "bg-emerald-500/10 text-emerald-700 border-emerald-300/50",
    bgBadge: "bg-emerald-100 text-emerald-800",
    textBadge: "text-emerald-800",
    barColor: "bg-emerald-500",
    borderActive: "hover:border-emerald-400/80",
  },
  "ket-sat-thong-minh": {
    icon: Vault,
    accentColor: "bg-purple-500/10 text-purple-700 border-purple-300/50",
    bgBadge: "bg-purple-100 text-purple-800",
    textBadge: "text-purple-800",
    barColor: "bg-purple-600",
    borderActive: "hover:border-purple-400/80",
  },
  "may-loc-nuoc": {
    icon: Droplets,
    accentColor: "bg-sky-500/10 text-sky-700 border-sky-300/50",
    bgBadge: "bg-sky-100 text-sky-800",
    textBadge: "text-sky-800",
    barColor: "bg-sky-500",
    borderActive: "hover:border-sky-400/80",
  },
  "cua-thong-phong": {
    icon: DoorClosed,
    accentColor: "bg-rose-500/10 text-rose-700 border-rose-300/50",
    bgBadge: "bg-rose-100 text-rose-800",
    textBadge: "text-rose-800",
    barColor: "bg-rose-500",
    borderActive: "hover:border-rose-400/80",
  },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setRecentProducts(data.items);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Hero Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-navy via-[#0c415c] to-navy text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-green/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/20 px-3 py-1 text-xs font-bold text-brand-green uppercase tracking-wider mb-3">
            <Sparkles size={13} /> Dashboard Quản Trị
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Chào mừng trở lại, Quản Trị Viên TA HOUSE
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed font-medium">
            Tại đây bạn có thể theo dõi cơ cấu danh mục ngành hàng, thêm mới sản phẩm, cập nhật giá ưu đãi và quản lý toàn bộ kho hàng trên website.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/products/new">
              <Button variant="brand" size="default" className="font-bold text-xs">
                <Plus size={16} />
                <span>Thêm sản phẩm mới</span>
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button
                variant="outline"
                size="default"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold text-xs"
              >
                <span>Xem kho sản phẩm ({stats?.totalProducts || 1215} SP)</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Metrics Overview */}
      <StatsOverview stats={stats ?? undefined} loading={loading} />

      {/* 3. SECTOR CARDS: Cơ Cấu Ngành Hàng Chủ Lực (Option 1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-navy flex items-center gap-2">
              <Layers size={20} className="text-brand-green" />
              Cơ Cấu 6 Ngành Hàng Chủ Lực
            </h2>
            <p className="text-xs text-navy/50 font-medium mt-0.5">
              Phân bố toàn diện <strong>{stats?.totalProducts || 1215}</strong> sản phẩm theo từng nhóm ngành kinh doanh
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Quản lý danh mục</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* 6 Sector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats?.sectorBreakdown ? (
            stats.sectorBreakdown.map((sector) => {
              const theme = SECTOR_THEMES[sector.id] || {
                icon: Layers,
                accentColor: "bg-gray-100 text-gray-700 border-gray-200",
                bgBadge: "bg-gray-100 text-gray-800",
                textBadge: "text-gray-800",
                barColor: "bg-brand-green",
                borderActive: "hover:border-gray-300",
              };
              const Icon = theme.icon;

              return (
                <div
                  key={sector.id}
                  className={`rounded-2xl border border-gray-light/80 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${theme.borderActive}`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${theme.accentColor}`}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-navy leading-snug">
                            {sector.name}
                          </h3>
                          <span className="text-[11px] text-navy/50 font-medium">
                            {sector.subcategories.length} phân loại con
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-navy">
                          {sector.count}{" "}
                          <span className="text-[11px] font-semibold text-navy/50">sp</span>
                        </div>
                        <span
                          className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${theme.bgBadge}`}
                        >
                          {sector.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3.5">
                      <div
                        className={`h-full ${theme.barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(Number(sector.percentage), 4)}%` }}
                      />
                    </div>

                    {/* Subcategories Interactive Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {sector.subcategories.slice(0, 4).map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/admin/products?search=${encodeURIComponent(sub.name)}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#FAF9F5] border border-gray-light/70 px-2 py-1 text-[11px] font-semibold text-navy/70 hover:text-navy hover:border-brand-green/50 hover:bg-brand-green/10 transition-colors"
                          title={`Xem ${sub.count} sản phẩm ${sub.name}`}
                        >
                          <span>{sub.name}</span>
                          <span className="text-[9.5px] font-black text-navy/50 bg-white border border-gray-200/80 rounded px-1">
                            {sub.count}
                          </span>
                        </Link>
                      ))}
                      {sector.subcategories.length > 4 && (
                        <Link
                          href={`/admin/products?category=${sector.slugs[0]}`}
                          className="inline-flex items-center rounded-lg bg-gray-50 px-2 py-1 text-[10.5px] font-bold text-navy/50 hover:text-brand-green transition-colors"
                        >
                          +{sector.subcategories.length - 4} khác
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3.5 mt-3.5 border-t border-gray-light/40 flex items-center justify-between">
                    <Link
                      href={`/admin/products?category=${sector.slugs[0]}`}
                      className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
                    >
                      <span>Xem toàn bộ ngành hàng</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-navy/50">
              Đang tải cơ cấu ngành hàng...
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Products & Quick Tips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Recent Products Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-navy flex items-center gap-2">
              <Package size={18} className="text-brand-green" />
              Sản Phẩm Mới & Cập Nhật Gần Đây
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
            >
              <span>Xem kho sản phẩm</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <Card className="overflow-hidden border border-gray-light/70 shadow-xs">
            <div className="divide-y divide-gray-light/60">
              {loading ? (
                <div className="p-8 text-center text-xs font-medium text-navy/50">
                  Đang tải dữ liệu sản phẩm...
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-navy/50">
                  Chưa có sản phẩm nào.
                </div>
              ) : (
                recentProducts.map((p) => {
                  const formattedName = formatProductName(p.name);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-[#FAF9F5]/70 transition-colors"
                    >
                      {/* Left Thumbnail & Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-gray-light/80 bg-[#FAF9F5]">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={formattedName}
                              fill
                              sizes="52px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] text-navy/40 font-bold">
                              NO IMG
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy/50 font-mono">
                              #{p.code || p.id.slice(0, 6)}
                            </span>
                            {p.brand && (
                              <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-bold">
                                {p.brand}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-xs text-navy truncate" title={formattedName}>
                            {formattedName}
                          </h3>
                          <div className="text-[11px] font-black text-rose-600 mt-0.5">
                            {p.price
                              ? `${new Intl.NumberFormat("vi-VN").format(p.price)} đ`
                              : p.priceRange || "Liên hệ"}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/product/${p.id}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-navy/60 hover:text-navy"
                            title="Xem trên web"
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold gap-1"
                          >
                            <Edit size={13} />
                            <span className="hidden sm:inline">Sửa</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Quick Admin Tools & Tips (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-gray-light/70 shadow-xs bg-[#FAF9F5]">
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="font-black uppercase tracking-wider text-[11px] text-navy flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-green" /> Mẹo Quản Trị & Bán Hàng
              </div>
              <p className="text-navy/70 leading-relaxed">
                - Nhập đầy đủ <strong>giá gốc</strong> và <strong>giá ưu đãi</strong> để hệ thống tự động hiển thị tag <strong>GIẢM %</strong> và số tiền tiết kiệm trên thẻ sản phẩm.
              </p>
              <p className="text-navy/70 leading-relaxed">
                - Thêm hình ảnh lắp đặt thực tế vào mục <strong>installation_preview</strong> để tăng độ tin cậy và tỷ lệ chốt đơn của khách hàng.
              </p>
              <div className="pt-2 border-t border-gray-light/60 flex justify-between items-center">
                <span className="text-[11px] font-semibold text-navy/60">Cần hỗ trợ kỹ thuật?</span>
                <span className="font-bold text-brand-green text-[11px]">TA HOUSE Admin</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-light/70 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-navy/70 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-brand-green" />
                Lối Tắt Thao Tác Nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              <Link href="/admin/products/new" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-bold text-navy gap-2 h-9">
                  <Plus size={14} className="text-brand-green" />
                  <span>Đăng sản phẩm mới</span>
                </Button>
              </Link>
              <Link href="/admin/products" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-bold text-navy gap-2 h-9">
                  <ShoppingBag size={14} className="text-blue-600" />
                  <span>Xem toàn bộ 1.215 sản phẩm</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
