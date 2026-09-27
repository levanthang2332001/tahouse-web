import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { removeDiacritics } from '@/common/utils/string.util';
import { resolveMediaUrl, resolveMediaUrls } from '@/common/utils/url.util';
import { Product, ProductDocument } from './schemas/product.schema';
import { Brand, BrandDocument } from '@/modules/brands/schemas/brand.schema';
import { GetProductsDto, ProductSortBy } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  GetInstallationMediaDto,
  MediaType,
} from './dto/get-installation-media.dto';
import { PRODUCT_DEFAULTS } from './constants/product.constants';
import type { IProduct, IProductsListResponse } from './types/product.types';

@Injectable()
export class ProductsService {
  private readonly imageBaseUrl: string;

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    private readonly configService: ConfigService,
  ) {
    this.imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '';
  }

  async getRawProducts(): Promise<any[]> {
    return this.productModel.find().lean().exec();
  }

  /** Effective price calculation */
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

  /**
   * Lấy bản đồ thương hiệu & danh mục để map thông tin trả về cho client
   */
  private async getBrandMap(): Promise<Map<number, any>> {
    const brands = await this.brandModel.find().lean().exec();
    const map = new Map<number, any>();
    for (const b of brands) {
      map.set(b.id, b);
    }
    return map;
  }

  /**
   * Tự động tra cứu và bổ sung tên thương hiệu, brandSlug, categoryName, subcategoryName
   */
  private resolveBrandAndCategoryInfo(
    item: { brandId?: number | null; category?: string; subcategory?: string },
    brandMap: Map<number, any>,
  ) {
    let brand = '';
    let brandSlug = '';
    let categoryName = '';
    let subcategoryName = '';

    if (item.brandId && brandMap.has(item.brandId)) {
      const b = brandMap.get(item.brandId);
      brand = b.name || '';
      brandSlug = b.slug || '';

      if (item.category && Array.isArray(b.categories)) {
        const cSlug = item.category.toLowerCase().trim();
        const matchedCat = b.categories.find(
          (c: any) =>
            c.slug?.toLowerCase() === cSlug || c.name?.toLowerCase() === cSlug,
        );
        if (matchedCat) {
          categoryName = matchedCat.name || '';
          if (item.subcategory) {
            const sSlug = item.subcategory.toLowerCase().trim();
            const matchedSub = (matchedCat.subcategories || []).find(
              (s: any) =>
                s.slug?.toLowerCase() === sSlug ||
                s.name?.toLowerCase() === sSlug,
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
    priceRange?: string;
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
    data.price = pricing.price;
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

    // Resolve Brand & its nested Categories
    if (dto.brandId !== undefined && dto.brandId !== null) {
      data.brandId = dto.brandId;
    } else if ((dto as any).brandSlug || (dto as any).brand) {
      const bSlug = ((dto as any).brandSlug || (dto as any).brand || '')
        .toLowerCase()
        .trim();
      const brandDoc = await this.brandModel
        .findOne({
          $or: [
            { slug: bSlug },
            { name: { $regex: new RegExp(`^${bSlug}$`, 'i') } },
          ],
        })
        .lean()
        .exec();
      if (brandDoc) {
        data.brandId = brandDoc.id;
      }
    }

    // Xóa các trường tên tĩnh để đảm bảo DB chỉ lưu brandId, category, subcategory
    delete data.brand;
    delete data.brandSlug;
    delete data.categoryName;
    delete data.subcategoryName;

    // Auto-generate clean id if missing
    if (!data.id && data.code) {
      data.id = data.code
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

    const filter: any = {};

    if (brandId !== undefined && brandId !== null) {
      filter.brandId = brandId;
    } else if (brand && brand.trim()) {
      const bSlug = brand.trim().toLowerCase();
      const brandDoc = await this.brandModel
        .findOne({
          $or: [
            { slug: bSlug },
            { name: { $regex: new RegExp(`^${bSlug}$`, 'i') } },
          ],
        })
        .lean()
        .exec();
      if (brandDoc) {
        filter.brandId = brandDoc.id;
      }
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
        filter.category = { $in: lockSlugs };
      } else {
        filter.category = { $regex: new RegExp(`^${queryCat}$`, 'i') };
      }
    }

    if (subcategory && subcategory.trim()) {
      filter.subcategory = {
        $regex: new RegExp(`^${subcategory.trim()}$`, 'i'),
      };
    }

    let products = await this.productModel.find(filter).lean().exec();

    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      products = products.filter(
        (p) => (this.resolvePrice(p) ?? 0) >= minPrice,
      );
    }

    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      products = products.filter((p) => {
        const ep = this.resolvePrice(p);
        return ep !== null && ep <= maxPrice;
      });
    }

    if (search && search.trim()) {
      const brandMap = await this.getBrandMap();
      const searchNorm = removeDiacritics(search.trim().toLowerCase());
      const searchKeywords = searchNorm
        .split(PRODUCT_DEFAULTS.SEARCH.SPLIT_REGEX)
        .filter(Boolean);

      products = products.filter((p) => {
        const name = p.name || '';
        const code = p.code || '';
        const meta = this.resolveBrandAndCategoryInfo(p, brandMap);
        const catSlug = p.category || '';
        const desc = p.description || '';
        const features = Array.isArray(p.features) ? p.features.join(' ') : '';

        const searchableText = removeDiacritics(
          `${name} ${code} ${meta.brand} ${meta.categoryName} ${catSlug} ${desc} ${features}`.toLowerCase(),
        );
        return searchKeywords.every((keyword) =>
          searchableText.includes(keyword),
        );
      });
    }

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

    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    const brandMap = await this.getBrandMap();

    const items = paginatedProducts.map((p) => {
      const pricing = this.computePricing(p);
      const meta = this.resolveBrandAndCategoryInfo(p, brandMap);
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        brandId: p.brandId ?? null,
        brand: meta.brand,
        brandSlug: meta.brandSlug,
        category: p.category || '',
        categoryName: meta.categoryName,
        subcategory: p.subcategory || '',
        subcategoryName: meta.subcategoryName,
        imageUrl: resolveMediaUrl(p.imageUrl || '', this.imageBaseUrl),
        price: this.resolvePrice(p) ?? pricing.price,
        originalPrice: pricing.originalPrice,
        discountPercent: pricing.discountPercent,
        priceRange: pricing.priceRange,
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

  async findOne(idOrCode: string): Promise<IProduct> {
    const cleanQuery = idOrCode.trim();
    const compactQuery = cleanQuery.toLowerCase().replace(/\s+/g, '');

    let product: any = await this.productModel
      .findOne({
        $or: [
          { code: cleanQuery },
          { id: cleanQuery },
          { code: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
          { id: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
        ],
      })
      .lean()
      .exec();

    if (!product) {
      const allProducts = await this.productModel.find().lean().exec();
      product = allProducts.find(
        (p) =>
          p.code?.toLowerCase().replace(/\s+/g, '') === compactQuery ||
          p.id?.toLowerCase().replace(/\s+/g, '') === compactQuery,
      );
    }

    if (!product) {
      throw new NotFoundException(`Product not found: ${idOrCode}`);
    }

    const pricing = this.computePricing(product);
    const effectivePrice = this.resolvePrice(product) ?? pricing.price;

    const brandMap = await this.getBrandMap();
    const meta = this.resolveBrandAndCategoryInfo(product, brandMap);

    const installationPreview = product.installation?.images
      ? resolveMediaUrls(
          product.installation.images.slice(
            0,
            PRODUCT_DEFAULTS.INSTALLATION_PREVIEW_LIMIT,
          ),
          this.imageBaseUrl,
        )
      : [];

    const productResponse: IProduct = {
      id: product.id,
      code: product.code,
      brandId: product.brandId ?? null,
      brand: meta.brand,
      brandSlug: meta.brandSlug,
      category: product.category || '',
      categoryName: meta.categoryName,
      subcategory: product.subcategory || '',
      subcategoryName: meta.subcategoryName,
      name: product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      content: product.content || '',
      imageUrl: resolveMediaUrl(product.imageUrl || '', this.imageBaseUrl),
      images: resolveMediaUrls(product.images || [], this.imageBaseUrl),
      price: effectivePrice,
      originalPrice: pricing.originalPrice,
      discountPercent: pricing.discountPercent,
      priceRange: pricing.priceRange,
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
        ? product.variants.map((v: any) => {
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

    let product: any = await this.productModel
      .findOne({
        $or: [
          { code: cleanQuery },
          { id: cleanQuery },
          { code: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
          { id: { $regex: new RegExp(`^${cleanQuery}$`, 'i') } },
        ],
      })
      .lean()
      .exec();

    if (!product) {
      const allProducts = await this.productModel.find().lean().exec();
      product = allProducts.find(
        (p) =>
          p.code?.toLowerCase().replace(/\s+/g, '') === compactQuery ||
          p.id?.toLowerCase().replace(/\s+/g, '') === compactQuery,
      );
    }

    if (!product) {
      throw new NotFoundException(`Product not found: ${idOrCode}`);
    }

    const installation = product.installation ?? PRODUCT_DEFAULTS.INSTALLATION;
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
    const existing = await this.productModel.findOne({
      $or: [{ id: payload.id }, { code: payload.code }],
    });
    if (existing) {
      throw new ConflictException(
        `Product with ID "${payload.id}" or code "${payload.code}" already exists`,
      );
    }
    const newProduct = new this.productModel(payload);
    return newProduct.save();
  }

  async update(
    idOrCode: string,
    updateProductDto: UpdateProductDto,
  ): Promise<any> {
    const payload = await this.enrichRelations(updateProductDto);
    const product = await this.productModel.findOneAndUpdate(
      { $or: [{ id: idOrCode }, { code: idOrCode }] },
      { $set: payload },
      { new: true },
    );
    if (!product) {
      throw new NotFoundException(`Product not found: ${idOrCode}`);
    }
    return product;
  }

  async remove(idOrCode: string): Promise<{ message: string }> {
    const result = await this.productModel.findOneAndDelete({
      $or: [{ id: idOrCode }, { code: idOrCode }],
    });
    if (!result) {
      throw new NotFoundException(`Product not found: ${idOrCode}`);
    }
    return {
      message: `Product "${result.name}" (${result.code}) deleted successfully`,
    };
  }
}
