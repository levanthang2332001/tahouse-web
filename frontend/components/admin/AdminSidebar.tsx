"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ExternalLink,
  LogOut,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  const navItems = [
    {
      title: "Tổng quan",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Quản lý sản phẩm",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      title: "Quản lý thương hiệu",
      href: "/admin/brands",
      icon: Tag,
      exact: false,
    },
    {
      title: "Thêm sản phẩm mới",
      href: "/admin/products/new",
      icon: PlusCircle,
      exact: true,
    },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-[#062B3D] text-white p-4 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green text-navy font-black text-lg shadow-md shadow-brand-green/20">
            TA
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
              TA HOUSE <span className="text-[10px] font-bold text-brand-green uppercase px-1.5 py-0.2 rounded bg-brand-green/15">Admin</span>
            </span>
            <span className="text-[11px] text-white/50 truncate">
              Hệ thống quản trị
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-white/40">
            Menu Quản Trị
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) &&
                (item.href !== "/admin" || pathname === "/admin");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all group cursor-pointer",
                  isActive
                    ? "bg-brand-green text-navy shadow-sm font-extrabold"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-navy" : "text-white/60 group-hover:text-white",
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-navy" />}
              </Link>
            );
          })}
        </div>

        {/* Website Public Link */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
          <div className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-white/40">
            Truy cập
          </div>
          <Link
            href="/products"
            target="_blank"
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ExternalLink size={16} className="text-white/50" />
              <span>Xem trang sản phẩm</span>
            </div>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ExternalLink size={16} className="text-white/50" />
              <span>Xem trang chủ web</span>
            </div>
          </Link>
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/20 text-brand-green font-bold text-xs">
            AD
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-white truncate">
              {user?.name || "Admin"}
            </span>
            <span className="text-[10px] text-white/50 truncate font-mono">
              {user?.username || "admin"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 py-2.5 text-xs font-bold transition-colors cursor-pointer border border-rose-500/20"
        >
          <LogOut size={15} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 shadow-xl">
        {content}
      </aside>

      {/* Mobile drawer backdrop & sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-300">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
