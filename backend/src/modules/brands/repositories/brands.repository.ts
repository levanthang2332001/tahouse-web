import { Injectable, Inject } from '@nestjs/common';
import { eq, or, and, sql, inArray, is } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { DrizzleD1Database } from 'drizzle-orm/d1';
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
import { products } from '../../products/schemas/product.schema';
import { BrandResponseDto } from '../dto/brand-response.dto';

/** Số sản phẩm của một thương hiệu, gom theo cặp (category_slug, subcategory_slug) */
export interface ProductTaxonomyCount {
  categorySlug: string;
  subcategorySlug: string | null;
  count: number;
}

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

  /**
   * Đếm sản phẩm của thương hiệu theo (category_slug, subcategory_slug).
   * Chỉ đọc bảng products; dùng để chặn xóa/đổi slug khi còn sản phẩm tham chiếu.
   */
  async countProductsByTaxonomy(
    brandId: string,
  ): Promise<ProductTaxonomyCount[]> {
    const rows = await this.db
      .select({
        categorySlug: products.categorySlug,
        subcategorySlug: products.subcategorySlug,
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(eq(products.brandId, brandId))
      .groupBy(products.categorySlug, products.subcategorySlug);

    return rows.map((r) => ({
      categorySlug: String(r.categorySlug ?? ''),
      subcategorySlug: r.subcategorySlug ?? null,
      count: Number(r.count) || 0,
    }));
  }

  /** Tạo thương hiệu cùng cây danh mục trong một batch (nguyên tử trên D1) */
  async createBrandWithTree(
    brand: NewBrand,
    categoryRows: NewCategory[],
    subcategoryRows: NewSubcategory[],
  ): Promise<void> {
    const queries: BatchItem<'sqlite'>[] = [
      this.db.insert(brands).values(brand),
    ];
    if (categoryRows.length > 0) {
      queries.push(this.db.insert(categories).values(categoryRows));
    }
    if (subcategoryRows.length > 0) {
      queries.push(this.db.insert(subcategories).values(subcategoryRows));
    }
    await this.runBatch(queries);
  }

  /**
   * Cập nhật thương hiệu; nếu truyền `tree` thì thay toàn bộ cây danh mục trong cùng batch.
   */
  async updateBrandWithTree(
    brandId: string,
    data: Partial<NewBrand>,
    tree?: { categories: NewCategory[]; subcategories: NewSubcategory[] },
  ): Promise<void> {
    const queries: BatchItem<'sqlite'>[] = [
      this.db
        .update(brands)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(brands.id, brandId)),
    ];
    if (tree) {
      queries.push(...this.deleteTreeQueries(brandId));
      if (tree.categories.length > 0) {
        queries.push(this.db.insert(categories).values(tree.categories));
      }
      if (tree.subcategories.length > 0) {
        queries.push(this.db.insert(subcategories).values(tree.subcategories));
      }
    }
    await this.runBatch(queries);
  }

  /** Xóa thương hiệu cùng toàn bộ danh mục/danh mục con trong một batch */
  async deleteBrandWithTree(brandId: string): Promise<void> {
    await this.runBatch([
      ...this.deleteTreeQueries(brandId),
      this.db.delete(brands).where(eq(brands.id, brandId)),
    ]);
  }

  /** Thêm danh mục cha cùng danh mục con trong một batch */
  async insertCategoryWithSubcategories(
    category: NewCategory,
    subcategoryRows: NewSubcategory[],
  ): Promise<void> {
    const queries: BatchItem<'sqlite'>[] = [
      this.db.insert(categories).values(category),
    ];
    if (subcategoryRows.length > 0) {
      queries.push(this.db.insert(subcategories).values(subcategoryRows));
    }
    await this.runBatch(queries);
  }

  /**
   * Cập nhật danh mục cha; nếu truyền `subcategoryRows` thì thay toàn bộ danh mục con trong cùng batch.
   */
  async updateCategoryWithSubcategories(
    categoryId: string,
    data: Partial<NewCategory>,
    subcategoryRows?: NewSubcategory[],
  ): Promise<void> {
    const queries: BatchItem<'sqlite'>[] = [
      this.db
        .update(categories)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(categories.id, categoryId)),
    ];
    if (subcategoryRows) {
      queries.push(
        this.db
          .delete(subcategories)
          .where(eq(subcategories.categoryId, categoryId)),
      );
      if (subcategoryRows.length > 0) {
        queries.push(this.db.insert(subcategories).values(subcategoryRows));
      }
    }
    await this.runBatch(queries);
  }

  /** Xóa danh mục cha cùng danh mục con trong một batch */
  async deleteCategoryWithSubcategories(categoryId: string): Promise<void> {
    await this.runBatch([
      this.db
        .delete(subcategories)
        .where(eq(subcategories.categoryId, categoryId)),
      this.db.delete(categories).where(eq(categories.id, categoryId)),
    ]);
  }

  private deleteTreeQueries(brandId: string): BatchItem<'sqlite'>[] {
    return [
      this.db
        .delete(subcategories)
        .where(
          inArray(
            subcategories.categoryId,
            this.db
              .select({ id: categories.id })
              .from(categories)
              .where(eq(categories.brandId, brandId)),
          ),
        ),
      this.db.delete(categories).where(eq(categories.brandId, brandId)),
    ];
  }

  /**
   * Chạy nhiều câu lệnh nguyên tử: D1 binding (Worker production) dùng db.batch — một transaction.
   * Client HTTP sqlite-proxy (chạy local) không có batch nên chạy tuần tự.
   */
  private async runBatch(queries: BatchItem<'sqlite'>[]): Promise<void> {
    if (queries.length === 0) return;
    if (is(this.db, DrizzleD1Database)) {
      await this.db.batch(
        queries as unknown as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]],
      );
      return;
    }
    for (const query of queries) {
      // Query builder của drizzle là thenable: await để thực thi từng câu lệnh
      await (query as unknown as Promise<unknown>);
    }
  }
}
