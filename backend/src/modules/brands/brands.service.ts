import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  BrandsRepository,
  ProductTaxonomyCount,
} from './repositories/brands.repository';
import {
  CreateBrandDto,
  CategoryDto,
  SubcategoryDto,
  UpdateCategoryItemDto,
  TAXONOMY_SLUG_MAX_LENGTH,
  TAXONOMY_SLUG_PATTERN,
} from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import {
  BrandResponseDto,
  CategoryResponseDto,
} from './dto/brand-response.dto';
import type { NewCategory, NewSubcategory } from './schemas/brand.schema';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode, IErrorCodeDefinition } from '@/common/constants';
import { slugify } from '@/common/utils/string.util';

type CategoryInput = Pick<CategoryDto, 'id' | 'name' | 'slug'> & {
  subcategories?: SubcategoryInput[];
};
type SubcategoryInput = Pick<SubcategoryDto, 'id' | 'name' | 'slug'>;

interface NormalizedTree {
  categories: NewCategory[];
  subcategories: NewSubcategory[];
}

const HAS_PRODUCTS_HINT = 'Hãy chuyển hoặc xóa các sản phẩm trước.';

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
        `Không tìm thấy thương hiệu "${idOrSlug}"`,
        undefined,
        { idOrSlug },
      );
    }
    return brand;
  }

  async create(
    createBrandDto: CreateBrandDto,
  ): Promise<BrandResponseDto | null> {
    const slug = this.resolveSlug(
      createBrandDto.slug,
      createBrandDto.name,
      'thương hiệu',
    );

    const existing = await this.brandsRepository.findBySlug(slug);
    if (existing) {
      throw new BusinessException(
        ErrorCode.BRAND_ALREADY_EXISTS,
        `Slug "${slug}" đã được dùng bởi thương hiệu "${existing.name}"`,
        'slug',
        { slug },
      );
    }

    const brandId = createBrandDto.id || randomUUID();
    const tree = this.normalizeTree(brandId, createBrandDto.categories || []);

    await this.withConstraintErrors(() =>
      this.brandsRepository.createBrandWithTree(
        {
          id: brandId,
          name: createBrandDto.name,
          slug,
          logo: createBrandDto.logo || '',
          logoHtml: createBrandDto.logoHtml || null,
          orderIndex: createBrandDto.orderIndex ?? 0,
        },
        tree.categories,
        tree.subcategories,
      ),
    );

    return this.brandsRepository.findByIdOrSlug(brandId);
  }

  async update(
    idOrSlug: string | number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);

    let slug: string | undefined;
    if (updateBrandDto.slug !== undefined) {
      slug = this.resolveSlug(
        updateBrandDto.slug,
        updateBrandDto.name ?? brand.name,
        'thương hiệu',
      );
      if (slug !== brand.slug) {
        const taken = await this.brandsRepository.findBySlug(slug);
        if (taken && taken.id !== brand.id) {
          throw new BusinessException(
            ErrorCode.BRAND_ALREADY_EXISTS,
            `Slug "${slug}" đã được dùng bởi thương hiệu "${taken.name}"`,
            'slug',
            { slug },
          );
        }
      }
    }

    let tree: NormalizedTree | undefined;
    if (updateBrandDto.categories) {
      tree = this.normalizeTree(brand.id, updateBrandDto.categories);
      await this.assertTreeReplacementKeepsProducts(brand, tree);
    }

    await this.withConstraintErrors(() =>
      this.brandsRepository.updateBrandWithTree(
        brand.id,
        {
          name: updateBrandDto.name,
          slug,
          logo: updateBrandDto.logo,
          logoHtml: updateBrandDto.logoHtml,
          orderIndex: updateBrandDto.orderIndex,
        },
        tree,
      ),
    );

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async remove(idOrSlug: string | number): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);

    const counts = await this.brandsRepository.countProductsByTaxonomy(
      brand.id,
    );
    const productCount = sumCounts(counts);
    if (productCount > 0) {
      throw new BusinessException(
        ErrorCode.BRAND_HAS_PRODUCTS,
        `Không thể xóa thương hiệu ${brand.name}: còn ${productCount} sản phẩm. ${HAS_PRODUCTS_HINT}`,
        undefined,
        { brand: brand.name, productCount },
      );
    }

    await this.withConstraintErrors(
      () => this.brandsRepository.deleteBrandWithTree(brand.id),
      `Không thể xóa thương hiệu ${brand.name}: vẫn còn sản phẩm tham chiếu. ${HAS_PRODUCTS_HINT}`,
    );
    return { message: `Đã xóa thương hiệu "${brand.name}"` };
  }

  async addCategory(
    idOrSlug: string | number,
    categoryDto: CategoryDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);
    const tree = this.normalizeTree(brand.id, [categoryDto]);
    const category = tree.categories[0];

    const existingCat = (brand.categories || []).find(
      (c) => c.slug === category.slug,
    );
    if (existingCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_ALREADY_EXISTS,
        `Danh mục có slug "${category.slug}" đã tồn tại trong thương hiệu "${brand.name}"`,
        'slug',
        { slug: category.slug, brand: brand.name },
      );
    }

    await this.withConstraintErrors(() =>
      this.brandsRepository.insertCategoryWithSubcategories(
        category,
        tree.subcategories,
      ),
    );

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async updateCategory(
    idOrSlug: string | number,
    categorySlug: string,
    dto: UpdateCategoryItemDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);
    const targetCat = this.findCategoryOrThrow(brand, categorySlug);

    let newSlug: string | undefined;
    if (dto.slug !== undefined) {
      newSlug = this.resolveSlug(
        dto.slug,
        dto.name ?? targetCat.name,
        'danh mục cha',
      );
      if (newSlug !== targetCat.slug) {
        const clash = (brand.categories || []).find(
          (c) => c.slug === newSlug && c.id !== targetCat.id,
        );
        if (clash) {
          throw new BusinessException(
            ErrorCode.CATEGORY_ALREADY_EXISTS,
            `Slug "${newSlug}" đã được dùng bởi danh mục "${clash.name}" trong thương hiệu "${brand.name}"`,
            'slug',
            { slug: newSlug, brand: brand.name },
          );
        }
      } else {
        newSlug = undefined;
      }
    }

    let subRows: NewSubcategory[] | undefined;
    if (dto.subcategories) {
      subRows = this.normalizeSubcategories(
        targetCat.id,
        dto.subcategories,
        dto.name ?? targetCat.name,
      );
    }

    // Sản phẩm chỉ lưu slug dạng text: chặn đổi slug / bỏ danh mục con khi còn sản phẩm dùng
    // (an toàn hơn cascade vì không ghi vào bảng products).
    if (newSlug !== undefined || subRows) {
      const counts = await this.brandsRepository.countProductsByTaxonomy(
        brand.id,
      );
      const inCategory = counts.filter(
        (c) => c.categorySlug === targetCat.slug,
      );

      if (newSlug !== undefined) {
        const productCount = sumCounts(inCategory);
        if (productCount > 0) {
          throw new BusinessException(
            ErrorCode.CATEGORY_HAS_PRODUCTS,
            `Không thể đổi slug danh mục "${targetCat.name}" từ "${targetCat.slug}" sang "${newSlug}": còn ${productCount} sản phẩm đang dùng slug cũ. Hãy chuyển các sản phẩm sang danh mục khác trước, hoặc chỉ đổi tên hiển thị.`,
            'slug',
            { category: targetCat.slug, productCount },
          );
        }
      }

      if (subRows) {
        const keptSlugs = new Set(subRows.map((s) => s.slug));
        this.assertNoProductsInRemovedSubcategories(
          targetCat,
          inCategory,
          keptSlugs,
        );
      }
    }

    await this.withConstraintErrors(() =>
      this.brandsRepository.updateCategoryWithSubcategories(
        targetCat.id,
        { name: dto.name, slug: newSlug },
        subRows,
      ),
    );

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async removeCategory(
    idOrSlug: string | number,
    categorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const targetCat = this.findCategoryOrThrow(brand, categorySlug);

    const counts = await this.brandsRepository.countProductsByTaxonomy(
      brand.id,
    );
    const productCount = sumCounts(
      counts.filter((c) => c.categorySlug === targetCat.slug),
    );
    if (productCount > 0) {
      throw new BusinessException(
        ErrorCode.CATEGORY_HAS_PRODUCTS,
        `Không thể xóa danh mục "${targetCat.name}" của ${brand.name}: còn ${productCount} sản phẩm thuộc danh mục này. ${HAS_PRODUCTS_HINT}`,
        undefined,
        { category: targetCat.slug, productCount },
      );
    }

    await this.brandsRepository.deleteCategoryWithSubcategories(targetCat.id);
    return {
      message: `Đã xóa danh mục "${targetCat.name}" khỏi thương hiệu "${brand.name}"`,
    };
  }

  async addSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subDto: SubcategoryDto,
  ): Promise<BrandResponseDto | null> {
    const brand = await this.findOne(idOrSlug);
    const targetCat = this.findCategoryOrThrow(brand, categorySlug);
    const [sub] = this.normalizeSubcategories(
      targetCat.id,
      [subDto],
      targetCat.name,
    );

    const existingSub = (targetCat.subcategories || []).find(
      (s) => s.slug === sub.slug,
    );
    if (existingSub) {
      throw new BusinessException(
        ErrorCode.SUBCATEGORY_ALREADY_EXISTS,
        `Danh mục con có slug "${sub.slug}" đã tồn tại trong danh mục "${targetCat.name}"`,
        'slug',
        { subcategory: sub.slug, category: targetCat.name },
      );
    }

    await this.withConstraintErrors(() =>
      this.brandsRepository.insertSubcategory(sub),
    );

    return this.brandsRepository.findByIdOrSlug(brand.id);
  }

  async removeSubcategory(
    idOrSlug: string | number,
    categorySlug: string,
    subcategorySlug: string,
  ): Promise<{ message: string }> {
    const brand = await this.findOne(idOrSlug);
    const targetCat = this.findCategoryOrThrow(brand, categorySlug);
    const cleanSubSlug = subcategorySlug.toLowerCase().trim();

    const targetSub = (targetCat.subcategories || []).find(
      (s) => s.slug === cleanSubSlug,
    );
    if (!targetSub) {
      throw new BusinessException(
        ErrorCode.SUBCATEGORY_NOT_FOUND,
        `Không tìm thấy danh mục con "${subcategorySlug}" trong danh mục "${targetCat.name}"`,
        undefined,
        { subcategory: subcategorySlug, category: targetCat.name },
      );
    }

    const counts = await this.brandsRepository.countProductsByTaxonomy(
      brand.id,
    );
    const productCount = sumCounts(
      counts.filter(
        (c) =>
          c.categorySlug === targetCat.slug &&
          c.subcategorySlug === targetSub.slug,
      ),
    );
    if (productCount > 0) {
      throw new BusinessException(
        ErrorCode.SUBCATEGORY_HAS_PRODUCTS,
        `Không thể xóa danh mục con "${targetSub.name}" (danh mục "${targetCat.name}"): còn ${productCount} sản phẩm thuộc danh mục con này. ${HAS_PRODUCTS_HINT}`,
        undefined,
        {
          category: targetCat.slug,
          subcategory: targetSub.slug,
          productCount,
        },
      );
    }

    await this.brandsRepository.deleteSubcategory(targetSub.id);
    return {
      message: `Đã xóa danh mục con "${targetSub.name}" khỏi danh mục "${targetCat.name}"`,
    };
  }

  // --- Helpers ---

  private findCategoryOrThrow(
    brand: BrandResponseDto,
    categorySlug: string,
  ): CategoryResponseDto {
    const cleanCatSlug = categorySlug.toLowerCase().trim();
    const targetCat = (brand.categories || []).find(
      (c) => c.slug === cleanCatSlug,
    );
    if (!targetCat) {
      throw new BusinessException(
        ErrorCode.CATEGORY_NOT_FOUND,
        `Không tìm thấy danh mục "${categorySlug}" trong thương hiệu "${brand.name}"`,
        undefined,
        { category: categorySlug, brand: brand.name },
      );
    }
    return targetCat;
  }

  /**
   * Slug cuối cùng sau khi chuẩn hóa: dùng slug nhập vào, để trống thì sinh từ tên.
   * Ném 400 nếu kết quả rỗng / sai định dạng (VD tên chỉ gồm ký tự đặc biệt).
   */
  private resolveSlug(
    slug: string | undefined | null,
    name: string | undefined | null,
    label: string,
  ): string {
    const source = typeof slug === 'string' && slug.trim() ? slug : name || '';
    const result = slugify(source);
    if (!result || !TAXONOMY_SLUG_PATTERN.test(result)) {
      throw new BusinessException(
        ErrorCode.BRAND_VALIDATION_ERROR,
        `Slug ${label} không hợp lệ cho "${source}": cần có ít nhất một chữ cái hoặc chữ số (không dấu)`,
        'slug',
        { value: source },
      );
    }
    if (result.length > TAXONOMY_SLUG_MAX_LENGTH) {
      throw new BusinessException(
        ErrorCode.BRAND_VALIDATION_ERROR,
        `Slug ${label} tối đa ${TAXONOMY_SLUG_MAX_LENGTH} ký tự`,
        'slug',
        { value: result },
      );
    }
    return result;
  }

  /** Sinh id/slug cho cả cây và chặn slug trùng trong payload (400) trước khi ghi DB */
  private normalizeTree(
    brandId: string,
    categories: CategoryInput[],
  ): NormalizedTree {
    const seen = new Set<string>();
    const categoryRows: NewCategory[] = [];
    const subcategoryRows: NewSubcategory[] = [];

    for (const cat of categories) {
      const slug = this.resolveSlug(cat.slug, cat.name, 'danh mục cha');
      if (seen.has(slug)) {
        throw new BusinessException(
          ErrorCode.BRAND_VALIDATION_ERROR,
          `Danh mục cha bị trùng slug "${slug}" trong dữ liệu gửi lên`,
          'categories',
          { slug },
        );
      }
      seen.add(slug);
      const id = cat.id || randomUUID();
      categoryRows.push({ id, brandId, name: cat.name, slug });
      subcategoryRows.push(
        ...this.normalizeSubcategories(id, cat.subcategories || [], cat.name),
      );
    }

    return { categories: categoryRows, subcategories: subcategoryRows };
  }

  private normalizeSubcategories(
    categoryId: string,
    subcategories: SubcategoryInput[],
    categoryName: string,
  ): NewSubcategory[] {
    const seen = new Set<string>();
    return subcategories.map((sub) => {
      const slug = this.resolveSlug(sub.slug, sub.name, 'danh mục con');
      if (seen.has(slug)) {
        throw new BusinessException(
          ErrorCode.BRAND_VALIDATION_ERROR,
          `Danh mục con bị trùng slug "${slug}" trong danh mục "${categoryName}"`,
          'subcategories',
          { slug, category: categoryName },
        );
      }
      seen.add(slug);
      return { id: sub.id || randomUUID(), categoryId, name: sub.name, slug };
    });
  }

  /** Thay cả cây danh mục: không được bỏ danh mục / danh mục con nào còn sản phẩm */
  private async assertTreeReplacementKeepsProducts(
    brand: BrandResponseDto,
    tree: NormalizedTree,
  ): Promise<void> {
    const counts = await this.brandsRepository.countProductsByTaxonomy(
      brand.id,
    );
    if (counts.length === 0) return;

    const newCats = new Map(tree.categories.map((c) => [c.slug, c]));
    for (const oldCat of brand.categories || []) {
      const inCategory = counts.filter((c) => c.categorySlug === oldCat.slug);
      const newCat = newCats.get(oldCat.slug);
      if (!newCat) {
        const productCount = sumCounts(inCategory);
        if (productCount > 0) {
          throw new BusinessException(
            ErrorCode.CATEGORY_HAS_PRODUCTS,
            `Không thể bỏ danh mục "${oldCat.name}" khỏi thương hiệu ${brand.name}: còn ${productCount} sản phẩm thuộc danh mục này. ${HAS_PRODUCTS_HINT}`,
            'categories',
            { category: oldCat.slug, productCount },
          );
        }
        continue;
      }
      const keptSlugs = new Set(
        tree.subcategories
          .filter((s) => s.categoryId === newCat.id)
          .map((s) => s.slug),
      );
      this.assertNoProductsInRemovedSubcategories(
        oldCat,
        inCategory,
        keptSlugs,
      );
    }
  }

  private assertNoProductsInRemovedSubcategories(
    category: CategoryResponseDto,
    countsInCategory: ProductTaxonomyCount[],
    keptSlugs: Set<string>,
  ): void {
    for (const oldSub of category.subcategories || []) {
      if (keptSlugs.has(oldSub.slug)) continue;
      const productCount = sumCounts(
        countsInCategory.filter((c) => c.subcategorySlug === oldSub.slug),
      );
      if (productCount > 0) {
        throw new BusinessException(
          ErrorCode.SUBCATEGORY_HAS_PRODUCTS,
          `Không thể bỏ danh mục con "${oldSub.name}" (danh mục "${category.name}"): còn ${productCount} sản phẩm thuộc danh mục con này. ${HAS_PRODUCTS_HINT}`,
          'subcategories',
          {
            category: category.slug,
            subcategory: oldSub.slug,
            productCount,
          },
        );
      }
    }
  }

  /**
   * Lưới an toàn khi kiểm tra trước bị vượt qua (ghi đồng thời): đổi lỗi ràng buộc của SQLite
   * thành lỗi nghiệp vụ 409 có thông điệp tiếng Việt thay vì 500.
   */
  private async withConstraintErrors<T>(
    write: () => Promise<T>,
    foreignKeyMessage?: string,
  ): Promise<T> {
    try {
      return await write();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let def: IErrorCodeDefinition | undefined;
      let text = '';
      if (/UNIQUE constraint failed/i.test(message)) {
        def = /subcategories/i.test(message)
          ? ErrorCode.SUBCATEGORY_ALREADY_EXISTS
          : /categories/i.test(message)
            ? ErrorCode.CATEGORY_ALREADY_EXISTS
            : ErrorCode.BRAND_ALREADY_EXISTS;
        text =
          'Dữ liệu bị trùng (slug hoặc ID đã tồn tại). Hãy tải lại trang và thử slug khác.';
      } else if (/FOREIGN KEY constraint failed/i.test(message)) {
        def = ErrorCode.BRAND_HAS_PRODUCTS;
        text =
          foreignKeyMessage ||
          `Không thể lưu vì dữ liệu đang được sản phẩm tham chiếu. ${HAS_PRODUCTS_HINT}`;
      }
      if (def) throw new BusinessException(def, text);
      throw error;
    }
  }
}

function sumCounts(counts: ProductTaxonomyCount[]): number {
  return counts.reduce((acc, c) => acc + c.count, 0);
}
