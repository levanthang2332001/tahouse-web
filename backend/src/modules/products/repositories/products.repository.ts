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
import { products, type NewProduct } from '../schemas/product.schema';
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
  IProductRecord,
  IProductsListResponse,
  IProductListItem,
  IProductVariant,
} from '../types/product.types';

const DEFAULT_PRIORITY = 9999;

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
            WHEN ${products.price} IS NOT NULL AND ${products.price} > 0 THEN (${products.price} || ' VNĐ')
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

  /** Detail query (products + brand/category/subcategory names), shared by every single-product read. */
  private detailQuery() {
    return this.db
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

  /**
   * Tìm 1 sản phẩm theo DB id, slug hoặc mã (so khớp chính xác, không phân biệt hoa thường;
   * không dùng LIKE nên "%" và "_" không còn là ký tự đại diện).
   * Ưu tiên: DB id > slug > mã sản phẩm.
   */
  async findRecordByIdOrCode(
    idOrCode: string,
    options: { includeAdminFields?: boolean } = {},
  ): Promise<IProductRecord | undefined> {
    const clean = idOrCode.trim();
    if (!clean) return undefined;
    const lower = clean.toLowerCase();

    const rows = await this.detailQuery()
      .where(
        or(
          eq(products.id, clean),
          sql`LOWER(${products.slug}) = ${lower}`,
          sql`LOWER(${products.code}) = ${lower}`,
        ),
      )
      .orderBy(
        sql`CASE WHEN ${products.id} = ${clean} THEN 0 WHEN LOWER(${products.slug}) = ${lower} THEN 1 ELSE 2 END`,
      )
      .limit(1);

    const r = rows[0];
    if (!r) return undefined;
    return {
      dbId: r.id,
      product: this.mapDetailRow(r, options.includeAdminFields === true),
    };
  }

  /**
   * Truy vấn chi tiết sản phẩm qua Aggregation SQL Pipeline
   */
  async findByIdOrCode(
    idOrCode: string,
    options: { includeAdminFields?: boolean } = {},
  ): Promise<IProduct | undefined> {
    return (await this.findRecordByIdOrCode(idOrCode, options))?.product;
  }

  private mapDetailRow(r: any, includeAdminFields: boolean): IProduct {
    const installationObj = this.normalizeInstallation(r.installation);
    const installationPreview = resolveMediaUrls(
      installationObj.images.slice(
        0,
        PRODUCT_DEFAULTS.INSTALLATION_PREVIEW_LIMIT,
      ),
      this.imageBaseUrl,
    );

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

    const product: IProduct = {
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

    if (includeAdminFields) {
      // Full media (same URL form as `images`), so the edit form can send it back without losing anything
      product.installation = {
        images: resolveMediaUrls(installationObj.images, this.imageBaseUrl),
        videos: resolveMediaUrls(installationObj.videos, this.imageBaseUrl),
      };
      product.priority =
        typeof r.priority === 'number' ? r.priority : DEFAULT_PRIORITY;
    }

    return product;
  }

  private normalizeInstallation(value: unknown): {
    images: string[];
    videos: string[];
  } {
    const obj =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as { images?: unknown; videos?: unknown })
        : {};
    const strings = (list: unknown) =>
      Array.isArray(list)
        ? list.filter((item): item is string => typeof item === 'string')
        : [];
    return { images: strings(obj.images), videos: strings(obj.videos) };
  }

  /**
   * Reads return media as absolute URLs (IMAGE_BASE_URL + path); store them back as the original
   * path so a read-then-save round trip does not rewrite the stored values.
   */
  private toStoredMediaPath(url: string): string {
    const base = this.imageBaseUrl.replace(/\/$/, '');
    if (base && url.startsWith(`${base}/`)) return url.slice(base.length);
    return url;
  }

  private toStoredMediaPaths(urls: string[] | null | undefined): string[] {
    return (urls || []).map((url) => this.toStoredMediaPath(url));
  }

  private toStoredInstallation(value: unknown) {
    const installation = this.normalizeInstallation(value);
    return {
      images: this.toStoredMediaPaths(installation.images),
      videos: this.toStoredMediaPaths(installation.videos),
    };
  }

  /** Lightweight lookup (case-insensitive) used for the duplicate-code check. */
  async findByCode(
    code: string,
    excludeDbId?: string,
  ): Promise<{ id: string; code: string; slug: string } | null> {
    const lower = code.trim().toLowerCase();
    const condition = sql`LOWER(${products.code}) = ${lower}`;
    const row = await this.db.query.products.findFirst({
      where: excludeDbId
        ? and(ne(products.id, excludeDbId), condition)
        : condition,
      columns: { id: true, code: true, slug: true },
    });
    return row ?? null;
  }

  /** Lightweight lookup (case-insensitive) used for the duplicate-slug check. */
  async findBySlug(
    slug: string,
    excludeDbId?: string,
  ): Promise<{ id: string; code: string; slug: string } | null> {
    const lower = slug.trim().toLowerCase();
    const condition = sql`LOWER(${products.slug}) = ${lower}`;
    const row = await this.db.query.products.findFirst({
      where: excludeDbId
        ? and(ne(products.id, excludeDbId), condition)
        : condition,
      columns: { id: true, code: true, slug: true },
    });
    return row ?? null;
  }

  async findOtherByCode(code: string, excludeDbId: string) {
    return this.findByCode(code, excludeDbId);
  }

  async findOtherBySlug(slug: string, excludeDbId: string) {
    return this.findBySlug(slug, excludeDbId);
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

    // Needs a product read with `includeAdminFields` (the public detail only carries a 3-image preview)
    const installation = this.normalizeInstallation(product.installation);
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

  /**
   * Inserts a product. The service has already resolved `slug`, validated the brand tree
   * and checked for duplicates. "Liên hệ" (no price) is stored as price 0.
   */
  async createProduct(
    dto: CreateProductDto & { slug: string },
  ): Promise<IProduct | undefined> {
    const newId = randomUUID();

    await this.db.insert(products).values({
      id: newId,
      code: dto.code,
      slug: dto.slug,
      name: dto.name,
      description: dto.description ?? '',
      shortDescription: dto.shortDescription ?? '',
      content: dto.content ?? '',
      brandId: dto.brandId,
      categorySlug: dto.category,
      subcategorySlug: dto.subcategory || null,
      price: dto.price ?? 0,
      originalPrice: dto.originalPrice ?? null,
      discountPercent: dto.discountPercent ?? null,
      priceRange: dto.priceRange ?? null,
      imageUrl: this.toStoredMediaPath(dto.imageUrl ?? ''),
      images: this.toStoredMediaPaths(dto.images),
      features: dto.features ?? [],
      specs: (dto.specs ?? {}) as Record<string, string>,
      technologies: dto.technologies ?? [],
      warranty: dto.warranty ?? 36,
      warrantyText: dto.warrantyText ?? '',
      colors: dto.colors ?? [],
      installation: this.toStoredInstallation(dto.installation),
      installationManual: dto.installationManual ?? [],
      faq: dto.faq ?? [],
      hasVariants: dto.has_variants ?? false,
      options: dto.options ?? [],
      variants: (dto.variants ?? []) as IProductVariant[],
      installationPreview: this.toStoredMediaPaths(dto.installation_preview),
      priority: dto.priority ?? DEFAULT_PRIORITY,
      status: 'ACTIVE',
      views: 0,
    });

    return this.findByIdOrCode(newId, { includeAdminFields: true });
  }

  /**
   * Updates the row whose real primary key is `dbId` (never the public slug id).
   * Returns `undefined` when no row was updated, so callers never report a phantom success.
   * `null` clears nullable columns (originalPrice, discountPercent, priceRange, subcategory);
   * for NOT NULL columns it falls back to the column's empty value instead of failing.
   */
  async updateProduct(
    dbId: string,
    dto: UpdateProductDto,
  ): Promise<IProduct | undefined> {
    const updateData: Partial<NewProduct> = { updatedAt: new Date() };

    if (dto.name != null) updateData.name = dto.name;
    if (dto.code != null) updateData.code = dto.code;
    if (dto.slug) updateData.slug = dto.slug;
    if (dto.description !== undefined)
      updateData.description = dto.description ?? '';
    if (dto.shortDescription !== undefined)
      updateData.shortDescription = dto.shortDescription ?? '';
    if (dto.content !== undefined) updateData.content = dto.content ?? '';
    if (dto.brandId != null) updateData.brandId = dto.brandId;
    if (dto.category) updateData.categorySlug = dto.category;
    if (dto.subcategory !== undefined)
      updateData.subcategorySlug = dto.subcategory || null;
    if (dto.price !== undefined) updateData.price = dto.price ?? 0;
    if (dto.originalPrice !== undefined)
      updateData.originalPrice = dto.originalPrice;
    if (dto.discountPercent !== undefined)
      updateData.discountPercent = dto.discountPercent;
    if (dto.priceRange !== undefined) updateData.priceRange = dto.priceRange;
    if (dto.imageUrl !== undefined)
      updateData.imageUrl = this.toStoredMediaPath(dto.imageUrl ?? '');
    if (dto.images !== undefined)
      updateData.images = this.toStoredMediaPaths(dto.images);
    if (dto.features !== undefined) updateData.features = dto.features ?? [];
    if (dto.specs !== undefined)
      updateData.specs = (dto.specs ?? {}) as Record<string, string>;
    if (dto.technologies !== undefined)
      updateData.technologies = dto.technologies ?? [];
    if (dto.warranty != null) updateData.warranty = dto.warranty;
    if (dto.warrantyText !== undefined)
      updateData.warrantyText = dto.warrantyText ?? '';
    if (dto.colors !== undefined) updateData.colors = dto.colors ?? [];
    if (dto.installation !== undefined)
      updateData.installation = this.toStoredInstallation(dto.installation);
    if (dto.installation_preview !== undefined)
      updateData.installationPreview = this.toStoredMediaPaths(
        dto.installation_preview,
      );
    if (dto.installationManual !== undefined)
      updateData.installationManual = dto.installationManual ?? [];
    if (dto.faq !== undefined) updateData.faq = dto.faq ?? [];
    if (dto.has_variants != null) updateData.hasVariants = dto.has_variants;
    if (dto.options !== undefined) updateData.options = dto.options ?? [];
    if (dto.variants !== undefined)
      updateData.variants = (dto.variants ?? []) as IProductVariant[];
    if (dto.priority !== undefined)
      updateData.priority = dto.priority ?? DEFAULT_PRIORITY;

    const updatedRows = await this.db
      .update(products)
      .set(updateData)
      .where(eq(products.id, dbId))
      .returning({ id: products.id });

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return undefined;
    }

    return this.findByIdOrCode(dbId, { includeAdminFields: true });
  }

  /** Deletes by real primary key; `false` when nothing was deleted. */
  async deleteProduct(dbId: string): Promise<boolean> {
    const deletedRows = await this.db
      .delete(products)
      .where(eq(products.id, dbId))
      .returning({ id: products.id });
    return Array.isArray(deletedRows) && deletedRows.length > 0;
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
