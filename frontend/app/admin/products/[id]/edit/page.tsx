"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types/product";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const [retryIndex, setRetryIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      setStatusCode(null);

      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`);
        const status = res.status;
        const data = await res.json();
        if (ignore) return;
        setStatusCode(status);
        if (!res.ok) {
          throw new Error(data.message || `Lỗi tải sản phẩm (${status})`);
        }
        setProduct(data);
      } catch (err: unknown) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Lỗi tải sản phẩm");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [id, retryIndex]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-green border-t-transparent" />
        <span className="text-xs font-bold text-navy/70">Đang tải thông tin sản phẩm #{id}...</span>
      </div>
    );
  }

  if (error || !product) {
    const isNotFound = statusCode === 404;
    const isUnauthorized = statusCode === 401;

    return (
      <div className="max-w-md mx-auto my-12 rounded-3xl bg-white border border-gray-light p-8 text-center space-y-4 shadow-sm">
        <div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-2xl ${
          isNotFound ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
        }`}>
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-navy">
          {isNotFound ? "Không tìm thấy sản phẩm" : isUnauthorized ? "Phiên làm việc hết hạn" : "Lỗi tải dữ liệu"}
        </h2>
        <p className="text-xs text-navy/60 leading-relaxed">
          {isNotFound
            ? `Sản phẩm với mã "${id}" không tồn tại trong hệ thống hoặc đã bị xóa.`
            : isUnauthorized
            ? "Phiên đăng nhập quản trị của bạn đã hết hạn. Vui lòng đăng nhập lại."
            : error || "Đã xảy ra sự cố khi kết nối đến máy chủ."}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          {!isNotFound && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRetryIndex((prev) => prev + 1)}
              className="text-xs font-bold"
            >
              Thử lại
            </Button>
          )}
          <Link href="/admin/products">
            <Button variant="brand" size="sm" className="text-xs font-bold gap-1.5">
              <ArrowLeft size={14} />
              <span>Quay lại danh sách</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}
