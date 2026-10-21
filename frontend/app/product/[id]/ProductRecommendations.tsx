"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api/products";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import type { Product } from "@/lib/types/product";

const RELATED_LIMIT = 4;

function RowHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-lg font-bold text-navy sm:text-xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-[#3f741b] hover:underline"
        >
          Xem tất cả <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

// Swipeable row on small screens (cards need ~260px to stay readable), 4-column grid on desktop
const GRID =
  "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 invisible-scrollbar sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0";
const ITEM = "w-[78%] max-w-[300px] shrink-0 snap-start sm:w-[45%] lg:w-auto lg:max-w-none";

export function RelatedProducts({ product }: { product: Product }) {
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts({ category: product.category, limit: RELATED_LIMIT + 1 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items.filter((item) => item.id !== product.id).slice(0, RELATED_LIMIT));
      })
      // Recommendations are optional; hide the row on failure
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [product.category, product.id]);

  if (items !== null && items.length === 0) return null;

  return (
    <section aria-label="Sản phẩm cùng dòng">
      <RowHeader
        title={`Sản phẩm cùng dòng ${product.categoryName || ""}`.trim()}
        href={`/products?category=${encodeURIComponent(product.category)}`}
      />
      <div className={GRID}>
        {items === null
          ? Array.from({ length: RELATED_LIMIT }).map((_, i) => (
              <div key={i} className={`${ITEM} aspect-[3/4] animate-pulse rounded-2xl bg-white/70`} />
            ))
          : items.map((item) => (
              <div key={item.id} className={ITEM}>
                <ProductCard product={item} />
              </div>
            ))}
      </div>
    </section>
  );
}

export function RecentlyViewedProducts({ currentId }: { currentId: string }) {
  const items = useRecentlyViewed()
    .filter((item) => item.id !== currentId)
    .slice(0, RELATED_LIMIT);

  if (items.length === 0) return null;

  return (
    <section aria-label="Sản phẩm bạn đã xem">
      <RowHeader title="Bạn đã xem" />
      <div className={GRID}>
        {items.map((item) => (
          <div key={item.id} className={ITEM}>
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
