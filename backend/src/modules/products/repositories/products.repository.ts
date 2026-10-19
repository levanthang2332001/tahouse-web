import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  eq,
  ne,
  and,
  or,
  inArray,
  gte,
  lte,
  like,
  asc,
  desc,
  sql,
} from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import { products } from '../schemas/product.schema';
import {
  brands,
  categories,
  subcategories,
} from '@/modules/brands/schemas/brand.schema';
import { GetProductsDto, ProductSortBy } from '../dto/get-products.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import {
  GetInstallationMediaDto,
  MediaType,
} from '../dto/get-installation-media.dto';
import { resolveMediaUrl, resolveMediaUrls } from '@/common/utils/url.util';
import { PRODUCT_DEFAULTS } from '../constants/product.constants';
import type {
  IProduct,
  IProductsListResponse,
  IProductListItem,
  IProductVariant,
} from '../types/product.types';

@Injectable()
export class ProductsRepository {
  private readonly imageBaseUrl: string;

  constructor(
    @Inject(D1_DATABASE) private readonly db: D1Database,
    private readonly configService: ConfigService,
  ) {
    this.imageBaseUrl = this.configService.get<string>('IMAGE_BASE_URL') || '';
  }

  /**
   * Pipeline Query SQL: LEFT JOIN brands -> categories -> subcategories
   * & tính toán price / discount / priceRange trực tiếp trong câu SQL của Database Engine
   */
  private getProductAggregationSelect() {
    return {
      id: products.id,
      code: products.code,
      slug: products.slug,
      name: products.name,
      brandId: products.brandId,
      brand: sql<string>`COALESCE(${brands.name}, '')`,
      brandSlug: sql<string>`COALESCE(${brands.slug}, '')`,
      category: sql<string>`COALESCE(${products.categorySlug}, '')`,
      categoryName: sql<string>`COALESCE(${categories.name}, '')`,
      subcategory: sql<string>`COALESCE(${products.subcategorySlug}, '')`,
      subcategoryName: sql<string>`COALESCE(${subcategories.name}, '')`,
      description: products.description,
      shortDescription: products.shortDescription,
      content: products.content,
      imageUrl: products.imageUrl,
      images: products.images,
      price: sql<number | null>`
        CASE
          WHEN ${products.originalPrice} IS NOT NULL AND ${products.discountPercent} IS NOT NULL AND ${products.discountPercent} > 0 AND ${products.price} IS NULL
            THEN CAST(ROUND(${products.originalPrice} * (1.0 - ${products.discountPercent} / 100.0)) AS INTEGER)
          ELSE ${products.price}
        END
      `,
      originalPrice: products.originalPrice,
      discountPercent: sql<number | null>`
        CASE
          WHEN ${products.originalPrice} IS NOT NULL AND ${products.discountPercent} IS NOT NULL AND ${products.discountPercent} > 0
            THEN ${products.discountPercent}
          WHEN ${products.originalPrice} IS NOT NULL AND ${products.price} IS NOT NULL AND ${products.originalPrice} > ${products.price}
            THEN CAST(ROUND(((${products.originalPrice} - ${products.price}) * 100.0) / ${products.originalPrice}) AS INTEGER)
          ELSE NULL
        END
      `,
      priceRange: sql<string>`
        COALESCE(
          NULLIF(${products.priceRange}, ''),
          CASE
            WHEN ${products.price} IS NOT NULL THEN (${products.price} || ' VNĐ')
            ELSE ''
          END
        )
      `,
      features: products.features,
      specs: products.specs,
      technologies: products.technologies,
      warranty: products.warranty,
      warrantyText: products.warrantyText,
      colors: products.colors,
      installation: products.installation,
      installationManual: products.installationManual,
      faq: products.faq,
      has_variants: sql<boolean>`CASE WHEN ${products.hasVariants} = 1 THEN 1 ELSE 0 END`,
      options: products.options,
      variants: products.variants,
      priority: products.priority,
      createdAt: products.createdAt,
    };
  }

