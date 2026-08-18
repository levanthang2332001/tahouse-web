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

  const loadProduct = () => {
    setLoading(true);
    setError(null);
    setStatusCode(null);

    fetch(`/api/admin/products/${encodeURIComponent(id)}`)
      .then(async (res) => {
        setStatusCode(res.status);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Lỗi tải sản phẩm (${res.status})`);
        }
        setProduct(data);
      })
      .catch((err) => {
        setError(err.message || "Lỗi tải sản phẩm");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

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
              onClick={loadProduct}
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
