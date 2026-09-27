import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { eq, or, asc, desc, sql, inArray, like, and } from 'drizzle-orm';
import { D1_DATABASE } from '../../database/d1.constants';
import type { D1Database } from '../../database/d1.client';
import { products, Product } from './schemas/product.schema';
import { brands, categories, subcategories } from '../brands/schemas/brand.schema';
import { removeDiacritics } from '@/common/utils/string.util';
import { resolveMediaUrl, resolveMediaUrls } from '@/common/utils/url.util';
import { GetProductsDto, ProductSortBy } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  GetInstallationMediaDto,
  MediaType,
} from './dto/get-installation-media.dto';
import { PRODUCT_DEFAULTS } from './constants/product.constants';
import type { IProduct, IProductsListResponse } from './types/product.types';

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
export class ProductsService {
  private readonly imageBaseUrl: string;

  constructor(
    @Inject(D1_DATABASE) private readonly db: D1Database,
    private readonly configService: ConfigService,
  ) {
    this.imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '';
  }

  async getRawProducts(): Promise<any[]> {
    return this.db.select().from(products);
  }

  /** Effective price calculation */
  private resolvePrice(product: any): number | null {
    if (product.price !== null && product.price !== undefined) {
      return product.price;
    }
    const variants = parseJsonField(product.variants, []);
    if (Array.isArray(variants) && variants.length > 0) {
      const prices = variants
        .map((v: any) => v.price)
        .filter((p: any) => p !== null && p !== undefined) as number[];
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    return null;
  }

  /**
   * Lấy bản đồ thương hiệu & danh mục để map thông tin trả về cho client
   */
  private async getBrandMap(): Promise<Map<string, any>> {
    const [brandRows, catRows, subRows] = await Promise.all([
      this.db.select().from(brands),
      this.db.select().from(categories),
      this.db.select().from(subcategories),
    ]);

    const subMap = new Map<string, Array<{ slug: string; name: string }>>();
    for (const sub of subRows) {
      if (!subMap.has(sub.categoryId)) {
        subMap.set(sub.categoryId, []);
      }
      subMap.get(sub.categoryId)!.push({
        slug: sub.slug,
        name: sub.name,
      });
    }

    const catMap = new Map<string, Array<any>>();
    for (const cat of catRows) {
      if (!catMap.has(cat.brandId)) {
        catMap.set(cat.brandId, []);
      }
      catMap.get(cat.brandId)!.push({
        slug: cat.slug,
        name: cat.name,
        subcategories: subMap.get(cat.id) || [],
      });
    }

    const map = new Map<string, any>();
    for (const b of brandRows) {
      map.set(b.id, {
        ...b,
        categories: catMap.get(b.id) || [],
      });
      map.set(b.slug.toLowerCase(), {
        ...b,
        categories: catMap.get(b.id) || [],
      });
    }
    return map;
  }

  /**
   * Tự động tra cứu và bổ sung tên thương hiệu, brandSlug, categoryName, subcategoryName
   */
  private resolveBrandAndCategoryInfo(
    item: {
      brandId?: string | number | null;
      categorySlug?: string | null;
      subcategorySlug?: string | null;
      category?: string | null;
      subcategory?: string | null;
    },
    brandMap: Map<string, any>,
  ) {
    let brand = '';
    let brandSlug = '';
    let categoryName = '';
    let subcategoryName = '';

    const brandKey = item.brandId ? String(item.brandId) : '';
    const b = brandMap.get(brandKey);

    if (b) {
      brand = b.name || '';
      brandSlug = b.slug || '';

      const targetCatSlug = (item.categorySlug || item.category || '').toLowerCase().trim();
      if (targetCatSlug && Array.isArray(b.categories)) {
        const matchedCat = b.categories.find(
          (c: any) =>
            c.slug?.toLowerCase() === targetCatSlug ||
            c.name?.toLowerCase() === targetCatSlug,
        );
        if (matchedCat) {
          categoryName = matchedCat.name || '';
          const targetSubSlug = (item.subcategorySlug || item.subcategory || '').toLowerCase().trim();
          if (targetSubSlug) {
            const matchedSub = (matchedCat.subcategories || []).find(
              (s: any) =>
                s.slug?.toLowerCase() === targetSubSlug ||
                s.name?.toLowerCase() === targetSubSlug,
            );
            if (matchedSub) {
              subcategoryName = matchedSub.name || '';
            }
          }
        }
      }
    }

    return {
      brand,
      brandSlug,
      categoryName,
      subcategoryName,
    };
  }

  /**
   * Tính toán giá gốc (originalPrice), % giảm (discountPercent) và giá bán sau cùng (price)
   */
  private computePricing(input: {
    price?: number | null;
    originalPrice?: number | null;
    discountPercent?: number | null;
    priceRange?: string | null;
  }) {
    const originalPrice =
      typeof input.originalPrice === 'number' && !isNaN(input.originalPrice)
        ? input.originalPrice
        : null;
    let discountPercent =
      typeof input.discountPercent === 'number' && !isNaN(input.discountPercent)
        ? input.discountPercent
        : null;
    let price =
      typeof input.price === 'number' && !isNaN(input.price)
        ? input.price
        : null;

    // Nếu có giá gốc và % giảm -> tự tính giá bán (price) nếu chưa có
    if (
      originalPrice !== null &&
      discountPercent !== null &&
      discountPercent > 0
    ) {
      if (price === null) {
        price = Math.round(originalPrice * (1 - discountPercent / 100));
      }
    } else if (
      originalPrice !== null &&
      price !== null &&
      originalPrice > price &&
      (discountPercent === null || discountPercent === 0)
    ) {
      // Tự suy ra % giảm nếu có giá gốc và giá bán
      discountPercent = Math.round(
        ((originalPrice - price) / originalPrice) * 100,
      );
    }

    let priceRange = input.priceRange || '';
    if (!priceRange && price !== null) {
      priceRange = price.toLocaleString('vi-VN') + ' VNĐ';
    }

    return {
      price,
      originalPrice,
      discountPercent,
      priceRange,
    };
  }

  private async enrichRelations(dto: CreateProductDto | UpdateProductDto) {
    const data: any = { ...dto };

    // Tính toán bảng giá & % giảm cho sản phẩm chính
    const pricing = this.computePricing(data);
    data.price = pricing.price ?? 0;
    data.originalPrice = pricing.originalPrice;
    data.discountPercent = pricing.discountPercent;
    data.priceRange = pricing.priceRange;

    // Tính toán bảng giá cho từng biến thể (nếu có)
    if (Array.isArray(data.variants)) {
      data.variants = data.variants.map((v: any) => {
        const vPricing = this.computePricing(v);
        return {
          ...v,
          price: vPricing.price,
          originalPrice: vPricing.originalPrice,
          discountPercent: vPricing.discountPercent,
          priceRange: vPricing.priceRange,
        };
      });
    }

    // Resolve Brand
    if (dto.brandId !== undefined && dto.brandId !== null) {
      data.brandId = String(dto.brandId);
    } else if ((dto as any).brandSlug || (dto as any).brand) {
      const bSlug = ((dto as any).brandSlug || (dto as any).brand || '')
        .toLowerCase()
        .trim();
      const brandRows = await this.db
        .select()
        .from(brands)
        .where(or(eq(brands.slug, bSlug), eq(brands.name, bSlug)))
        .limit(1);
      if (brandRows[0]) {
        data.brandId = brandRows[0].id;
      }
    }

    // Category / Subcategory slugs
    if ((dto as any).category) {
      data.categorySlug = (dto as any).category;
    }
    if ((dto as any).subcategory) {
      data.subcategorySlug = (dto as any).subcategory;
    }

    // Slug calculation
    if (!data.slug && data.code) {
      data.slug = data.code
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-');
    }

    return data;
  }

  async findAll(query: GetProductsDto): Promise<IProductsListResponse> {
    const {
      page = PRODUCT_DEFAULTS.PAGINATION.DEFAULT_PAGE,
      limit = PRODUCT_DEFAULTS.PAGINATION.DEFAULT_LIMIT,
      brandId,
      category,
      subcategory,
      brand,
      search,
      minPrice,
      maxPrice,
      sortBy = ProductSortBy.NEWEST,
    } = query;

    let targetBrandId: string | undefined = undefined;
    if (brandId !== undefined && brandId !== null) {
      targetBrandId = String(brandId);
    } else if (brand && brand.trim()) {
      const bSlug = brand.trim().toLowerCase();
      const brandRows = await this.db
        .select()
        .from(brands)
        .where(or(eq(brands.slug, bSlug), eq(brands.name, bSlug)))
        .limit(1);
      if (brandRows[0]) {
        targetBrandId = brandRows[0].id;
      }
    }

    let productsList = await this.db.select().from(products);

    // Apply In-Memory Filters
    if (targetBrandId) {
      productsList = productsList.filter((p) => p.brandId === targetBrandId);
    }

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
        productsList = productsList.filter((p) =>
          lockSlugs.includes(p.categorySlug.toLowerCase()),
        );
      } else {
        productsList = productsList.filter(
          (p) => p.categorySlug.toLowerCase() === queryCat,
        );
      }
    }

