import { Test, TestingModule } from '@nestjs/testing';
import { MediaRepository } from './media.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { ConfigService } from '@nestjs/config';
import { NewMedia } from '../schemas/media.schema';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';
import type { SQL } from 'drizzle-orm';

const dialect = new SQLiteSyncDialect();
const toSql = (condition: SQL) => dialect.sqlToQuery(condition);

describe('MediaRepository', () => {
  let repository: MediaRepository;
  let mockDb: any;
  let configService: jest.Mocked<ConfigService>;

  const mockMediaEntity = {
    id: 'media-uuid-1',
    filename: 'image.jpg',
    url: 'https://cdn.tahouse.vn/products/image.jpg',
    key: 'products/image.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    folder: 'products',
    brand: 'yale',
    category: 'cua-go',
    subcategory: 'van-tay',
    productCode: 'YDM-7116',
    metadata: { width: 800, height: 600 },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        media: {
          findFirst: jest.fn(),
        },
      },
      select: jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([mockMediaEntity]),
              }),
            }),
          }),
        }),
      })),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'R2_PUBLIC_URL') return 'https://cdn.tahouse.vn';
        if (key === 'R2_BUCKET_NAME') return 'tahouse-media';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaRepository,
        {
          provide: D1_DATABASE,
          useValue: mockDb,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    repository = module.get<MediaRepository>(MediaRepository);
  });

  describe('create', () => {
    it('should insert new media record and return mapped DTO', async () => {
      const newMedia: NewMedia = {
        id: 'media-uuid-1',
        filename: 'image.jpg',
        url: 'https://cdn.tahouse.vn/products/image.jpg',
        key: 'products/image.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        folder: 'products',
      };

      const result = await repository.create(newMedia);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result.key).toBe('products/image.jpg');
    });
  });

  describe('findById', () => {
    it('should query media item by id and return DTO', async () => {
      mockDb.query.media.findFirst.mockResolvedValue(mockMediaEntity);

      const result = await repository.findById('media-uuid-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('media-uuid-1');
      expect(mockDb.query.media.findFirst).toHaveBeenCalled();
    });

    it('should return null when media item does not exist', async () => {
      mockDb.query.media.findFirst.mockResolvedValue(null);

      const result = await repository.findById('unknown');

      expect(result).toBeNull();
    });
  });

  describe('findAllPaginated folder filter (bug 7)', () => {
    it('filters by the root folder including sub-folders', async () => {
      const whereSpy = jest.fn();
      mockDb.select = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockImplementation((cond) => {
            whereSpy(cond);
            const rows = [{ count: 0 }];
            return Object.assign(Promise.resolve(rows), {
              orderBy: () => ({
                limit: () => ({ offset: () => Promise.resolve([]) }),
              }),
            });
          }),
        }),
      }));

      await repository.findAllPaginated({
        page: 1,
        limit: 20,
        folder: 'Products',
      });

      const { sql, params } = toSql(whereSpy.mock.calls[0][0]);
      expect(sql).toContain('"media"."folder" = ?');
      expect(sql).toContain('"media"."folder" like ?');
      expect(params).toEqual(['products', 'products/%']);
    });
  });

  describe('findUsages (bug 5)', () => {
    const setup = (opts: {
      products?: any[];
      brands?: any[];
      settings?: any[];
    }) => {
      const wheres: SQL[] = [];
      let call = 0;
      mockDb.select = jest.fn().mockImplementation(() => {
        const index = call++;
        const result =
          index === 0
            ? (opts.products ?? [])
            : index === 1
              ? (opts.brands ?? [])
              : (opts.settings ?? []);
        const from = Object.assign(Promise.resolve(result), {
          where: (cond: SQL) => {
            wheres.push(cond);
            return Promise.resolve(result);
          },
        });
        return { from: () => from };
      });
      return wheres;
    };

    it('searches product, brand columns with exact substring match', async () => {
      const wheres = setup({
        products: [{ id: 'p1', code: 'KL-989F' }],
        brands: [{ id: 'b1', name: 'Kaadas' }],
      });

      const usage = await repository.findUsages([
        'products/a_b%.jpg',
        'products/a_b%.jpg',
        '',
      ]);

      expect(usage.products).toEqual([{ id: 'p1', code: 'KL-989F' }]);
      expect(usage.brands).toEqual([{ id: 'b1', name: 'Kaadas' }]);
      const productQuery = toSql(wheres[0]);
      expect(productQuery.sql).toContain('instr("products"."image_url", ?)');
      expect(productQuery.sql).toContain('instr("products"."images_json", ?)');
      expect(productQuery.sql).toContain(
        'instr("products"."installation_json", ?)',
      );
      expect(productQuery.sql).toContain('instr("products"."content", ?)');
      expect(productQuery.sql).not.toContain('like');
      // Giá trị trùng / rỗng bị loại bỏ
      expect(new Set(productQuery.params)).toEqual(
        new Set(['products/a_b%.jpg']),
      );
      expect(toSql(wheres[1]).sql).toContain('instr("brands"."logo", ?)');
    });

    it('reports which store settings lists reference the file', async () => {
      setup({
        settings: [
          {
            metadata: {
              heroBanners: ['https://cdn/x/banners/a.jpg'],
              storeImages: ['/store/1.jpg'],
              promoBanners: ['https://cdn/x/banners/a.jpg?v=2'],
              aboutImage: 'https://cdn/x/banners/a.jpg',
            },
          },
          { metadata: JSON.stringify({ storeImages: ['banners/a.jpg'] }) },
          { metadata: null },
        ],
      });

      const usage = await repository.findUsages(['banners/a.jpg']);

      expect(usage.settings.sort()).toEqual(
        ['heroBanners', 'other', 'promoBanners', 'storeImages'].sort(),
      );
    });

    it('returns no usage without querying when no needle is given', async () => {
      mockDb.select = jest.fn();
      const usage = await repository.findUsages(['', '  ']);
      expect(usage).toEqual({ products: [], brands: [], settings: [] });
      expect(mockDb.select).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete media record from database by id', async () => {
      await repository.delete('media-uuid-1');

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
