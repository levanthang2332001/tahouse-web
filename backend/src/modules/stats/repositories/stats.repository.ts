import { Injectable, Inject } from '@nestjs/common';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import {
  Brand,
  Category,
  Subcategory,
} from '@/modules/brands/schemas/brand.schema';
import { Product } from '@/modules/products/schemas/product.schema';
import { IAdminDashboardStatsResponse, IBrandStat } from '../types/stats.types';

export type BrandStatsRawData = Brand & {
  categories: Array<
    Category & {
      subcategories: Subcategory[];
    }
  >;
  products: Product[];
};

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
export class StatsRepository {
  constructor(@Inject(D1_DATABASE) private readonly db: D1Database) {}

  async getDashboardStats(): Promise<IAdminDashboardStatsResponse> {
    const brandRows = (await this.db.query.brands.findMany({
      with: {
        categories: {
          with: {
            subcategories: true,
          },
        },
        products: true,
      },
    })) as BrandStatsRawData[];

    let totalProducts = 0;
    let discountedProducts = 0;
    let totalCategoriesCount = 0;
    let totalSubcategoriesCount = 0;

    const brandStatsList: IBrandStat[] = [];

    for (const b of brandRows) {
      totalProducts += (b.products || []).length;
    }

    for (const b of brandRows) {
      const bProducts = b.products || [];
      if (bProducts.length === 0) continue;

      const bTotal = bProducts.length;
      const bPercentage =
        totalProducts > 0
          ? Number(((bTotal / totalProducts) * 100).toFixed(2))
          : 0;

      for (const p of bProducts) {
        let isDiscounted = false;
        if (
          (p.discountPercent !== null && p.discountPercent > 0) ||
          (p.originalPrice !== null &&
            p.price !== null &&
            p.originalPrice > p.price)
        ) {
          isDiscounted = true;
        } else {
          const variants = parseJsonField<any[]>(p.variants, []);
          if (Array.isArray(variants)) {
            for (const v of variants) {
              if (
                (typeof v?.discountPercent === 'number' &&
                  v.discountPercent > 0) ||
                (v?.originalPrice != null &&
                  v?.price != null &&
                  v.originalPrice > v.price)
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

      const bCats = b.categories || [];
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

        const subcategoryStats = subCats.map((s) => {
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
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo || undefined,
        totalProducts: bTotal,
        percentage: bPercentage,
        categories: categoryStats,
      });
    }

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
