import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, or, like, desc, sql, SQL } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import { media, Media, NewMedia, MediaType } from '../schemas/media.schema';
// Chỉ đọc (kiểm tra tệp đang được sử dụng trước khi xóa)
import { products } from '../../products/schemas/product.schema';
import { brands } from '../../brands/schemas/brand.schema';
import { storeSettings } from '../../settings/schemas/settings.schema';
import { QueryMediaDto } from '../dto/query-media.dto';
import { MediaResponseDto } from '../dto/media-response.dto';

/** Các danh sách ảnh trong store_settings.metadata_json */
export const SETTINGS_MEDIA_LISTS = [
  'heroBanners',
  'storeImages',
  'promoBanners',
] as const;

export type SettingsMediaList = (typeof SETTINGS_MEDIA_LISTS)[number];

export interface MediaUsage {
  products: { id: string; code: string }[];
  brands: { id: string; name: string }[];
  /** Tên danh sách trong cài đặt cửa hàng, hoặc 'other' nếu nằm ở trường khác của metadata */
  settings: (SettingsMediaList | 'other')[];
}

export const isMediaInUse = (usage: MediaUsage): boolean =>
  usage.products.length > 0 ||
  usage.brands.length > 0 ||
  usage.settings.length > 0;

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

@Injectable()
export class MediaRepository {
  private readonly publicUrl: string;
  private readonly bucketName: string;

  constructor(
    @Inject(D1_DATABASE) private readonly db: D1Database,
    private readonly configService: ConfigService,
  ) {
    this.publicUrl = (
      this.configService.get<string>('R2_PUBLIC_URL') ||
      this.configService.get<string>('IMAGE_BASE_URL') ||
      ''
    ).replace(/\/+$/, '');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';
  }

  async create(data: NewMedia): Promise<MediaResponseDto> {
    await this.db.insert(media).values(data);
    return MediaResponseDto.fromEntity(data, this.publicUrl, this.bucketName)!;
  }

  async findAllPaginated(query: QueryMediaDto): Promise<{
    items: MediaResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 20,
      fileType,
      brand,
      category,
      subcategory,
      productCode,
      search,
      folder,
    } = query;

    const conditions: any[] = [];

    if (folder) {
      // Thư mục gốc bao gồm cả các thư mục con (vd. products/kaadas/...)
      const base = folder.toLowerCase().trim();
      conditions.push(
        or(eq(media.folder, base), like(media.folder, `${base}/%`)),
      );
    }

    if (brand) {
      conditions.push(eq(media.brand, brand.toLowerCase().trim()));
    }

    if (category) {
      conditions.push(eq(media.category, category.toLowerCase().trim()));
    }

    if (subcategory) {
      conditions.push(eq(media.subcategory, subcategory.toLowerCase().trim()));
    }

    if (productCode) {
      conditions.push(like(media.productCode, `%${productCode.trim()}%`));
    }

    if (fileType) {
      if (fileType === MediaType.IMAGE) {
        conditions.push(like(media.mimeType, 'image/%'));
      } else if (fileType === MediaType.VIDEO) {
        conditions.push(like(media.mimeType, 'video/%'));
      } else if (fileType === MediaType.AUDIO) {
        conditions.push(like(media.mimeType, 'audio/%'));
      } else if (fileType === MediaType.DOCUMENT) {
        conditions.push(
          or(
            like(media.mimeType, '%pdf%'),
            like(media.mimeType, '%document%'),
            like(media.mimeType, '%sheet%'),
            like(media.mimeType, '%zip%'),
          ),
        );
      }
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          like(media.filename, term),
          like(media.key, term),
          like(media.productCode, term),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      this.db
        .select()
        .from(media)
        .where(whereClause)
        .orderBy(desc(media.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(media)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      items: items.map(
        (item) =>
          MediaResponseDto.fromEntity(item, this.publicUrl, this.bucketName)!,
      ),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string): Promise<MediaResponseDto | null> {
    const item = await this.db.query.media.findFirst({
      where: eq(media.id, id),
    });
    return item
      ? MediaResponseDto.fromEntity(item, this.publicUrl, this.bucketName)
      : null;
  }

  /**
   * Tìm bản ghi media theo id, key hoặc URL công khai. Chỉ những tệp có bản ghi trong D1
   * mới được phép xóa, vì vậy không bao giờ suy ra key R2 từ dữ liệu client gửi lên.
   */
  async findByIdOrKey(
    idOrKey: string,
    cleanKey?: string,
  ): Promise<Media | undefined> {
    const conditions = [
      eq(media.id, idOrKey),
      eq(media.key, idOrKey),
      eq(media.url, idOrKey),
    ];
    if (cleanKey && cleanKey !== idOrKey) {
      conditions.push(eq(media.key, cleanKey));
    }

    return this.db.query.media.findFirst({
      where: or(...conditions),
    });
  }

  /**
   * Tìm các nơi đang tham chiếu tới tệp (sản phẩm, logo thương hiệu, ảnh trong cài đặt cửa hàng).
   * So khớp chuỗi con chính xác bằng instr() để không phụ thuộc ký tự đại diện của LIKE.
   */
  async findUsages(needles: string[]): Promise<MediaUsage> {
    const terms = Array.from(
      new Set(needles.map((n) => (n || '').trim()).filter(Boolean)),
    );
    if (terms.length === 0) return { products: [], brands: [], settings: [] };

    const contains = (column: AnySQLiteColumn): SQL =>
      or(...terms.map((t) => sql`instr(${column}, ${t}) > 0`))!;
    const anyColumn = (columns: AnySQLiteColumn[]): SQL =>
      or(...columns.map(contains))!;

    const [productRows, brandRows, settingsRows] = await Promise.all([
      this.db
        .select({ id: products.id, code: products.code })
        .from(products)
        .where(
          anyColumn([
            products.imageUrl,
            products.images,
            products.installation,
            products.installationManual,
            products.installationPreview,
            products.content,
            products.description,
            products.shortDescription,
            products.variants,
            products.options,
          ]),
        ),
      this.db
        .select({ id: brands.id, name: brands.name })
        .from(brands)
        .where(anyColumn([brands.logo, brands.logoHtml])),
      this.db.select({ metadata: storeSettings.metadata }).from(storeSettings),
    ]);

    const settings = new Set<SettingsMediaList | 'other'>();
    const includesTerm = (value: unknown): boolean => {
      if (value === null || value === undefined) return false;
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      return terms.some((t) => text.includes(t));
    };
    for (const row of settingsRows) {
      const metadata = parseJsonObject(row.metadata);
      if (!metadata) continue;
      const rest: Record<string, unknown> = { ...metadata };
      for (const list of SETTINGS_MEDIA_LISTS) {
        if (includesTerm(metadata[list])) settings.add(list);
        delete rest[list];
      }
      if (includesTerm(rest)) settings.add('other');
    }

    return {
      products: productRows.map((r) => ({ id: r.id, code: r.code })),
      brands: brandRows.map((r) => ({ id: r.id, name: r.name })),
      settings: Array.from(settings),
    };
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(media).where(eq(media.id, id));
  }
}
