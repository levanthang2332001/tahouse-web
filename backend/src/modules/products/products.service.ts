import { Injectable, NotFoundException } from '@nestjs/common';
import { removeDiacritics } from '@/common/utils/string.util';
import { JsonDbService } from '../database/json-db.service';
import { GetProductsDto, ProductSortBy } from './dto/get-products.dto';
import {
  GetInstallationMediaDto,
  MediaType,
} from './dto/get-installation-media.dto';
import { PRODUCT_DEFAULTS } from './constants/product.constants';
import type { IProduct, IProductsListResponse } from './types/product.types';

@Injectable()
export class ProductsService {
  private getProducts: () => any[];

  constructor(private readonly jsonDb: JsonDbService) {
    this.getProducts = this.jsonDb.register('products.json', []);
  }

  getRawProducts(): any[] {
    return this.getProducts();
  }

  /** Giá hiệu dụng: dùng root price nếu có, nếu không lấy giá thấp nhất trong variants. */
  private resolvePrice(product: any): number | null {
    if (product.price !== null && product.price !== undefined) {
      return product.price;
    }
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const prices = product.variants
        .map((v: any) => v.price)
        .filter((p: any) => p !== null && p !== undefined) as number[];
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    return null;
  }

  findAll(query: GetProductsDto): IProductsListResponse {
    const {
      page = PRODUCT_DEFAULTS.PAGINATION.DEFAULT_PAGE,
      limit = PRODUCT_DEFAULTS.PAGINATION.DEFAULT_LIMIT,
      category,
      subcategory,
      brand,
      search,
      minPrice,
      maxPrice,
      sortBy = ProductSortBy.NEWEST,
    } = query;

    let products = [...this.getProducts()];

    // 1. Lọc theo category slug
    if (category && category.trim()) {
      const queryCat = category.trim().toLowerCase();
      if (queryCat === 'lock-parent') {
        const lockSlugs = [
          'dai-sanh',
          'cua-go',
          'cua-kinh',
          'xingfa-sat',
          'cua-cong',
          'khach-san',
        ];
        products = products.filter((p) =>
          lockSlugs.includes(p.category?.toLowerCase()),
        );
      } else {
        products = products.filter(
          (p) => p.category?.toLowerCase() === queryCat,
        );
      }
    }

    // 2. Lọc theo subcategory slug
    if (subcategory && subcategory.trim()) {
      const querySub = subcategory.trim().toLowerCase();
      products = products.filter(
        (p) => p.subcategory?.toLowerCase() === querySub,
      );
    }

    // 3. Lọc theo brand slug hoặc tên brand
    if (brand && brand.trim()) {
      const queryBrand = brand.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.brandSlug === queryBrand ||
          (p.brand && p.brand.toLowerCase() === queryBrand),
      );
    }

