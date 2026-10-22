/** Brand category tree as returned by `/api/brands` and `/admin/brands`. */
export interface BrandTaxonomy {
  name: string;
  slug: string;
  categories?: Array<{
    name: string;
    slug: string;
    subcategories?: Array<{ name: string; slug: string }>;
  }>;
}

/** Case-insensitive match on name or slug, the same way brand ids are resolved server-side. */
export function findBrand<T extends Pick<BrandTaxonomy, "name" | "slug">>(brands: T[], brand?: string | null): T | null {
  const key = brand?.trim().toLowerCase();
  if (!key) return null;
  return brands.find((b) => b.name.trim().toLowerCase() === key || b.slug.toLowerCase() === key) ?? null;
}
