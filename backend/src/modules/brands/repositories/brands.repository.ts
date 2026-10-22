import { Injectable, Inject } from '@nestjs/common';
import { eq, or, and, sql } from 'drizzle-orm';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import {
  brands,
  categories,
  subcategories,
  NewBrand,
  NewCategory,
  NewSubcategory,
} from '../schemas/brand.schema';
import { BrandResponseDto } from '../dto/brand-response.dto';

@Injectable()
export class BrandsRepository {
  constructor(@Inject(D1_DATABASE) private readonly db: D1Database) {}

  /**
   * Lấy toàn bộ danh sách thương hiệu kèm cây phân cấp danh mục
   */
  async findAll(): Promise<BrandResponseDto[]> {
    const rows = await this.db.query.brands.findMany({
      orderBy: (b, { asc }) => [asc(b.orderIndex), asc(b.name)],
      with: {
        categories: {
          with: {
            subcategories: true,
          },
        },
      },
    });

    return rows
      .map((b) => BrandResponseDto.fromEntity(b))
      .filter((b): b is BrandResponseDto => b !== null);
  }

  /**
   * Tra cứu chi tiết 1 thương hiệu theo ID hoặc slug kèm cây danh mục
   */
  async findByIdOrSlug(idOrSlug: string): Promise<BrandResponseDto | null> {
    const brand = await this.db.query.brands.findFirst({
      where: or(eq(brands.id, idOrSlug), eq(brands.slug, idOrSlug)),
      with: {
        categories: {
          with: {
            subcategories: true,
          },
        },
      },
    });

    return BrandResponseDto.fromEntity(brand);
  }

  async findBySlug(slug: string) {
    return this.db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });
  }

  /**
   * Lightweight existence check — only fetches id and name, no categories join
   */
  async findBrandById(
    id: string,
  ): Promise<{ id: string; name: string } | null> {
    const row = await this.db.query.brands.findFirst({
      where: eq(brands.id, id),
      columns: { id: true, name: true },
    });
    return row ?? null;
  }

  async insertBrand(data: NewBrand): Promise<void> {
    await this.db.insert(brands).values(data);
  }

  async updateBrand(id: string, data: Partial<NewBrand>): Promise<void> {
    await this.db
      .update(brands)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brands.id, id));
  }

  async deleteBrand(id: string): Promise<void> {
    await this.db.delete(brands).where(eq(brands.id, id));
  }

  async insertCategory(data: NewCategory): Promise<void> {
    await this.db.insert(categories).values(data);
  }

  async insertCategoriesBatch(data: NewCategory[]): Promise<void> {
    if (data.length > 0) {
      await this.db.insert(categories).values(data);
    }
  }

  async updateCategory(id: string, data: Partial<NewCategory>): Promise<void> {
    await this.db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id));
  }

  async deleteCategory(id: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  async deleteCategoriesByBrandId(brandId: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.brandId, brandId));
  }

  async insertSubcategory(data: NewSubcategory): Promise<void> {
    await this.db.insert(subcategories).values(data);
  }

  async insertSubcategoriesBatch(data: NewSubcategory[]): Promise<void> {
    if (data.length > 0) {
      await this.db.insert(subcategories).values(data);
    }
  }

  async deleteSubcategory(id: string): Promise<void> {
    await this.db.delete(subcategories).where(eq(subcategories.id, id));
  }

  async deleteSubcategoriesByCategoryId(categoryId: string): Promise<void> {
    await this.db
      .delete(subcategories)
      .where(eq(subcategories.categoryId, categoryId));
  }

  /**
   * Find a category by slug or name within a specific brand
   */
  async findCategoryInBrand(
    brandId: string,
    categorySlugOrName: string,
  ): Promise<{ id: string; slug: string; name: string } | null> {
    const input = categorySlugOrName.trim().toLowerCase();
    const row = await this.db.query.categories.findFirst({
      where: and(
        eq(categories.brandId, brandId),
        or(
          sql`LOWER(${categories.slug}) = ${input}`,
          sql`LOWER(${categories.name}) = ${input}`,
        ),
      ),
    });
    if (!row) return null;
    return { id: row.id, slug: row.slug, name: row.name };
  }

  /**
   * Find a subcategory by slug or name within a specific category
   */
  async findSubcategoryInCategory(
    categoryId: string,
    subcategorySlugOrName: string,
  ): Promise<{ id: string; slug: string; name: string } | null> {
    const input = subcategorySlugOrName.trim().toLowerCase();
    const row = await this.db.query.subcategories.findFirst({
      where: and(
        eq(subcategories.categoryId, categoryId),
        or(
          sql`LOWER(${subcategories.slug}) = ${input}`,
          sql`LOWER(${subcategories.name}) = ${input}`,
        ),
      ),
    });
    if (!row) return null;
    return { id: row.id, slug: row.slug, name: row.name };
  }
}
