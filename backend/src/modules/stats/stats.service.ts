import { Injectable, Inject } from '@nestjs/common';
import { D1_DATABASE } from '../../database/d1.constants';
import type { D1Database } from '../../database/d1.client';
import { products } from '../products/schemas/product.schema';
import { brands, categories, subcategories } from '../brands/schemas/brand.schema';
import { IAdminDashboardStatsResponse, IBrandStat } from './types/stats.types';

function parseJsonField<T>(field: any, defaultValue: T): T {
  if (field === null || field === undefined) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return field;
}

@Injectable()
export class StatsService {
  constructor(
    @Inject(D1_DATABASE) private readonly db: D1Database,
  ) {}

  async getDashboardStats(): Promise<IAdminDashboardStatsResponse> {
    const [productRows, brandRows, catRows, subRows] = await Promise.all([
      this.db.select().from(products),
      this.db.select().from(brands),
      this.db.select().from(categories),
      this.db.select().from(subcategories),
    ]);

    const totalProducts = productRows.length;

    // Check discount logic
    let discountedProducts = 0;
    for (const p of productRows) {
      let isDiscounted = false;
      if (
        (p.discountPercent !== null && p.discountPercent > 0) ||
        (p.originalPrice !== null && p.price !== null && p.originalPrice > p.price)
      ) {
        isDiscounted = true;
      } else {
        const variants = parseJsonField<any[]>(p.variants, []);
        if (Array.isArray(variants)) {
          for (const v of variants) {
            if (
              (typeof v?.discountPercent === 'number' && v.discountPercent > 0) ||
              (v?.originalPrice != null && v?.price != null && v.originalPrice > v.price)
            ) {
              isDiscounted = true;
              break;
            }
          }
        }
      }
      if (isDiscounted) {
        discountedProducts++;
      }
    }

    // Subcategories map by categoryId
    const subMap = new Map<string, Array<{ id: string; slug: string; name: string }>>();
    for (const s of subRows) {
      if (!subMap.has(s.categoryId)) {
        subMap.set(s.categoryId, []);
      }
      subMap.get(s.categoryId)!.push({
        id: s.id,
        slug: s.slug,
        name: s.name,
      });
    }

    // Categories map by brandId
    const catMap = new Map<string, Array<any>>();
    for (const c of catRows) {
      if (!catMap.has(c.brandId)) {
        catMap.set(c.brandId, []);
      }
      catMap.get(c.brandId)!.push({
        id: c.id,
        slug: c.slug,
        name: c.name,
        subcategories: subMap.get(c.id) || [],
      });
    }

    // Map products to brandId
    const brandProductsMap = new Map<string, any[]>();
    for (const p of productRows) {
      const bId = p.brandId;
      if (!brandProductsMap.has(bId)) {
        brandProductsMap.set(bId, []);
      }
      brandProductsMap.get(bId)!.push(p);
    }

    const brandStatsList: IBrandStat[] = [];
    let totalCategoriesCount = 0;
    let totalSubcategoriesCount = 0;

    for (const b of brandRows) {
      const bProducts = brandProductsMap.get(b.id) || [];
      if (bProducts.length === 0) continue;

      const bTotal = bProducts.length;
      const bPercentage =
        totalProducts > 0
          ? Number(((bTotal / totalProducts) * 100).toFixed(2))
          : 0;

      const bCats = catMap.get(b.id) || [];
      totalCategoriesCount += bCats.length;

      const categoryStats = bCats.map((c) => {
        const cSlugLower = c.slug.toLowerCase();
        const cProducts = bProducts.filter(
          (p) => (p.categorySlug || '').toLowerCase() === cSlugLower,
        );
        const cTotal = cProducts.length;
        const cPercentage =
          bTotal > 0 ? Number(((cTotal / bTotal) * 100).toFixed(2)) : 0;

        const subCats = c.subcategories || [];
        totalSubcategoriesCount += subCats.length;

        const subcategoryStats = subCats.map((s: any) => {
          const sSlugLower = s.slug.toLowerCase();
          const sProducts = cProducts.filter(
            (p) => (p.subcategorySlug || '').toLowerCase() === sSlugLower,
          );
          const sTotal = sProducts.length;
          const sPercentage =
            cTotal > 0 ? Number(((sTotal / cTotal) * 100).toFixed(2)) : 0;

          return {
            slug: s.slug,
            name: s.name,
            totalProducts: sTotal,
            percentage: sPercentage,
          };
        });

        return {
          slug: c.slug,
          name: c.name,
          totalProducts: cTotal,
          percentage: cPercentage,
          subcategories: subcategoryStats,
        };
      });

      brandStatsList.push({
        id: b.id as any,
        name: b.name,
        slug: b.slug,
        logo: b.logo || undefined,
        totalProducts: bTotal,
        percentage: bPercentage,
        categories: categoryStats,
      });
    }

    // Sort brands by totalProducts DESC
    brandStatsList.sort((a, b) => b.totalProducts - a.totalProducts);

    return {
      summary: {
        totalProducts,
        totalBrands: brandStatsList.length,
        totalCategories: totalCategoriesCount,
        totalSubcategories: totalSubcategoriesCount,
        discountedProducts,
      },
      brands: brandStatsList,
    };
  }
}
