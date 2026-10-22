import { adminBackendFetch } from "@/lib/admin/api-client";
import { getAdminStats, PRODUCT_SECTORS, type SectorBreakdown } from "@/lib/admin/product-store";
import { CATEGORY_LABELS } from "@/data/catalog-taxonomy";

/** Shape of backend `GET /admin/stats` (see backend stats.types.ts). */
interface BackendDashboardStats {
  summary: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
    totalSubcategories: number;
    discountedProducts: number;
  };
  brands: Array<{
    name: string;
    slug: string;
    totalProducts: number;
    categories: Array<{ slug: string; name: string; totalProducts: number }>;
  }>;
}

export type AdminDashboardStats = Awaited<ReturnType<typeof getAdminStats>>;

const CACHE_TTL_MS = 30 * 1000;
let cache: { at: number; stats: AdminDashboardStats } | null = null;

const sortDesc = (record: Record<string, number>) =>
  Object.fromEntries(Object.entries(record).sort((a, b) => b[1] - a[1]));

/** Maps the backend aggregate onto the shape the dashboard already renders. */
function fromBackend(data: BackendDashboardStats): AdminDashboardStats {
  const totalProducts = data.summary.totalProducts;
  const brandBreakdown: Record<string, number> = {};
  const categoryBreakdown: Record<string, number> = {};
  // slug -> { name, count } summed across brands
  const bySlug: Record<string, { name: string; count: number }> = {};

  for (const brand of data.brands ?? []) {
    brandBreakdown[brand.name] = (brandBreakdown[brand.name] ?? 0) + brand.totalProducts;
    for (const category of brand.categories ?? []) {
      if (category.totalProducts <= 0) continue;
      const label = CATEGORY_LABELS[category.slug] || category.name || category.slug;
      categoryBreakdown[label] = (categoryBreakdown[label] ?? 0) + category.totalProducts;
      const entry = (bySlug[category.slug] ??= { name: label, count: 0 });
      entry.count += category.totalProducts;
    }
  }

  const sectorBreakdown: SectorBreakdown[] = PRODUCT_SECTORS.map((sector) => {
    const subcategories = sector.slugs
      .filter((slug) => bySlug[slug])
      .map((slug) => ({ slug, name: bySlug[slug].name, count: bySlug[slug].count }))
      .sort((a, b) => b.count - a.count);
    const count = subcategories.reduce((sum, s) => sum + s.count, 0);
    return {
      id: sector.id,
      name: sector.name,
      count,
      percentage: totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : "0",
      slugs: sector.slugs,
      subcategories,
    };
  });

  return {
    totalProducts,
    totalBrands: data.summary.totalBrands,
    totalCategories: data.summary.totalCategories,
    onSaleProducts: data.summary.discountedProducts,
    categoryBreakdown: sortDesc(categoryBreakdown),
    brandBreakdown: sortDesc(brandBreakdown),
    sectorBreakdown,
  };
}

/**
 * Dashboard stats from the backend aggregate (one small request) instead of downloading the whole catalog.
 * Falls back to the local computation if the backend endpoint is unavailable, so the dashboard never goes blank.
 */
export async function getDashboardStats(forceRefresh = false): Promise<AdminDashboardStats> {
  if (!forceRefresh && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.stats;
  try {
    const data = await adminBackendFetch<BackendDashboardStats>("/admin/stats");
    if (!data?.summary || !Array.isArray(data.brands)) throw new Error("Unexpected /admin/stats response");
    const stats = fromBackend(data);
    cache = { at: Date.now(), stats };
    return stats;
  } catch (error) {
    console.warn("[getDashboardStats] backend stats unavailable, computing locally:", error);
    return getAdminStats(forceRefresh);
  }
}
