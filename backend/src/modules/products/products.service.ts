import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { BrandsRepository } from '../brands/repositories/brands.repository';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetInstallationMediaDto } from './dto/get-installation-media.dto';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode } from '@/common/constants';
import type { IProduct, IProductsListResponse } from './types/product.types';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly brandsRepository: BrandsRepository,
  ) {}

  async getRawProducts(): Promise<any[]> {
    return this.productsRepository.findAllRaw();
  }

  async findAll(query: GetProductsDto): Promise<IProductsListResponse> {
    return this.productsRepository.findAllPaginated(query);
  }

  async findOne(idOrCode: string): Promise<IProduct> {
    const product = await this.productsRepository.findByIdOrCode(idOrCode);
    if (!product) {
      throw new BusinessException(
        ErrorCode.PRODUCT_NOT_FOUND,
        `Product not found: "${idOrCode}"`,
        undefined,
        { idOrCode },
      );
    }
    return product;
  }

  async getInstallationMedia(idOrCode: string, query: GetInstallationMediaDto) {
    const product = await this.findOne(idOrCode);
    return this.productsRepository.findInstallationMedia(product, query);
  }

  async create(dto: CreateProductDto): Promise<IProduct> {
    // 1. Fast fail: duplicate code/slug (single indexed queries)
    if (dto.code) {
      const duplicate = await this.productsRepository.findByCode(dto.code);
      if (duplicate) {
        throw new BusinessException(
          ErrorCode.PRODUCT_ALREADY_EXISTS,
          `Product with code "${dto.code}" already exists`,
          'code',
          { code: dto.code },
        );
      }
    }

    if (dto.slug) {
      const duplicate = await this.productsRepository.findBySlug(dto.slug);
      if (duplicate) {
        throw new BusinessException(
          ErrorCode.PRODUCT_ALREADY_EXISTS,
          `Product with slug "${dto.slug}" already exists`,
          'slug',
          { slug: dto.slug },
        );
      }
    }

    // 2. Brand hierarchy (only when brandId provided, stops early if brand not found)
    if (dto.brandId !== undefined) {
      const brand = await this.brandsRepository.findBrandById(
        String(dto.brandId),
      );
      if (!brand) {
        throw new BusinessException(
          ErrorCode.BRAND_NOT_FOUND,
          `Brand not found: "${dto.brandId}"`,
          'brandId',
          { brandId: dto.brandId },
        );
      }

      if (dto.category) {
        const category = await this.brandsRepository.findCategoryInBrand(
          brand.id,
          dto.category,
        );
        if (!category) {
          throw new BusinessException(
            ErrorCode.CATEGORY_NOT_FOUND,
            `Category "${dto.category}" does not belong to brand "${brand.name}"`,
            'category',
            { category: dto.category, brand: brand.name },
          );
        }

        if (dto.subcategory) {
          const subcategory =
            await this.brandsRepository.findSubcategoryInCategory(
              category.id,
              dto.subcategory,
            );
          if (!subcategory) {
            throw new BusinessException(
              ErrorCode.SUBCATEGORY_NOT_FOUND,
              `Subcategory "${dto.subcategory}" does not belong to category "${category.name}"`,
              'subcategory',
              { subcategory: dto.subcategory, category: category.name },
            );
          }
        }
      }
    }

    return this.productsRepository.createProduct(dto);
  }

  async update(idOrCode: string, dto: UpdateProductDto): Promise<IProduct> {
    // 1. Product must exist
    const current = await this.findOne(idOrCode);

    // 2. Fast fail: duplicate code/slug (excludes current product)
    if (dto.code) {
      const duplicate = await this.productsRepository.findOtherByCode(
        dto.code,
        current.id,
      );
      if (duplicate) {
        throw new BusinessException(
          ErrorCode.PRODUCT_ALREADY_EXISTS,
          `Product with code "${dto.code}" already exists`,
          'code',
          { code: dto.code },
        );
      }
    }

    if (dto.slug) {
      const duplicate = await this.productsRepository.findOtherBySlug(
        dto.slug,
        current.id,
      );
      if (duplicate) {
        throw new BusinessException(
          ErrorCode.PRODUCT_ALREADY_EXISTS,
          `Product with slug "${dto.slug}" already exists`,
          'slug',
          { slug: dto.slug },
        );
      }
    }

    // 3. Price: merge incoming with DB values (catches partial updates — only price OR only originalPrice sent)
    const isPriceChanging =
      dto.price !== undefined || dto.originalPrice !== undefined;

    if (isPriceChanging) {
      const nextPrice = dto.price ?? current.price;
      const nextOriginalPrice = dto.originalPrice ?? current.originalPrice;

      if (
        typeof nextPrice === 'number' &&
        typeof nextOriginalPrice === 'number' &&
        nextPrice > nextOriginalPrice
      ) {
        const field = dto.price !== undefined ? 'price' : 'originalPrice';
        const message =
          field === 'price'
            ? `price (${nextPrice}) must not exceed originalPrice (${nextOriginalPrice})`
            : `originalPrice (${nextOriginalPrice}) must not be less than current price (${nextPrice})`;
        throw new BusinessException(
          ErrorCode.PRODUCT_INVALID_PRICE,
          message,
          field,
          { price: nextPrice, originalPrice: nextOriginalPrice },
        );
      }
    }

    // 4. Brand hierarchy (only when any hierarchy field changes)
    const isBrandHierarchyChanging =
      dto.brandId !== undefined ||
      dto.category !== undefined ||
      dto.subcategory !== undefined;

    if (isBrandHierarchyChanging) {
      const effectiveBrandId = dto.brandId ?? current.brandId;
      const hasBrand =
        effectiveBrandId !== undefined && effectiveBrandId !== null;

      if (hasBrand) {
        // 4a. Brand phải tồn tại
        const brand = await this.brandsRepository.findBrandById(
          String(effectiveBrandId),
        );
        if (!brand) {
          throw new BusinessException(
            ErrorCode.BRAND_NOT_FOUND,
            `Brand not found: "${effectiveBrandId}"`,
            'brandId',
            { brandId: effectiveBrandId },
          );
        }

        // 4b. Category (nếu có) phải thuộc đúng brand vừa xác nhận
        const effectiveCategory = dto.category ?? current.category;
        if (effectiveCategory) {
          const category = await this.brandsRepository.findCategoryInBrand(
            brand.id,
            effectiveCategory,
          );
          if (!category) {
            throw new BusinessException(
              ErrorCode.CATEGORY_NOT_FOUND,
              `Category "${effectiveCategory}" does not belong to brand "${brand.name}"`,
              'category',
              { category: effectiveCategory, brand: brand.name },
            );
          }

          // 4c. Subcategory (nếu có) phải thuộc đúng category vừa xác nhận
          const effectiveSubcategory = dto.subcategory ?? current.subcategory;
          if (effectiveSubcategory) {
            const subcategory =
              await this.brandsRepository.findSubcategoryInCategory(
                category.id,
                effectiveSubcategory,
              );
            if (!subcategory) {
              throw new BusinessException(
                ErrorCode.SUBCATEGORY_NOT_FOUND,
                `Subcategory "${effectiveSubcategory}" does not belong to category "${category.name}"`,
                'subcategory',
                { subcategory: effectiveSubcategory, category: category.name },
              );
            }
          }
        }
      }
    }

    return this.productsRepository.updateProduct(current.id, dto);
  }

  async remove(idOrCode: string): Promise<{ message: string }> {
    const current = await this.findOne(idOrCode);
    await this.productsRepository.deleteProduct(current.id);
    return {
      message: `Product "${current.name}" (${current.code}) deleted successfully`,
    };
  }
}
