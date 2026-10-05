import { parseProductPrice } from "@/lib/format-price";
import { resolveMediaUrl, resolveMediaUrls } from "@/lib/media";
import type { Product } from "@/lib/types/product";

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: parseProductPrice(product.price),
    originalPrice:
      product.originalPrice === null || product.originalPrice === undefined
        ? undefined
        : parseProductPrice(product.originalPrice) ?? undefined,
    features: product.features ?? [],
    priceRange: product.priceRange ?? "",
  };
}

export function mapProductListItem(product: Product): Product {
  const normalized = normalizeProduct(product);
  return {
    ...normalized,
    imageUrl: resolveMediaUrl(normalized.imageUrl),
  };
}

/**
 * BE sometimes reuses the same product `id`/`code` across variants
 * (different category, price, or image). Use this for React list keys
 * and load-more dedupe instead of `id` alone.
 */
export function getProductListKey(product: Product, index?: number): string {
  const parts = [
    product.id,
    product.code,
    product.category,
    product.subcategory ?? "",
    String(product.price ?? ""),
    product.priceRange ?? "",
    product.imageUrl ?? "",
  ];
  if (index !== undefined) parts.push(String(index));
  return parts.join("::");
}

export function mapProductDetail(product: Product): Product {
  const normalized = normalizeProduct(product);
  return {
    ...normalized,
    imageUrl: resolveMediaUrl(normalized.imageUrl),
    images: resolveMediaUrls(normalized.images),
    installation_preview: resolveMediaUrls(normalized.installation_preview),
  };
}