    // 4. Lọc theo giá tối thiểu
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      products = products.filter(
        (p) => (this.resolvePrice(p) ?? 0) >= minPrice,
      );
    }

    // 5. Lọc theo giá tối đa
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      products = products.filter((p) => {
        const ep = this.resolvePrice(p);
        return ep !== null && ep <= maxPrice;
      });
    }

    // 6. Tìm kiếm thông minh
    if (search && search.trim()) {
      const searchNorm = removeDiacritics(search.trim().toLowerCase());
      const searchKeywords = searchNorm
        .split(PRODUCT_DEFAULTS.SEARCH.SPLIT_REGEX)
        .filter(Boolean);

      products = products.filter((p) => {
        const name = p.name || '';
        const code = p.code || '';
        const catName = p.categoryName || '';
        const catSlug = p.category || '';
        const desc = p.description || '';
        const features = Array.isArray(p.features) ? p.features.join(' ') : '';

        const searchableText = removeDiacritics(
          `${name} ${code} ${catName} ${catSlug} ${desc} ${features}`.toLowerCase(),
        );
        return searchKeywords.every((keyword) =>
          searchableText.includes(keyword),
        );
      });
    }

    // 7. Sắp xếp sản phẩm
    if (sortBy === ProductSortBy.PRICE_ASC) {
      products.sort((a, b) => {
        const valA = this.resolvePrice(a);
        const valB = this.resolvePrice(b);
        const isNullA = valA === null || valA === undefined;
        const isNullB = valB === null || valB === undefined;

        if (isNullA && isNullB) return 0;
        if (isNullA) return 1;
        if (isNullB) return -1;
        return valA - valB;
      });
    } else if (sortBy === ProductSortBy.PRICE_DESC) {
      products.sort((a, b) => {
        const valA = this.resolvePrice(a);
        const valB = this.resolvePrice(b);
        const isNullA = valA === null || valA === undefined;
        const isNullB = valB === null || valB === undefined;

        if (isNullA && isNullB) return 0;
        if (isNullA) return 1;
        if (isNullB) return -1;
        return valB - valA;
      });
    } else {
      // Mặc định (Newest/Priority): sắp xếp theo priority, null/undefined luôn ở cuối
      products.sort((a, b) => {
        const pA = a.priority;
        const pB = b.priority;
        const isNullA = pA === null || pA === undefined;
        const isNullB = pB === null || pB === undefined;

        if (isNullA && isNullB) return 0;
        if (isNullA) return 1;
        if (isNullB) return -1;

        return pA - pB;
      });
    }

    // 8. Phân trang và Mapping Response List (tinh gọn)
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);
    const items = paginatedProducts.map((p) => {
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        brand: p.brand || '',
        brandSlug: p.brandSlug || '',
        category: p.category,
        categoryName: p.categoryName || '',
        imageUrl: p.imageUrl || '',
        price: this.resolvePrice(p),
        originalPrice: p.originalPrice,
        priceRange: p.priceRange || '',
        features: Array.isArray(p.features) ? p.features.slice(0, 2) : [],
        has_variants: p.has_variants || false,
      };
    });

    return {
      items,
      total: products.length,
      page: pageNum,
      limit: limitNum,
    };
  }

  findOne(idOrCode: string): IProduct {
    const products = this.getProducts();
    const cleanQuery = idOrCode.trim().toLowerCase().replace(/\s+/g, '');
    const product = products.find(
      (p) =>
        p.code?.toLowerCase().replace(/\s+/g, '') === cleanQuery ||
        p.id?.toLowerCase().replace(/\s+/g, '') === cleanQuery,
    );

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID hoặc mã: ${idOrCode}`,
      );
    }

    const effectivePrice = this.resolvePrice(product);

    // Tính toán installation_preview (tối đa 3 ảnh)
    const installationPreview = product.installation?.images
      ? product.installation.images.slice(
          0,
          PRODUCT_DEFAULTS.INSTALLATION_PREVIEW_LIMIT,
        )
      : [];

    const productResponse: IProduct = {
      id: product.id,
      code: product.code,
      brand: product.brand,
      brandSlug: product.brandSlug,
      category: product.category,
      categoryName: product.categoryName,
      subcategory: product.subcategory,
      subcategoryName: product.subcategoryName,
      name: product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      imageUrl: product.imageUrl || '',
      images: product.images || [],
      price: effectivePrice,
      originalPrice: product.originalPrice,
      priceRange: product.priceRange || '',
      features: product.features || [],
      specs: product.specs || {},
      technologies: product.technologies || [],
      warranty: typeof product.warranty === 'number' ? product.warranty : 36,
      warrantyText: product.warrantyText || '',
      colors: product.colors || [],
      installationManual: product.installationManual,
      faq: product.faq,
      has_variants: product.has_variants || false,
      options: product.options || [],
      variants: Array.isArray(product.variants)
        ? product.variants.map((v: any) => ({
            id: v.id,
            label: v.label,
            attributes: v.attributes || {},
            price: v.price,
            priceRange:
              v.priceRange ||
              (typeof v.price === 'number'
                ? v.price.toLocaleString('vi-VN') + ' VNĐ'
                : ''),
            is_default: !!v.is_default,
          }))
        : [],
      installation_preview: installationPreview,
    };

    return productResponse;
  }

  getInstallationMedia(idOrCode: string, query: GetInstallationMediaDto) {
    const { page = 1, limit = 12, type = MediaType.ALL } = query;

    const products = this.getProducts();
    const cleanQuery = idOrCode.trim().toLowerCase().replace(/\s+/g, '');
    const product = products.find(
      (p) =>
        p.code?.toLowerCase().replace(/\s+/g, '') === cleanQuery ||
        p.id?.toLowerCase().replace(/\s+/g, '') === cleanQuery,
    );

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID hoặc mã: ${idOrCode}`,
      );
    }

    const installation = product.installation ?? PRODUCT_DEFAULTS.INSTALLATION;
    const mediaItems: Array<{ url: string; type: 'image' | 'video' }> = [];

    if (type === MediaType.IMAGES || type === MediaType.ALL) {
      if (Array.isArray(installation.images)) {
        mediaItems.push(
          ...installation.images.map((url) => ({
            url,
            type: 'image' as const,
          })),
        );
      }
    }
    if (type === MediaType.VIDEOS || type === MediaType.ALL) {
      if (Array.isArray(installation.videos)) {
        mediaItems.push(
          ...installation.videos.map((url) => ({
            url,
            type: 'video' as const,
          })),
        );
      }
    }

    const total = mediaItems.length;
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const startIndex = (pageNum - 1) * limitNum;
    const items = mediaItems.slice(startIndex, startIndex + limitNum);

    return {
      product_id: product.id,
      product_name: product.name,
      items,
      total,
      total_images: Array.isArray(installation.images)
        ? installation.images.length
        : 0,
      total_videos: Array.isArray(installation.videos)
        ? installation.videos.length
        : 0,
      page: pageNum,
      limit: limitNum,
    };
  }
}