    if (subcategory && subcategory.trim()) {
      const querySub = subcategory.trim().toLowerCase();
      productsList = productsList.filter(
        (p) => (p.subcategorySlug || '').toLowerCase() === querySub,
      );
    }

    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      productsList = productsList.filter(
        (p) => (this.resolvePrice(p) ?? 0) >= minPrice,
      );
    }

    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      productsList = productsList.filter((p) => {
        const ep = this.resolvePrice(p);
        return ep !== null && ep <= maxPrice;
      });
    }

    const brandMap = await this.getBrandMap();

    if (search && search.trim()) {
      const searchNorm = removeDiacritics(search.trim().toLowerCase());
      const searchKeywords = searchNorm
        .split(PRODUCT_DEFAULTS.SEARCH.SPLIT_REGEX)
        .filter(Boolean);

      productsList = productsList.filter((p) => {
        const name = p.name || '';
        const code = p.code || '';
        const meta = this.resolveBrandAndCategoryInfo(p, brandMap);
        const catSlug = p.categorySlug || '';
        const desc = p.description || '';
        const features = parseJsonField(p.features, []);
        const featuresStr = Array.isArray(features) ? features.join(' ') : '';

        const searchableText = removeDiacritics(
          `${name} ${code} ${meta.brand} ${meta.categoryName} ${catSlug} ${desc} ${featuresStr}`.toLowerCase(),
        );
        return searchKeywords.every((keyword) =>
          searchableText.includes(keyword),
        );
      });
    }

    if (sortBy === ProductSortBy.PRICE_ASC) {
      productsList.sort((a, b) => {
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
      productsList.sort((a, b) => {
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
      productsList.sort((a, b) => {
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

    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = productsList.slice(
      startIndex,
      startIndex + limitNum,
    );

    const items = paginatedProducts.map((p) => {
      const pricing = this.computePricing(p);
      const meta = this.resolveBrandAndCategoryInfo(p, brandMap);
      const features = parseJsonField(p.features, []);

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        brandId: p.brandId ?? null,
        brand: meta.brand,
        brandSlug: meta.brandSlug,
        category: p.categorySlug || '',
        categoryName: meta.categoryName,
        subcategory: p.subcategorySlug || '',
        subcategoryName: meta.subcategoryName,
        imageUrl: resolveMediaUrl(p.imageUrl || '', this.imageBaseUrl),
        price: this.resolvePrice(p) ?? pricing.price,
        originalPrice: pricing.originalPrice,
        discountPercent: pricing.discountPercent,
        priceRange: pricing.priceRange,
        features: Array.isArray(features) ? features.slice(0, 2) : [],
        has_variants: !!p.hasVariants,
      };
    });

    return {
      items,
      total: productsList.length,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(idOrCode: string): Promise<IProduct> {
    const cleanQuery = idOrCode.trim();
    const compactQuery = cleanQuery.toLowerCase().replace(/\s+/g, '');

    const allProducts = await this.db.select().from(products);

    let product = allProducts.find(
      (p) =>
        p.id === cleanQuery ||
        p.code === cleanQuery ||
        p.slug === cleanQuery ||
        p.code.toLowerCase() === cleanQuery.toLowerCase() ||
        p.id.toLowerCase() === cleanQuery.toLowerCase() ||
        p.slug.toLowerCase() === cleanQuery.toLowerCase() ||
        p.code.toLowerCase().replace(/\s+/g, '') === compactQuery ||
        p.slug.toLowerCase().replace(/\s+/g, '') === compactQuery,
    );

    if (!product) {
      throw new NotFoundException(`Product not found: ${idOrCode}`);
    }

    const pricing = this.computePricing(product);
    const effectivePrice = this.resolvePrice(product) ?? pricing.price;

    const brandMap = await this.getBrandMap();
    const meta = this.resolveBrandAndCategoryInfo(product, brandMap);

    const installationObj = parseJsonField(product.installation, {
      images: [],
      videos: [],
    });
    const installationPreview = installationObj?.images
      ? resolveMediaUrls(
          installationObj.images.slice(
            0,
            PRODUCT_DEFAULTS.INSTALLATION_PREVIEW_LIMIT,
          ),
          this.imageBaseUrl,
        )
      : [];

    const imagesArr = parseJsonField(product.images, []);
    const featuresArr = parseJsonField(product.features, []);
    const specsObj = parseJsonField(product.specs, {});
    const technologiesArr = parseJsonField(product.technologies, []);
    const colorsArr = parseJsonField(product.colors, []);
    const installationManualArr = parseJsonField(product.installationManual, []);
    const faqArr = parseJsonField(product.faq, []);
    const optionsArr = parseJsonField(product.options, []);
    const rawVariants = parseJsonField(product.variants, []);

    const productResponse: IProduct = {
      id: product.id,
      code: product.code,
      brandId: product.brandId ?? null,
      brand: meta.brand,
      brandSlug: meta.brandSlug,
      category: product.categorySlug || '',
      categoryName: meta.categoryName,
      subcategory: product.subcategorySlug || '',
      subcategoryName: meta.subcategoryName,
      name: product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      content: product.content || '',
      imageUrl: resolveMediaUrl(product.imageUrl || '', this.imageBaseUrl),
      images: resolveMediaUrls(imagesArr, this.imageBaseUrl),
      price: effectivePrice,
      originalPrice: pricing.originalPrice,
      discountPercent: pricing.discountPercent,
      priceRange: pricing.priceRange,
      features: featuresArr,
      specs: specsObj,
      technologies: technologiesArr,
      warranty: typeof product.warranty === 'number' ? product.warranty : 36,
      warrantyText: product.warrantyText || '',
      colors: colorsArr,
      installationManual: installationManualArr,
      faq: faqArr,
      has_variants: !!product.hasVariants,
      options: optionsArr,
      variants: Array.isArray(rawVariants)
        ? rawVariants.map((v: any) => {
            const vPricing = this.computePricing(v);
            return {
              id: v.id,
              label: v.label,
              attributes: v.attributes || {},
              price: vPricing.price,
              originalPrice: vPricing.originalPrice,
              discountPercent: vPricing.discountPercent,
              priceRange: vPricing.priceRange,
              is_default: !!v.is_default,
            };
          })
        : [],
      installation_preview: installationPreview,
    };

    return productResponse;
  }

  async getInstallationMedia(idOrCode: string, query: GetInstallationMediaDto) {
    const { page = 1, limit = 12, type = MediaType.ALL } = query;

    const cleanQuery = idOrCode.trim();
    const compactQuery = cleanQuery.toLowerCase().replace(/\s+/g, '');

    const allProducts = await this.db.select().from(products);
    const product = allProducts.find(
      (p) =>
        p.id === cleanQuery ||
        p.code === cleanQuery ||
        p.slug === cleanQuery ||
        p.code.toLowerCase() === cleanQuery.toLowerCase() ||
        p.id.toLowerCase() === cleanQuery.toLowerCase() ||
        p.code.toLowerCase().replace(/\s+/g, '') === compactQuery,
    );

    if (!product) {
      throw new NotFoundException(`Product not found: ${idOrCode}`);
    }

    const installation = parseJsonField(
      product.installation,
      PRODUCT_DEFAULTS.INSTALLATION,
    );
    const mediaItems: Array<{ url: string; type: 'image' | 'video' }> = [];

    if (type === MediaType.IMAGES || type === MediaType.ALL) {
      if (Array.isArray(installation.images)) {
        mediaItems.push(
          ...installation.images.map((url) => ({
            url: resolveMediaUrl(url, this.imageBaseUrl),
            type: 'image' as const,
          })),
        );
      }
    }
    if (type === MediaType.VIDEOS || type === MediaType.ALL) {
      if (Array.isArray(installation.videos)) {
        mediaItems.push(
          ...installation.videos.map((url) => ({
            url: resolveMediaUrl(url, this.imageBaseUrl),
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

  async create(createProductDto: CreateProductDto): Promise<any> {
    const payload = await this.enrichRelations(createProductDto);

    const existing = await this.db
      .select()
      .from(products)
      .where(or(eq(products.code, payload.code), eq(products.slug, payload.slug)))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(
        `Product with code "${payload.code}" or slug "${payload.slug}" already exists`,
      );
    }

    const newId = randomUUID();
    await this.db.insert(products).values({
      id: newId,
      code: payload.code.trim(),
      slug: payload.slug.trim(),
      name: payload.name.trim(),
      description: payload.description || '',
      shortDescription: payload.shortDescription || '',
      content: payload.content || '',
      brandId: payload.brandId,
      categorySlug: payload.categorySlug,
      subcategorySlug: payload.subcategorySlug || null,
      price: payload.price,
      originalPrice: payload.originalPrice || null,
      discountPercent: payload.discountPercent || null,
      priceRange: payload.priceRange || null,
      imageUrl: payload.imageUrl || '',
      images: JSON.stringify(payload.images || []),
      features: JSON.stringify(payload.features || []),
      specs: JSON.stringify(payload.specs || {}),
      technologies: JSON.stringify(payload.technologies || []),
      warranty: payload.warranty || 36,
      warrantyText: payload.warrantyText || '',
      colors: JSON.stringify(payload.colors || []),
      installation: JSON.stringify(payload.installation || { images: [], videos: [] }),
      installationManual: JSON.stringify(payload.installationManual || []),
      faq: JSON.stringify(payload.faq || []),
      hasVariants: payload.has_variants || payload.hasVariants || false,
      options: JSON.stringify(payload.options || []),
      variants: JSON.stringify(payload.variants || []),
      installationPreview: JSON.stringify(payload.installation_preview || []),
      priority: payload.priority ?? 9999,
      status: payload.status || 'ACTIVE',
      views: 0,
    });

    return this.findOne(newId);
  }

  async update(
    idOrCode: string,
    updateProductDto: UpdateProductDto,
  ): Promise<any> {
    const product = await this.findOne(idOrCode);
    const payload = await this.enrichRelations(updateProductDto);

    const updateData: Partial<typeof products.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.shortDescription !== undefined) updateData.shortDescription = payload.shortDescription;
    if (payload.content !== undefined) updateData.content = payload.content;
    if (payload.brandId !== undefined) updateData.brandId = payload.brandId;
    if (payload.categorySlug !== undefined) updateData.categorySlug = payload.categorySlug;
    if (payload.subcategorySlug !== undefined) updateData.subcategorySlug = payload.subcategorySlug;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.originalPrice !== undefined) updateData.originalPrice = payload.originalPrice;
    if (payload.discountPercent !== undefined) updateData.discountPercent = payload.discountPercent;
    if (payload.priceRange !== undefined) updateData.priceRange = payload.priceRange;
    if (payload.imageUrl !== undefined) updateData.imageUrl = payload.imageUrl;
    if (payload.images !== undefined) updateData.images = JSON.stringify(payload.images);
    if (payload.features !== undefined) updateData.features = JSON.stringify(payload.features);
    if (payload.specs !== undefined) updateData.specs = JSON.stringify(payload.specs);
    if (payload.technologies !== undefined) updateData.technologies = JSON.stringify(payload.technologies);
    if (payload.warranty !== undefined) updateData.warranty = payload.warranty;
    if (payload.warrantyText !== undefined) updateData.warrantyText = payload.warrantyText;
    if (payload.colors !== undefined) updateData.colors = JSON.stringify(payload.colors);
    if (payload.installation !== undefined) updateData.installation = JSON.stringify(payload.installation);
    if (payload.installationManual !== undefined) updateData.installationManual = JSON.stringify(payload.installationManual);
    if (payload.faq !== undefined) updateData.faq = JSON.stringify(payload.faq);
    if (payload.has_variants !== undefined || payload.hasVariants !== undefined) {
      updateData.hasVariants = payload.has_variants ?? payload.hasVariants;
    }
    if (payload.options !== undefined) updateData.options = JSON.stringify(payload.options);
    if (payload.variants !== undefined) updateData.variants = JSON.stringify(payload.variants);
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.status !== undefined) updateData.status = payload.status;

    await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, product.id));

    return this.findOne(product.id);
  }

  async remove(idOrCode: string): Promise<{ message: string }> {
    const product = await this.findOne(idOrCode);
    await this.db.delete(products).where(eq(products.id, product.id));
    return {
      message: `Product "${product.name}" (${product.code}) deleted successfully`,
    };
  }
}
