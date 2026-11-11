import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { BrandsRepository } from '../brands/repositories/brands.repository';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetInstallationMediaDto } from './dto/get-installation-media.dto';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode } from '@/common/constants';
import { slugify } from '@/common/utils/string.util';
import type {
  IProduct,
  IProductRecord,
  IProductsListResponse,
} from './types/product.types';

interface TaxonomyInput {
  brandId: string;
  category: string;
  subcategory?: string | null;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly brandsRepository: BrandsRepository,
  ) {}

  private cachedRawProducts: any[] | null = null;
  private cachedRawProductsAt = 0;
  private readonly CACHE_TTL_MS = 3 * 60 * 1000;

  async getRawProducts(): Promise<any[]> {
    const now = Date.now();
    if (
      this.cachedRawProducts &&
      now - this.cachedRawProductsAt < this.CACHE_TTL_MS
    ) {
      return this.cachedRawProducts;
    }
    const products = await this.productsRepository.findAllRaw();
    this.cachedRawProducts = products;
    this.cachedRawProductsAt = now;
    return products;
  }

  clearRawProductsCache(): void {
    this.cachedRawProducts = null;
    this.cachedRawProductsAt = 0;
  }

  async findAll(query: GetProductsDto): Promise<IProductsListResponse> {
    return this.productsRepository.findAllPaginated(query);
  }

  /** Public detail (no admin-only fields). */
  async findOne(idOrCode: string): Promise<IProduct> {
    return (await this.findRecordOrThrow(idOrCode)).product;
  }

  /** Admin edit form: also returns full installation media and priority so a save round-trips them. */
  async findOneForAdmin(idOrCode: string): Promise<IProduct> {
    return (await this.findRecordOrThrow(idOrCode, true)).product;
  }

  async getInstallationMedia(idOrCode: string, query: GetInstallationMediaDto) {
    const { product } = await this.findRecordOrThrow(idOrCode, true);
    return this.productsRepository.findInstallationMedia(product, query);
  }

  async create(dto: CreateProductDto): Promise<IProduct> {
    if (!dto.brandId) {
      throw new BusinessException(
        ErrorCode.PRODUCT_VALIDATION_ERROR,
        'Vui lòng chọn thương hiệu cho sản phẩm',
        'brandId',
      );
    }
    if (!dto.category?.trim()) {
      throw new BusinessException(
        ErrorCode.PRODUCT_VALIDATION_ERROR,
        'Vui lòng chọn danh mục chính cho sản phẩm',
        'category',
      );
    }

    // 1. Slug: admin-provided (slug, then id) wins, otherwise derived from the product code
    const slug = dto.slug || dto.id || slugify(dto.code);
    if (!slug) {
      throw new BusinessException(
        ErrorCode.PRODUCT_VALIDATION_ERROR,
        'Không tạo được ID/slug từ mã sản phẩm, vui lòng nhập ID/slug',
        'id',
      );
    }

    // 2. Fast fail: duplicate code/slug (case-insensitive)
    await this.assertCodeAvailable(dto.code);
    await this.assertSlugAvailable(slug);

    // 3. Brand hierarchy (canonical slugs from the brand tree are stored)
    const taxonomy = await this.validateTaxonomy({
      brandId: dto.brandId,
      category: dto.category,
      subcategory: dto.subcategory,
    });

    const input: CreateProductDto & { slug: string } = {
      ...dto,
      slug,
      category: taxonomy.category,
      subcategory: taxonomy.subcategory,
    };
    delete input.id;
    const product = await this.runWrite(() =>
      this.productsRepository.createProduct(input),
    );
    this.clearRawProductsCache();
    if (!product) {
      throw new BusinessException(
        ErrorCode.PRODUCT_NOT_FOUND,
        'Đã gửi lệnh tạo nhưng không đọc lại được sản phẩm, vui lòng tải lại danh sách để kiểm tra',
        undefined,
        { slug },
      );
    }
    return product;
  }

  async update(idOrCode: string, dto: UpdateProductDto): Promise<IProduct> {
    // 1. Product must exist; every write below uses its real DB id, never the public slug id
    const { dbId, product: current } = await this.findRecordOrThrow(idOrCode);

    // 2. Slug change (via `slug`, or `id` which the admin form sends): only when it really differs
    const requestedSlug = dto.slug ?? dto.id;
    let nextSlug: string | undefined;
    if (requestedSlug !== undefined && requestedSlug !== null) {
      if (!requestedSlug) {
        throw new BusinessException(
          ErrorCode.PRODUCT_VALIDATION_ERROR,
          'ID/slug không được để trống',
          'id',
        );
      }
      if (requestedSlug.toLowerCase() !== current.slug.toLowerCase()) {
        nextSlug = requestedSlug;
      }
    }

    // 3. Fast fail: duplicate code/slug (case-insensitive, excluding this product by DB id)
    if (dto.code) await this.assertCodeAvailable(dto.code, dbId);
    if (nextSlug) await this.assertSlugAvailable(nextSlug, dbId);

    // 4. Price: merge incoming with DB values (catches partial updates). null price = "Liên hệ" (0),
    //    null originalPrice clears it.
    const isPriceChanging =
      dto.price !== undefined || dto.originalPrice !== undefined;
    if (isPriceChanging) {
      const nextPrice =
        dto.price !== undefined ? (dto.price ?? 0) : current.price;
      const nextOriginalPrice =
        dto.originalPrice !== undefined
          ? dto.originalPrice
          : current.originalPrice;

      if (
        typeof nextPrice === 'number' &&
        typeof nextOriginalPrice === 'number' &&
        nextPrice > nextOriginalPrice
      ) {
        const field = dto.price !== undefined ? 'price' : 'originalPrice';
        throw new BusinessException(
          ErrorCode.PRODUCT_INVALID_PRICE,
          field === 'price'
            ? `Giá bán (${nextPrice}) không được lớn hơn giá gốc (${nextOriginalPrice})`
            : `Giá gốc (${nextOriginalPrice}) không được nhỏ hơn giá bán hiện tại (${nextPrice})`,
          field,
          { price: nextPrice, originalPrice: nextOriginalPrice },
        );
      }
    }

    // 5. Brand hierarchy (only when any hierarchy field changes)
    const isBrandHierarchyChanging =
      dto.brandId !== undefined ||
      dto.category !== undefined ||
      dto.subcategory !== undefined;

    const changes: UpdateProductDto = { ...dto };
    delete changes.id;
    delete changes.slug;
    if (nextSlug) changes.slug = nextSlug;

    if (isBrandHierarchyChanging) {
      const effectiveBrandId = dto.brandId ?? current.brandId;
      const effectiveCategory = dto.category ?? current.category;
      if (!effectiveBrandId) {
        throw new BusinessException(
          ErrorCode.PRODUCT_VALIDATION_ERROR,
          'Vui lòng chọn thương hiệu cho sản phẩm',
          'brandId',
        );
      }
      if (!effectiveCategory) {
        throw new BusinessException(
          ErrorCode.PRODUCT_VALIDATION_ERROR,
          'Vui lòng chọn danh mục chính cho sản phẩm',
          'category',
        );
      }
      const taxonomy = await this.validateTaxonomy({
        brandId: String(effectiveBrandId),
        category: effectiveCategory,
        // "" clears the subcategory, so only fall back to the current one when the field is absent
        subcategory:
          dto.subcategory !== undefined ? dto.subcategory : current.subcategory,
      });
      if (dto.category !== undefined) changes.category = taxonomy.category;
      if (dto.subcategory !== undefined && dto.subcategory) {
        changes.subcategory = taxonomy.subcategory;
      }
    }

    const result = await this.runWrite(() =>
      this.productsRepository.updateProduct(dbId, changes),
    );
    this.clearRawProductsCache();
    if (!result) {
      throw new BusinessException(
        ErrorCode.PRODUCT_NOT_FOUND,
        `Không cập nhật được: sản phẩm "${current.name}" không còn tồn tại (có thể đã bị xóa)`,
        undefined,
        { idOrCode },
      );
    }
    return result;
  }

  async remove(idOrCode: string): Promise<{ message: string }> {
    const { dbId, product: current } = await this.findRecordOrThrow(idOrCode);
    const deleted = await this.runWrite(() =>
      this.productsRepository.deleteProduct(dbId),
    );
    this.clearRawProductsCache();
    if (!deleted) {
      throw new BusinessException(
        ErrorCode.PRODUCT_NOT_FOUND,
        `Không xóa được: sản phẩm "${current.name}" không còn tồn tại (có thể đã bị xóa trước đó)`,
        undefined,
        { idOrCode },
      );
    }
    return {
      message: `Đã xóa sản phẩm "${current.name}" (${current.code})`,
    };
  }

  private async findRecordOrThrow(
    idOrCode: string,
    includeAdminFields = false,
  ): Promise<IProductRecord> {
    const record = await this.productsRepository.findRecordByIdOrCode(
      idOrCode,
      { includeAdminFields },
    );
    if (!record) {
      throw new BusinessException(
        ErrorCode.PRODUCT_NOT_FOUND,
        `Không tìm thấy sản phẩm "${idOrCode}"`,
        undefined,
        { idOrCode },
      );
    }
    return record;
  }

  private async assertCodeAvailable(code: string, excludeDbId?: string) {
    const duplicate = excludeDbId
      ? await this.productsRepository.findOtherByCode(code, excludeDbId)
      : await this.productsRepository.findByCode(code);
    if (duplicate) {
      throw new BusinessException(
        ErrorCode.PRODUCT_ALREADY_EXISTS,
        `Mã sản phẩm "${code}" đã được dùng cho sản phẩm khác`,
        'code',
        { code },
      );
    }
  }

  private async assertSlugAvailable(slug: string, excludeDbId?: string) {
    const duplicate = excludeDbId
      ? await this.productsRepository.findOtherBySlug(slug, excludeDbId)
      : await this.productsRepository.findBySlug(slug);
    if (duplicate) {
      throw new BusinessException(
        ErrorCode.PRODUCT_ALREADY_EXISTS,
        `ID/slug "${slug}" đã được dùng cho sản phẩm khác`,
        'id',
        { slug },
      );
    }
  }

  /**
   * Brand must exist, the category must belong to it and the subcategory (if any) to that category.
   * Returns the canonical slugs from the brand tree (the input may be a name or differ in case).
   */
  private async validateTaxonomy(
    input: TaxonomyInput,
  ): Promise<{ category: string; subcategory?: string }> {
    const brand = await this.brandsRepository.findBrandById(input.brandId);
    if (!brand) {
      throw new BusinessException(
        ErrorCode.BRAND_NOT_FOUND,
        `Không tìm thấy thương hiệu đã chọn (brandId: ${input.brandId})`,
        'brandId',
        { brandId: input.brandId },
      );
    }

    const category = await this.brandsRepository.findCategoryInBrand(
      brand.id,
      input.category,
    );
    if (!category) {
      throw new BusinessException(
        ErrorCode.CATEGORY_NOT_FOUND,
        `Danh mục "${input.category}" chưa có trong thương hiệu "${brand.name}"`,
        'category',
        { category: input.category, brand: brand.name },
      );
    }

    if (!input.subcategory) return { category: category.slug };

    const subcategory = await this.brandsRepository.findSubcategoryInCategory(
      category.id,
      input.subcategory,
    );
    if (!subcategory) {
      throw new BusinessException(
        ErrorCode.SUBCATEGORY_NOT_FOUND,
        `Danh mục phụ "${input.subcategory}" chưa có trong danh mục "${category.name}"`,
        'subcategory',
        { subcategory: input.subcategory, category: category.name },
      );
    }
    return { category: category.slug, subcategory: subcategory.slug };
  }

  /** Translates DB constraint failures (lost races with the checks above) into clear 4xx errors. */
  private async runWrite<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/UNIQUE constraint failed/i.test(message)) {
        throw new BusinessException(
          ErrorCode.PRODUCT_ALREADY_EXISTS,
          'Mã sản phẩm hoặc ID/slug đã được dùng cho sản phẩm khác',
        );
      }
      if (/FOREIGN KEY constraint failed/i.test(message)) {
        throw new BusinessException(
          ErrorCode.BRAND_NOT_FOUND,
          'Thương hiệu đã chọn không còn tồn tại',
          'brandId',
        );
      }
      throw error;
    }
  }
}
