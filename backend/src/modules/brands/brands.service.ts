import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { eq, or } from 'drizzle-orm';
import { D1_DATABASE } from '../../database/d1.constants';
import type { D1Database } from '../../database/d1.client';
import { brands, categories, subcategories } from './schemas/brand.schema';
import {
  CreateBrandDto,
  CategoryDto,
  SubcategoryDto,
  UpdateCategoryItemDto,
} from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { removeDiacritics } from '@/common/utils/string.util';
import type { IBrand } from './types/brand.types';

@Injectable()
export class BrandsService {
  constructor(
    @Inject(D1_DATABASE) private readonly db: D1Database,
  ) {}

  async findAll(): Promise<any[]> {
    const brandRows = await this.db.query.brands.findMany({
      orderBy: (brands, { asc }) => [asc(brands.orderIndex), asc(brands.name)],
      with: {
        categories: {
          with: {
            subcategories: true,
          },
        },
      },
    });

    return brandRows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      logoHtml: b.logoHtml || undefined,
      orderIndex: b.orderIndex ?? 0,
      categories: (b.categories || []).map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        subcategories: (c.subcategories || []).map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
        })),
      })),
    }));
  }

  async findOne(idOrSlug: string | number): Promise<any> {
    const rawVal = String(idOrSlug).trim();
    const cleanSlug = rawVal.toLowerCase();

    const brand = await this.db.query.brands.findFirst({
      where: or(eq(brands.id, rawVal), eq(brands.slug, cleanSlug)),
      with: {
        categories: {
          with: {
            subcategories: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand not found: ${idOrSlug}`);
    }

    return {
      id: brand.id,
      _id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      logoHtml: brand.logoHtml,
      orderIndex: brand.orderIndex,
      categories: (brand.categories || []).map((c) => ({
        id: c.id,
        _id: c.id,
        name: c.name,
        slug: c.slug,
        subcategories: (c.subcategories || []).map((s) => ({
          id: s.id,
          _id: s.id,
          name: s.name,
          slug: s.slug,
        })),
      })),
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }

  async create(createBrandDto: CreateBrandDto): Promise<any> {
    const cleanSlug = (
      createBrandDto.slug ||
      removeDiacritics(createBrandDto.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
    ).trim();

    const existing = await this.db.query.brands.findFirst({
      where: eq(brands.slug, cleanSlug),
    });

    if (existing) {
      throw new ConflictException(
        `Brand with slug "${cleanSlug}" already exists`,
      );
    }

    const brandId = randomUUID();
    await this.db.insert(brands).values({
      id: brandId,
      name: createBrandDto.name.trim(),
      slug: cleanSlug,
      logo: createBrandDto.logo || '',
      logoHtml: createBrandDto.logoHtml || null,
      orderIndex: typeof createBrandDto.id === 'number' ? createBrandDto.id : 0,
    });

    if (createBrandDto.categories && createBrandDto.categories.length > 0) {
      for (const catDto of createBrandDto.categories) {
        const catSlug = (
          catDto.slug ||
          removeDiacritics(catDto.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
        ).trim();

        const catId = randomUUID();
        await this.db.insert(categories).values({
          id: catId,
          brandId,
          name: catDto.name.trim(),
          slug: catSlug,
        });

        if (catDto.subcategories && catDto.subcategories.length > 0) {
          for (const subDto of catDto.subcategories) {
            const subSlug = (
              subDto.slug ||
              removeDiacritics(subDto.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
            ).trim();

            const subId = randomUUID();
            await this.db.insert(subcategories).values({
              id: subId,
              categoryId: catId,
              name: subDto.name.trim(),
              slug: subSlug,
            });
          }
        }
      }
    }

    return this.findOne(brandId);
  }

  async update(
    idOrSlug: string | number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<any> {
    const current = await this.findOne(idOrSlug);
    const updateData: Partial<typeof brands.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (updateBrandDto.name) updateData.name = updateBrandDto.name.trim();
    if (updateBrandDto.slug) updateData.slug = updateBrandDto.slug.toLowerCase().trim();
    if (updateBrandDto.logo !== undefined) updateData.logo = updateBrandDto.logo;
    if (updateBrandDto.logoHtml !== undefined) updateData.logoHtml = updateBrandDto.logoHtml;

    await this.db
      .update(brands)
      .set(updateData)
      .where(eq(brands.id, current.id));

    if (updateBrandDto.categories) {
      // Delete old categories (cascade deletes subcategories in SQLite)
      await this.db.delete(categories).where(eq(categories.brandId, current.id));

      for (const catDto of updateBrandDto.categories) {
        const catSlug = (
          catDto.slug ||
          removeDiacritics(catDto.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
        ).trim();

        const catId = randomUUID();
        await this.db.insert(categories).values({
          id: catId,
          brandId: current.id,
          name: catDto.name.trim(),
          slug: catSlug,
        });

        if (catDto.subcategories && catDto.subcategories.length > 0) {
          for (const subDto of catDto.subcategories) {
            const subSlug = (
              subDto.slug ||
              removeDiacritics(subDto.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
            ).trim();

            const subId = randomUUID();
            await this.db.insert(subcategories).values({
              id: subId,
              categoryId: catId,
              name: subDto.name.trim(),
              slug: subSlug,
            });
          }
        }
      }
    }

    return this.findOne(current.id);
  }

  async remove(idOrSlug: string | number): Promise<{ message: string }> {
    const current = await this.findOne(idOrSlug);
    await this.db.delete(brands).where(eq(brands.id, current.id));
    return { message: `Brand "${current.name}" deleted successfully` };
  }

  // --- Sub-resource: Category CRUD inside Brand ---

  async addCategory(
    idOrSlug: string | number,
    categoryDto: CategoryDto,
  ): Promise<any> {
    const brand = await this.findOne(idOrSlug);
    const cSlug = (
      categoryDto.slug ||
      removeDiacritics(categoryDto.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
    ).trim();

    const existingCat = (brand.categories || []).find(
      (c: any) => c.slug === cSlug,
    );
    if (existingCat) {
      throw new ConflictException(
        `Category with slug "${cSlug}" already exists in brand "${brand.name}"`,
      );
    }

    const catId = randomUUID();
    await this.db.insert(categories).values({
      id: catId,
      brandId: brand.id,
      name: categoryDto.name.trim(),
      slug: cSlug,
    });

    if (categoryDto.subcategories && categoryDto.subcategories.length > 0) {
      for (const subDto of categoryDto.subcategories) {
        const subSlug = (
          subDto.slug ||
          removeDiacritics(subDto.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
        ).trim();

        const subId = randomUUID();
        await this.db.insert(subcategories).values({
          id: subId,
          categoryId: catId,
          name: subDto.name.trim(),
          slug: subSlug,
        });
      }
    }

    return this.findOne(brand.id);
  }

  async updateCategory(
    idOrSlug: string | number,
    categorySlug: string,
    dto: UpdateCategoryItemDto,
  ): Promise<any> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();

    const targetCat = (brand.categories || []).find(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (!targetCat) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    const updateData: Partial<typeof categories.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.slug) updateData.slug = dto.slug.toLowerCase().trim();

    await this.db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, targetCat.id));

    if (dto.subcategories) {
      await this.db
        .delete(subcategories)
        .where(eq(subcategories.categoryId, targetCat.id));

      for (const subDto of dto.subcategories) {
        const subSlug = (
          subDto.slug ||
          removeDiacritics(subDto.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
        ).trim();

        const subId = randomUUID();
        await this.db.insert(subcategories).values({
          id: subId,
          categoryId: targetCat.id,
          name: subDto.name.trim(),
          slug: subSlug,
        });
      }
    }

    return this.findOne(brand.id);
  }

  async removeCategory(
    idOrSlug: string | number,
    categorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();

    const targetCat = (brand.categories || []).find(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (!targetCat) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    await this.db.delete(categories).where(eq(categories.id, targetCat.id));

    return {
      message: `Category "${categorySlug}" removed from brand "${brand.name}" successfully`,
    };
  }

  // --- Sub-resource: Subcategory CRUD inside Category of Brand ---

  async addSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subDto: SubcategoryDto,
  ): Promise<any> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();
    const cleanSubSlug = (
      subDto.slug ||
      removeDiacritics(subDto.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
    ).trim();

    const targetCat = (brand.categories || []).find(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (!targetCat) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    const existingSub = (targetCat.subcategories || []).find(
      (s: any) => s.slug === cleanSubSlug,
    );
    if (existingSub) {
      throw new ConflictException(
        `Subcategory "${cleanSubSlug}" already exists in category "${targetCat.name}"`,
      );
    }

    const subId = randomUUID();
    await this.db.insert(subcategories).values({
      id: subId,
      categoryId: targetCat.id,
      name: subDto.name.trim(),
      slug: cleanSubSlug,
    });

    return this.findOne(brand.id);
  }

  async removeSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subcategorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();
    const cleanSubSlug = subcategorySlug.toLowerCase().trim();

    const targetCat = (brand.categories || []).find(
      (c: any) => c.slug?.toLowerCase() === cleanCatSlug,
    );
    if (!targetCat) {
      throw new NotFoundException(
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
      );
    }

    const targetSub = (targetCat.subcategories || []).find(
      (s: any) => s.slug?.toLowerCase() === cleanSubSlug,
    );
    if (!targetSub) {
      throw new NotFoundException(
        `Subcategory "${subcategorySlug}" not found in category "${targetCat.name}"`,
      );
    }

    await this.db.delete(subcategories).where(eq(subcategories.id, targetSub.id));

    return {
      message: `Subcategory "${subcategorySlug}" removed from category "${categorySlug}" successfully`,
    };
  }
}
