"use client";

import React from "react";
import Link from "next/link";
import { Menu, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  title?: string;
}

export function AdminHeader({
  onToggleMobileSidebar,
  title,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-light/70 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      {/* Left title & mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden rounded-xl p-2 text-navy hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {title && (
          <h1 className="text-base sm:text-lg font-bold text-navy tracking-tight truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2.5">
        <Link href="/products" target="_blank">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex text-xs font-semibold"
          >
            <ExternalLink size={13} />
            <span>Xem website</span>
          </Button>
        </Link>

        <Link href="/admin/products/new">
          <Button
            variant="brand"
            size="sm"
            className="text-xs font-bold shadow-xs"
          >
            <Plus size={15} />
            <span>Thêm sản phẩm</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
