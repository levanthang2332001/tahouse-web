import { Injectable } from '@nestjs/common';
import { BrandsRepository } from './repositories/brands.repository';
import {
  CreateBrandDto,
  CategoryDto,
  SubcategoryDto,
  UpdateCategoryItemDto,
} from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode } from '@/common/constants';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async findAll(): Promise<BrandResponseDto[]> {
    return this.brandsRepository.findAll();
  }

  async findOne(idOrSlug: string | number): Promise<BrandResponseDto> {
    const brand = await this.brandsRepository.findByIdOrSlug(String(idOrSlug));
    if (!brand) {
      throw new BusinessException(
        ErrorCode.BRAND_NOT_FOUND,
        `Brand not found: ${idOrSlug}`,
        undefined,
        { idOrSlug },
      );
    }
    return brand;
  }

  async create(
    createBrandDto: CreateBrandDto,
  ): Promise<BrandResponseDto | null> {
    const existing = await this.brandsRepository.findBySlug(
      createBrandDto.slug!,
    );
    if (existing) {
      throw new BusinessException(
        ErrorCode.BRAND_ALREADY_EXISTS,
        `Brand with slug "${createBrandDto.slug}" already exists`,
        undefined,
        { slug: createBrandDto.slug },
      );
    }

    const brandId = createBrandDto.id!;
    await this.brandsRepository.insertBrand({
      id: brandId,
      name: createBrandDto.name,
      slug: createBrandDto.slug!,
      logo: createBrandDto.logo || '',
      logoHtml: createBrandDto.logoHtml || null,
      orderIndex: createBrandDto.orderIndex ?? 0,
    });

    if (createBrandDto.categories?.length) {
      await this.persistCategoriesHierarchy(brandId, createBrandDto.categories);
    }

    return this.brandsRepository.findByIdOrSlug(brandId);
  }

  async update(
    idOrSlug: string | number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);

    await this.brandsRepository.updateBrand(brand.id, {
      name: updateBrandDto.name,
      slug: updateBrandDto.slug,
      logo: updateBrandDto.logo,
      logoHtml: updateBrandDto.logoHtml,
      orderIndex: updateBrandDto.orderIndex,
    });

    if (updateBrandDto.categories) {
      await this.brandsRepository.deleteCategoriesByBrandId(brand.id);
      await this.persistCategoriesHierarchy(
        brand.id,
        updateBrandDto.categories,
      );
    }

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async remove(idOrSlug: string | number): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    await this.brandsRepository.deleteBrand(brand.id);
    return { message: `Brand "${brand.name}" deleted successfully` };
  }

  async addCategory(
    idOrSlug: string | number,
    categoryDto: CategoryDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);
    const cSlug = categoryDto.slug!;

    const existingCat = (brand.categories || []).find((c) => c.slug === cSlug);
    if (existingCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_ALREADY_EXISTS,
        `Category with slug "${cSlug}" already exists in brand "${brand.name}"`,
        undefined,
        { slug: cSlug, brand: brand.name },
      );
    }

    await this.brandsRepository.insertCategory({
      id: categoryDto.id!,
      brandId: brand.id,
      name: categoryDto.name,
      slug: cSlug,
    });

    if (categoryDto.subcategories?.length) {
      const subcategoriesToInsert = categoryDto.subcategories.map((sub) => ({
        id: sub.id,
        categoryId: categoryDto.id!,
        name: sub.name,
        slug: sub.slug!,
      }));
      await this.brandsRepository.insertSubcategoriesBatch(
        subcategoriesToInsert,
      );
    }

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async updateCategory(
    idOrSlug: string | number,
    categorySlug: string,
    dto: UpdateCategoryItemDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();

    const targetCat = (brand.categories || []).find(
      (c) => c.slug === cleanCatSlug,
    );
    if (!targetCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_NOT_FOUND,
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
        undefined,
        { category: categorySlug, brand: brand.name },
      );
    }

    await this.brandsRepository.updateCategory(targetCat.id, {
      name: dto.name,
      slug: dto.slug,
    });

    if (dto.subcategories) {
      await this.brandsRepository.deleteSubcategoriesByCategoryId(targetCat.id);
      const subcategoriesToInsert = dto.subcategories.map((sub) => ({
        id: sub.id,
        categoryId: targetCat.id,
        name: sub.name,
        slug: sub.slug!,
      }));
      await this.brandsRepository.insertSubcategoriesBatch(
        subcategoriesToInsert,
      );
    }

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async removeCategory(
    idOrSlug: string | number,
    categorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();

    const targetCat = (brand.categories || []).find(
      (c) => c.slug === cleanCatSlug,
    );
    if (!targetCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_NOT_FOUND,
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
        undefined,
        { category: categorySlug, brand: brand.name },
      );
    }

    await this.brandsRepository.deleteCategory(targetCat.id);
    return {
      message: `Category "${categorySlug}" removed from brand "${brand.name}" successfully`,
    };
  }

  async addSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subDto: SubcategoryDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);
    const cleanCatSlug = categorySlug.toLowerCase().trim();
    const cleanSubSlug = subDto.slug!;

    const targetCat = (brand.categories || []).find(
      (c) => c.slug === cleanCatSlug,
    );
    if (!targetCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_NOT_FOUND,
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
        undefined,
        { category: categorySlug, brand: brand.name },
      );
    }

    const existingSub = (targetCat.subcategories || []).find(
      (s) => s.slug === cleanSubSlug,
    );
    if (existingSub) {
      throw new BusinessException(
        ErrorCode.SUBCATEGORY_ALREADY_EXISTS,
        `Subcategory "${cleanSubSlug}" already exists in category "${targetCat.name}"`,
        undefined,
        { subcategory: cleanSubSlug, category: targetCat.name },
      );
    }

    await this.brandsRepository.insertSubcategory({
      id: subDto.id,
      categoryId: targetCat.id,
      name: subDto.name,
      slug: cleanSubSlug,
    });

    return this.brandsRepository.findByIdOrSlug(brand.id);
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
      (c) => c.slug === cleanCatSlug,
    );
    if (!targetCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_NOT_FOUND,
        `Category "${categorySlug}" not found in brand "${brand.name}"`,
        undefined,
        { category: categorySlug, brand: brand.name },
      );
    }

    const targetSub = (targetCat.subcategories || []).find(
      (s) => s.slug === cleanSubSlug,
    );
    if (!targetSub) {
      throw new BusinessException(
        ErrorCode.SUBCATEGORY_NOT_FOUND,
        `Subcategory "${subcategorySlug}" not found in category "${targetCat.name}"`,
        undefined,
        { subcategory: subcategorySlug, category: targetCat.name },
      );
    }

    await this.brandsRepository.deleteSubcategory(targetSub.id);
    return {
      message: `Subcategory "${subcategorySlug}" removed from category "${categorySlug}" successfully`,
    };
  }

  /**
   * Helper chèn toàn bộ cây category & subcategory theo cơ chế Batch Insert (1-2 query duy nhất)
   */
  private async persistCategoriesHierarchy(
    brandId: string,
    categories: CategoryDto[],
  ): Promise<void> {
    if (!categories || categories.length === 0) return;

    const categoriesToInsert = categories.map((cat) => ({
      id: cat.id!,
      brandId,
      name: cat.name,
      slug: cat.slug!,
    }));

    const subcategoriesToInsert = categories.flatMap((cat) =>
      (cat.subcategories || []).map((sub) => ({
        id: sub.id,
        categoryId: cat.id!,
        name: sub.name,
        slug: sub.slug!,
      })),
    );

    await this.brandsRepository.insertCategoriesBatch(categoriesToInsert);
    if (subcategoriesToInsert.length > 0) {
      await this.brandsRepository.insertSubcategoriesBatch(
        subcategoriesToInsert,
      );
    }
  }
}
