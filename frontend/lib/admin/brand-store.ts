import { backendFetch } from "@/lib/backend/client";
import { slugify } from "@/lib/utils";
import { resolveBrandLogo } from "@/lib/admin/brand-logo";
import { fetchRemoteProducts } from "@/lib/admin/product-store";
import type { Brand } from "@/lib/types/product";

export interface CustomBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  updatedAt?: string;
}

/**
 * Get unified list of all brands directly from the backend database with product counts.
 * Throws when the backend brand list cannot be loaded, so callers never mistake an outage for "no brands".
 * Product counts are best-effort: if products fail to load, counts are 0.
 */
export async function getAllBrandsWithStats(): Promise<
  Array<CustomBrand & { productCount: number; categories?: Brand["categories"] }>
> {
  const [remoteBrands, products] = await Promise.all([
    backendFetch<Brand[]>("/brands"),
    fetchRemoteProducts().catch(() => []),
  ]);
  if (!Array.isArray(remoteBrands)) {
    throw new Error("Backend trả về danh sách thương hiệu không hợp lệ");
  }

  // Count products by brand slug and brand name
  const productCountMap: Record<string, number> = {};

  products.forEach((p) => {
    if (p.brand) {
      const slug = p.brandSlug || slugify(p.brand);
      productCountMap[slug] = (productCountMap[slug] || 0) + 1;
      productCountMap[p.brand.toLowerCase()] = (productCountMap[p.brand.toLowerCase()] || 0) + 1;
    }
  });

  const list = remoteBrands.map((rb) => {
    const slug = rb.slug || slugify(rb.name);
    const count =
      productCountMap[slug] ||
      productCountMap[rb.name.toLowerCase()] ||
      0;

    return {
      id: String(rb.id || slug),
      name: rb.name,
      slug,
      logo: resolveBrandLogo(rb.logo, slug, rb.name),
      productCount: count,
      categories: rb.categories || [],
    };
  });

  // Sort descending by productCount, then alphabetical
  list.sort(
    (a, b) =>
      b.productCount - a.productCount ||
      a.name.localeCompare(b.name, "vi"),
  );

  return list;
}