  /**
   * Truy vấn danh sách phân trang (Aggregation SQL Pipeline)
   */
  async findAllPaginated(
    query: GetProductsDto,
  ): Promise<IProductsListResponse> {
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

    const conditions: any[] = [];

    // Filter Brand
    if (brandId !== undefined && brandId !== null) {
      conditions.push(eq(products.brandId, String(brandId)));
    } else if (brand && brand.trim()) {
      const bSlug = brand.trim().toLowerCase();
      const brandDoc = await this.db.query.brands.findFirst({
        where: or(eq(brands.slug, bSlug), eq(brands.name, bSlug)),
      });
      if (brandDoc) {
        conditions.push(eq(products.brandId, brandDoc.id));
      }
    }

    // Filter Category
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
        conditions.push(inArray(products.categorySlug, lockSlugs));
      } else {
        conditions.push(eq(products.categorySlug, queryCat));
      }
    }

    // Filter Subcategory
    if (subcategory && subcategory.trim()) {
      conditions.push(
        eq(products.subcategorySlug, subcategory.trim().toLowerCase()),
      );
    }

    // Filter Price Range
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      conditions.push(gte(products.price, minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      conditions.push(lte(products.price, maxPrice));
    }

    // Search
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          like(products.code, term),
          like(products.name, term),
          like(products.slug, term),
          like(products.description, term),
          like(products.features, term),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    let orderByClause: any[] = [
      asc(products.priority),
      desc(products.createdAt),
    ];
    if (sortBy === ProductSortBy.PRICE_ASC) {
      orderByClause = [asc(products.price)];
    } else if (sortBy === ProductSortBy.PRICE_DESC) {
      orderByClause = [desc(products.price)];
    }

    const [rows, countResult] = await Promise.all([
      this.db
        .select(this.getProductAggregationSelect())
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(
          categories,
          and(
            eq(products.brandId, categories.brandId),
            or(
              eq(products.categorySlug, categories.slug),
              eq(products.categorySlug, categories.name),
            ),
          ),
        )
        .leftJoin(
          subcategories,
          and(
            eq(categories.id, subcategories.categoryId),
            or(
              eq(products.subcategorySlug, subcategories.slug),
              eq(products.subcategorySlug, subcategories.name),
            ),
          ),
        )
        .where(whereClause)
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    const items: IProductListItem[] = rows.map((r) => {
      const features = Array.isArray(r.features) ? r.features : [];
      return {
        id: r.slug || r.id,
        code: r.code,
        name: r.name,
        brandId: r.brandId ?? null,
        brand: r.brand,
        brandSlug: r.brandSlug,
        category: r.category,
        categoryName: r.categoryName,
        subcategory: r.subcategory,
        subcategoryName: r.subcategoryName,
        imageUrl: resolveMediaUrl(r.imageUrl || '', this.imageBaseUrl),
        price: r.price,
        originalPrice: r.originalPrice,
        discountPercent: r.discountPercent,
        priceRange: r.priceRange,
        features: features.slice(0, 2),
        has_variants: !!r.has_variants,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Truy vấn chi tiết sản phẩm qua Aggregation SQL Pipeline
   */
  async findByIdOrCode(idOrCode: string): Promise<IProduct | undefined> {
    const clean = idOrCode.trim();
    const lower = clean.toLowerCase();

    const rows = await this.db
      .select(this.getProductAggregationSelect())
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(
        categories,
        and(
          eq(products.brandId, categories.brandId),
          or(
            eq(products.categorySlug, categories.slug),
            eq(products.categorySlug, categories.name),
          ),
        ),
      )
      .leftJoin(
        subcategories,
        and(
          eq(categories.id, subcategories.categoryId),
          or(
            eq(products.subcategorySlug, subcategories.slug),
            eq(products.subcategorySlug, subcategories.name),
          ),
        ),
      )
      .where(
        or(
          eq(products.id, clean),
          eq(products.code, clean),
          eq(products.slug, lower),
          like(products.code, clean),
          like(products.slug, lower),
        ),
      )
      .limit(1);

    const r = rows[0];
    if (!r) return undefined;

    const installationObj = r.installation || {
      images: [],
      videos: [],
    };
    const installationPreview = installationObj?.images
      ? resolveMediaUrls(
          installationObj.images.slice(
            0,
            PRODUCT_DEFAULTS.INSTALLATION_PREVIEW_LIMIT,
          ),
          this.imageBaseUrl,
        )
      : [];

    const rawVariants = r.variants || [];
    const variants: IProductVariant[] = Array.isArray(rawVariants)
      ? rawVariants.map((v: any) => ({
          id: v.id || randomUUID(),
          label: v.label || '',
          attributes: v.attributes || {},
          price: v.price ?? null,
          originalPrice: v.originalPrice ?? null,
          discountPercent: v.discountPercent ?? null,
          priceRange:
            v.priceRange ||
            (v.price ? `${v.price.toLocaleString('vi-VN')} VNĐ` : ''),
          is_default: !!v.is_default,
        }))
      : [];

    return {
      id: r.slug || r.id,
      code: r.code,
      slug: r.slug || r.id,
      brandId: r.brandId ?? null,
      brand: r.brand,
      brandSlug: r.brandSlug,
      category: r.category,
      categoryName: r.categoryName,
      subcategory: r.subcategory,
      subcategoryName: r.subcategoryName,
      name: r.name,
      description: r.description || '',
      shortDescription: r.shortDescription || '',
      content: r.content || '',
      imageUrl: resolveMediaUrl(r.imageUrl || '', this.imageBaseUrl),
      images: resolveMediaUrls(r.images || [], this.imageBaseUrl),
      price: r.price,
      originalPrice: r.originalPrice,
      discountPercent: r.discountPercent,
      priceRange: r.priceRange,
      features: r.features || [],
      specs: r.specs || {},
      technologies: r.technologies || [],
      warranty: typeof r.warranty === 'number' ? r.warranty : 36,
      warrantyText: r.warrantyText || '',
      colors: r.colors || [],
      installationManual: r.installationManual || [],
      faq: r.faq || [],
      has_variants: !!r.has_variants,
      options: r.options || [],
      variants,
      installation_preview: installationPreview,
    };
  }

  async findByCode(code: string): Promise<IProduct | null> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.code, code.trim()),
    });
    if (!row) return null;
    return (await this.findByIdOrCode(row.id)) || null;
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.slug, slug.trim()),
    });
    if (!row) return null;
    return (await this.findByIdOrCode(row.id)) || null;
  }

  async findOtherByCode(
    code: string,
    excludeId: string,
  ): Promise<IProduct | null> {
    const row = await this.db.query.products.findFirst({
      where: and(ne(products.id, excludeId), eq(products.code, code.trim())),
    });
    if (!row) return null;
    return (await this.findByIdOrCode(row.id)) || null;
  }

  async findOtherBySlug(
    slug: string,
    excludeId: string,
  ): Promise<IProduct | null> {
    const row = await this.db.query.products.findFirst({
      where: and(ne(products.id, excludeId), eq(products.slug, slug.trim())),
    });
    if (!row) return null;
    return (await this.findByIdOrCode(row.id)) || null;
  }

  async findByCodeOrSlug(code: string, slug?: string) {
    return this.db.query.products.findFirst({
      where: slug
        ? or(eq(products.code, code.trim()), eq(products.slug, slug.trim()))
        : eq(products.code, code.trim()),
    });
  }

  findInstallationMedia(product: IProduct, query: GetInstallationMediaDto) {
    const { page = 1, limit = 12, type = MediaType.ALL } = query;

    const installation = (product as any).installation ?? {
      images: [],
      videos: [],
    };
    const mediaItems: Array<{ url: string; type: 'image' | 'video' }> = [];

    if (type === MediaType.IMAGES || type === MediaType.ALL) {
      if (Array.isArray(installation.images)) {
        mediaItems.push(
          ...installation.images.map((url: string) => ({
            url: resolveMediaUrl(url, this.imageBaseUrl),
            type: 'image' as const,
          })),
        );
      }
    }
    if (type === MediaType.VIDEOS || type === MediaType.ALL) {
      if (Array.isArray(installation.videos)) {
        mediaItems.push(
          ...installation.videos.map((url: string) => ({
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

    return Promise.resolve({
      product_code: product.code,
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
    });
  }

  async createProduct(dto: CreateProductDto): Promise<IProduct> {
    const data: any = { ...dto };
    const newId = randomUUID();

    await this.db.insert(products).values({
      id: newId,
      code: data.code,
      slug:
        data.slug ||
        data.code
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-'),
      name: data.name,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      content: data.content || '',
      brandId: String(data.brandId),
      categorySlug: data.categorySlug || data.category,
      subcategorySlug: data.subcategorySlug || data.subcategory || null,
      price: data.price ?? null,
      originalPrice: data.originalPrice ?? null,
      discountPercent: data.discountPercent ?? null,
      priceRange: data.priceRange ?? null,
      imageUrl: data.imageUrl || '',
      images: data.images || [],
      features: data.features || [],
      specs: data.specs || {},
      technologies: data.technologies || [],
      warranty: data.warranty || 36,
      warrantyText: data.warrantyText || '',
      colors: data.colors || [],
      installation: data.installation || { images: [], videos: [] },
      installationManual: data.installationManual || [],
      faq: data.faq || [],
      hasVariants: data.has_variants || data.hasVariants || false,
      options: data.options || [],
      variants: data.variants || [],
      installationPreview: data.installation_preview || [],
      priority: data.priority ?? 9999,
      status: data.status || 'ACTIVE',
      views: 0,
    });

    const created = await this.findByIdOrCode(newId);
    return created!;
  }

  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
  ): Promise<IProduct> {
    const data: any = { ...dto };
    const updateData: any = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.shortDescription !== undefined)
      updateData.shortDescription = data.shortDescription;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.brandId !== undefined) updateData.brandId = String(data.brandId);
    if (data.categorySlug !== undefined || data.category !== undefined) {
      updateData.categorySlug = data.categorySlug || data.category;
    }
    if (data.subcategorySlug !== undefined || data.subcategory !== undefined) {
      updateData.subcategorySlug = data.subcategorySlug || data.subcategory;
    }
    if (data.price !== undefined) updateData.price = data.price;
    if (data.originalPrice !== undefined)
      updateData.originalPrice = data.originalPrice;
    if (data.discountPercent !== undefined)
      updateData.discountPercent = data.discountPercent;
    if (data.priceRange !== undefined) updateData.priceRange = data.priceRange;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.specs !== undefined) updateData.specs = data.specs;
    if (data.technologies !== undefined)
      updateData.technologies = data.technologies;
    if (data.warranty !== undefined) updateData.warranty = data.warranty;
    if (data.warrantyText !== undefined)
      updateData.warrantyText = data.warrantyText;
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.installation !== undefined)
      updateData.installation = data.installation;
    if (data.installationManual !== undefined)
      updateData.installationManual = data.installationManual;
    if (data.faq !== undefined) updateData.faq = data.faq;
    if (data.has_variants !== undefined || data.hasVariants !== undefined) {
      updateData.hasVariants = data.has_variants ?? data.hasVariants;
    }
    if (data.options !== undefined) updateData.options = data.options;
    if (data.variants !== undefined) updateData.variants = data.variants;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;

    await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId));

    const updated = await this.findByIdOrCode(productId);
    return updated!;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    await this.db.delete(products).where(eq(products.id, productId));
    return true;
  }

  async findAllRaw(): Promise<any[]> {
    return await this.db
      .select(this.getProductAggregationSelect())
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(
        categories,
        and(
          eq(products.brandId, categories.brandId),
          or(
            eq(products.categorySlug, categories.slug),
            eq(products.categorySlug, categories.name),
          ),
        ),
      )
      .leftJoin(
        subcategories,
        and(
          eq(categories.id, subcategories.categoryId),
          or(
            eq(products.subcategorySlug, subcategories.slug),
            eq(products.subcategorySlug, subcategories.name),
          ),
        ),
      );
  }
}
