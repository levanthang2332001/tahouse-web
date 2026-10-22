import { Test, TestingModule } from '@nestjs/testing';
import { MediaRepository } from './media.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { ConfigService } from '@nestjs/config';
import { NewMedia } from '../schemas/media.schema';

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
    };

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

  describe('delete', () => {
    it('should delete media record from database by id', async () => {
      await repository.delete('media-uuid-1');

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
