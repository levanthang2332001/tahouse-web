import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import { media, Media, NewMedia, MediaType } from '../schemas/media.schema';
import { QueryMediaDto } from '../dto/query-media.dto';
import { MediaResponseDto } from '../dto/media-response.dto';

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
    } = query;

    const conditions: any[] = [];

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

  async findByIdOrKey(
    idOrKey: string,
    cleanKey?: string,
  ): Promise<Media | undefined> {
    const conditions = [eq(media.id, idOrKey), eq(media.key, idOrKey)];
    if (cleanKey && cleanKey !== idOrKey) {
      conditions.push(eq(media.key, cleanKey));
    }

    return this.db.query.media.findFirst({
      where: or(...conditions),
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(media).where(eq(media.id, id));
  }
}
