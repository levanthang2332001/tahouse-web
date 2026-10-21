"use client";

import { useSyncExternalStore } from "react";
import type { Product } from "@/lib/types/product";

const STORAGE_KEY = "tahouse:recently-viewed";
const MAX_ITEMS = 8;

/** Just enough of a product to render a ProductCard without refetching */
export type RecentlyViewedProduct = Pick<
  Product,
  "id" | "code" | "name" | "brand" | "brandSlug" | "category" | "categoryName" | "imageUrl" | "price" | "originalPrice" | "priceRange" | "features" | "has_variants"
>;

const listeners = new Set<() => void>();
const EMPTY: RecentlyViewedProduct[] = [];
let cache: { raw: string | null; items: RecentlyViewedProduct[] } = { raw: null, items: EMPTY };

function read(): RecentlyViewedProduct[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  // Keep the snapshot referentially stable for useSyncExternalStore
  if (raw === cache.raw) return cache.items;
  let items = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed as RecentlyViewedProduct[];
  } catch {
    // Corrupt entry: treat as empty
  }
  cache = { raw, items };
  return items;
}

export function recordRecentlyViewed(product: Product) {
  const entry: RecentlyViewedProduct = {
    id: product.id,
    code: product.code,
    name: product.name,
    brand: product.brand,
    brandSlug: product.brandSlug,
    category: product.category,
    categoryName: product.categoryName,
    imageUrl: product.imageUrl,
    price: product.price,
    originalPrice: product.originalPrice,
    priceRange: product.priceRange,
    features: (product.features ?? []).slice(0, 3),
    has_variants: product.has_variants,
  };
  const next = [entry, ...read().filter((item) => item.id !== product.id)].slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode): history is a convenience, skip silently
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRecentlyViewed(): RecentlyViewedProduct[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
