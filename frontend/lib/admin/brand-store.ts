import { backendFetch } from "@/lib/backend/client";
import { resolveMediaUrl } from "@/lib/media";
import { slugify } from "@/lib/utils";
import { getLocalBrandLogo } from "@/lib/brand-logos";
import { fetchRemoteProducts } from "@/lib/admin/product-store";
import type { Brand } from "@/lib/types/product";

export interface CustomBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  country?: string;
  updatedAt?: string;
}

/**
 * Get unified list of all brands directly from the backend database with product counts.
 */
export async function getAllBrandsWithStats(): Promise<
  Array<CustomBrand & { productCount: number; categories?: Brand["categories"] }>
> {
  const [remoteBrands, products] = await Promise.all([
    backendFetch<Brand[]>("/brands").catch(() => [] as Brand[]),
    fetchRemoteProducts().catch(() => []),
  ]);

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
    const localAsset = getLocalBrandLogo(slug, rb.name);
    const logo = localAsset || resolveMediaUrl(rb.logo) || "";

    return {
      id: String(rb.id || slug),
      name: rb.name,
      slug,
      logo,
      description: rb.description || "",
      website: rb.website || "",
      country: rb.country || "Chính hãng",
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
