"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/ProductTable";

export default function AdminProductsListPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy tracking-tight flex items-center gap-2">
            <Package size={24} className="text-brand-green" />
            Danh Sách Sản Phẩm
          </h1>
          <p className="text-xs text-navy/60 mt-1">
            Quản lý, tìm kiếm, cập nhật giá và thông số kỹ thuật cho toàn bộ sản phẩm TA HOUSE
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button variant="brand" size="default" className="font-bold text-xs shadow-xs">
            <Plus size={16} />
            <span>Thêm sản phẩm mới</span>
          </Button>
        </Link>
      </div>

      {/* Main Table */}
      <Suspense fallback={
        <div className="py-20 text-center text-xs text-navy/50">Đang tải...</div>
      }>
        <ProductTable />
      </Suspense>
    </div>
  );
}
