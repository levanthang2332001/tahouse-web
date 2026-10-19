import { Test, TestingModule } from '@nestjs/testing';
import { UploadService, slugify } from './upload.service';
import { MediaRepository } from './repositories/media.repository';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaType } from './schemas/media.schema';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    PutObjectCommand: jest.fn().mockImplementation((args) => args),
    DeleteObjectCommand: jest.fn().mockImplementation((args) => args),
  };
});

describe('UploadService', () => {
  let service: UploadService;
  let mediaRepository: jest.Mocked<MediaRepository>;
  let configService: jest.Mocked<ConfigService>;

  const mockMedia = {
    id: 'media-1',
    filename: 'test-image.jpg',
    url: 'https://cdn.tahouse.vn/products/test-image.jpg',
    key: 'products/test-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    folder: 'products',
    brand: null,
    category: null,
    subcategory: null,
    productCode: null,
    metadata: {
      extension: '.jpg',
      width: 800,
      height: 600,
      aspectRatio: '4:3',
      duration: null,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mediaRepository = {
      findAllPaginated: jest.fn().mockResolvedValue({
        items: [mockMedia],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      findById: jest.fn().mockResolvedValue(mockMedia),
      findByIdOrKey: jest.fn().mockResolvedValue(mockMedia),
      create: jest.fn().mockResolvedValue(mockMedia),
      delete: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<MediaRepository>;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'R2_ACCOUNT_ID') return 'mock-account-id';
        if (key === 'R2_ACCESS_KEY_ID') return 'mock-key-id';
        if (key === 'R2_SECRET_ACCESS_KEY') return 'mock-secret-key';
        if (key === 'R2_BUCKET_NAME') return 'tahouse-media';
        if (key === 'R2_PUBLIC_URL') return 'https://cdn.tahouse.vn';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: MediaRepository,
          useValue: mediaRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    service.onModuleInit();
  });

  describe('slugify utility', () => {
    it('should convert vietnamese diacritics and special characters to slug', () => {
      expect(slugify('Khóa Cửa Thông Minh Yale')).toBe(
        'khoa-cua-thong-minh-yale',
      );
      expect(slugify('Đại sảnh & Biệt thự')).toBe('dai-sanh-biet-thu');
      expect(slugify('')).toBe('');
    });
  });

  describe('determineFileType', () => {
    it('should correctly classify media mime types', () => {
      expect(service.determineFileType('image/png', 'photo.png')).toBe(
        MediaType.IMAGE,
      );
      expect(service.determineFileType('video/mp4', 'intro.mp4')).toBe(
        MediaType.VIDEO,
      );
      expect(service.determineFileType('application/pdf', 'manual.pdf')).toBe(
        MediaType.DOCUMENT,
      );
      expect(service.determineFileType('text/plain', 'other.xyz')).toBe(
        MediaType.OTHER,
      );
    });
  });

  describe('resolveSubfolder', () => {
    it('should return default folder when no options provided', () => {
      expect(service.resolveSubfolder(undefined, 'products')).toBe('products');
    });

    it('should construct hierarchical folder based on brand, category, productCode', () => {
      const folder = service.resolveSubfolder({
        brand: 'Yale',
        category: 'Khóa Cửa Gỗ',
        subcategory: 'Vân Tay',
        productCode: 'YDM-7116',
      });
      expect(folder).toBe('products/yale/khoa-cua-go/van-tay/ydm-7116');
    });
  });

  describe('uploadSingle', () => {
    it('should throw BadRequestException if file is empty', async () => {
      const mockFile = {
        buffer: Buffer.from(''),
        size: 0,
        mimetype: 'image/jpeg',
        originalname: 'empty.jpg',
      } as Express.Multer.File;

      await expect(service.uploadSingle(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file exceeds size limit', async () => {
      const mockFile = {
        buffer: Buffer.alloc(20 * 1024 * 1024), // 20MB > 15MB limit for images
        size: 20 * 1024 * 1024,
        mimetype: 'image/jpeg',
        originalname: 'large.jpg',
      } as Express.Multer.File;

      await expect(service.uploadSingle(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should upload valid file and save record to repository', async () => {
      const mockFile = {
        buffer: Buffer.from('test image content'),
        size: 18,
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const result = await service.uploadSingle(mockFile);

      expect(mediaRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockMedia);
    });
  });

  describe('findAll', () => {
    it('should return paginated media list', async () => {
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.items).toEqual([mockMedia]);
      expect(mediaRepository.findAllPaginated).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return media item if found', async () => {
      const result = await service.findById('media-1');
      expect(result).toEqual(mockMedia);
    });

    it('should throw NotFoundException if media item not found', async () => {
      mediaRepository.findById.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteMedia', () => {
    it('should throw BadRequestException if idOrKey is empty', async () => {
      await expect(service.deleteMedia('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete from R2 and remove database record', async () => {
      const result = await service.deleteMedia('media-1');

      expect(mediaRepository.delete).toHaveBeenCalledWith('media-1');
      expect(result.deletedId).toBe('media-1');
      expect(result.key).toBe('products/test-image.jpg');
    });
  });
});
