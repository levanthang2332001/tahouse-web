import { Test, TestingModule } from '@nestjs/testing';
import { UploadService, slugify, MultiUploadResult } from './upload.service';
import { MediaRepository } from './repositories/media.repository';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { MediaType } from './schemas/media.schema';
import { MediaResponseDto } from './dto/media-response.dto';
import { sniffFileType } from './utils/file-sniff';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    PutObjectCommand: jest
      .fn()
      .mockImplementation((args) => ({ type: 'put', ...args })),
    DeleteObjectCommand: jest
      .fn()
      .mockImplementation((args) => ({ type: 'delete', ...args })),
  };
});

// ---- Buffers có magic bytes thật ----
const pad = (head: number[] | Buffer, size = 64) =>
  Buffer.concat([Buffer.from(head), Buffer.alloc(size)]);
const ftyp = (major: string, compatible: string[] = []) => {
  const brands = [major, '\0\0\0\0', ...compatible].join('');
  const size = 8 + brands.length;
  const header = Buffer.alloc(4);
  header.writeUInt32BE(size);
  return pad(Buffer.concat([header, Buffer.from(`ftyp${brands}`, 'latin1')]));
};
const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF = pad(Buffer.from('GIF89a'));
const WEBP = pad(
  Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('WEBPVP8 '),
  ]),
);
const AVIF = ftyp('avif', ['mif1', 'miaf']);
const MP4 = ftyp('isom', ['isom', 'mp42']);
const MOV = ftyp('qt  ', ['qt  ']);
const WEBM = pad(
  Buffer.concat([
    Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x82, 0x84]),
    Buffer.from('webm'),
  ]),
);
const MKV = pad(
  Buffer.concat([
    Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x82, 0x88]),
    Buffer.from('matroska'),
  ]),
);
const HEIC = ftyp('heic', ['mif1', 'heic']);
const SVG = Buffer.from(
  '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
);
const PDF = pad(Buffer.from('%PDF-1.7'));

const makeFile = (
  buffer: Buffer,
  originalname = 'test.jpg',
  mimetype = 'image/jpeg',
): Express.Multer.File =>
  ({
    buffer,
    size: buffer.length,
    mimetype,
    originalname,
  }) as Express.Multer.File;

const httpStatusOf = async (promise: Promise<unknown>): Promise<number> => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HttpException) return error.getStatus();
    throw error;
  }
  throw new Error('Expected promise to reject');
};

describe('UploadService', () => {
  let service: UploadService;
  let mediaRepository: jest.Mocked<MediaRepository>;
  let configService: jest.Mocked<ConfigService>;
  let s3Send: jest.Mock;

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

  const noUsage = { products: [], brands: [], settings: [] };

  const putCalls = () =>
    s3Send.mock.calls.map(([cmd]) => cmd).filter((c) => c.type === 'put');
  const deleteCalls = () =>
    s3Send.mock.calls.map(([cmd]) => cmd).filter((c) => c.type === 'delete');

  beforeEach(async () => {
    mediaRepository = {
      findAllPaginated: jest.fn().mockResolvedValue({
        items: [mockMedia],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      }),
      findById: jest.fn().mockResolvedValue(mockMedia),
      findByIdOrKey: jest.fn().mockResolvedValue(mockMedia),
      findUsages: jest.fn().mockResolvedValue(noUsage),
      create: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve(
            MediaResponseDto.fromEntity(data, 'https://cdn.tahouse.vn'),
          ),
        ),
      delete: jest.fn().mockResolvedValue(undefined),
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
    s3Send = (service as any).s3Client.send;
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

  describe('sniffFileType (bug 4)', () => {
    it.each([
      ['jpeg', JPEG, 'image/jpeg', '.jpg'],
      ['png', PNG, 'image/png', '.png'],
      ['gif', GIF, 'image/gif', '.gif'],
      ['webp', WEBP, 'image/webp', '.webp'],
      ['avif', AVIF, 'image/avif', '.avif'],
      ['mp4', MP4, 'video/mp4', '.mp4'],
      ['mov', MOV, 'video/quicktime', '.mov'],
      ['webm', WEBM, 'video/webm', '.webm'],
    ])('detects %s from magic bytes', (_name, buf, mime, ext) => {
      expect(sniffFileType(buf)).toMatchObject({ mime, ext });
    });

    it.each([
      ['svg', SVG],
      ['pdf', PDF],
      ['heic', HEIC],
      ['matroska', MKV],
      ['plain text', Buffer.from('hello world, this is not an image')],
      ['too short', Buffer.from([0xff, 0xd8])],
    ])('rejects %s', (_name, buf) => {
      expect(sniffFileType(buf)).toBeNull();
    });
  });

  describe('resolveSubfolder (bug 10)', () => {
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

    it.each(['products', 'jobs', 'brands', 'banners', 'promo', 'store'])(
      'accepts folder "%s" used by existing uploaders',
      (folder) => {
        expect(service.resolveSubfolder({ folder })).toBe(folder);
      },
    );

    it.each(['../etc', 'random', 'products/../../x', 'tmp'])(
      'rejects folder "%s" with 400',
      async (folder) => {
        expect(() => service.resolveSubfolder({ folder })).toThrow(
          HttpException,
        );
        expect(
          await httpStatusOf(service.uploadSingle(makeFile(JPEG), { folder })),
        ).toBe(400);
        expect(s3Send).not.toHaveBeenCalled();
      },
    );

    it('does not let sub-segments add extra folder levels', () => {
      expect(
        service.resolveSubfolder({ folder: 'products', brand: 'a/../b' }),
      ).toBe('products/a-b');
    });
  });

  describe('uploadSingle', () => {
    it('rejects an empty file with 400', async () => {
      expect(
        await httpStatusOf(service.uploadSingle(makeFile(Buffer.from('')))),
      ).toBe(400);
    });

    it('rejects an image above 15MB with 400', async () => {
      const big = Buffer.concat([JPEG, Buffer.alloc(16 * 1024 * 1024)]);
      expect(await httpStatusOf(service.uploadSingle(makeFile(big)))).toBe(400);
      expect(s3Send).not.toHaveBeenCalled();
    });

    it('rejects SVG even when the client claims image/jpeg (bug 4)', async () => {
      const promise = service.uploadSingle(
        makeFile(SVG, 'logo.jpg', 'image/jpeg'),
      );
      await expect(promise).rejects.toThrow(/JPG, PNG, WebP, GIF, AVIF/);
      expect(
        await httpStatusOf(
          service.uploadSingle(makeFile(SVG, 'logo.svg', 'image/svg+xml')),
        ),
      ).toBe(400);
      expect(s3Send).not.toHaveBeenCalled();
      expect(mediaRepository.create).not.toHaveBeenCalled();
    });

    it('stores ContentType and extension from the sniffed type, not the client (bug 4, 10)', async () => {
      const result = await service.uploadSingle(
        makeFile(PNG, 'Ảnh Sản Phẩm.php', 'text/plain'),
        { folder: 'products' },
      );

      const [put] = putCalls();
      expect(put.ContentType).toBe('image/png');
      expect(put.Key).toMatch(
        /^products\/anh-san-pham-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/,
      );
      expect(mediaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ mimeType: 'image/png', key: put.Key }),
      );
      // Định dạng response 1 tệp giữ nguyên: data.url
      expect(result.url).toBe(`https://cdn.tahouse.vn/${put.Key}`);
    });

    it('uses a fresh UUID key for every upload of the same name (bug 10)', async () => {
      await service.uploadSingle(makeFile(JPEG, 'same.jpg'));
      await service.uploadSingle(makeFile(JPEG, 'same.jpg'));
      const [a, b] = putCalls();
      expect(a.Key).not.toBe(b.Key);
    });

    it('uploads videos to the videos folder with sniffed mime', async () => {
      await service.uploadSingle(makeFile(MOV, 'clip.mp4', 'video/mp4'));
      const [put] = putCalls();
      expect(put.ContentType).toBe('video/quicktime');
      expect(put.Key).toMatch(/^videos\/clip-.*\.mov$/);
    });

    it('returns 502 and saves nothing when the R2 upload fails', async () => {
      s3Send.mockRejectedValueOnce(new Error('R2 down'));
      expect(await httpStatusOf(service.uploadSingle(makeFile(JPEG)))).toBe(
        502,
      );
      expect(mediaRepository.create).not.toHaveBeenCalled();
    });

    it('awaits the D1 insert and deletes the uploaded R2 object when it fails (bug 9)', async () => {
      mediaRepository.create.mockRejectedValueOnce(new Error('D1 error'));

      const promise = service.uploadSingle(makeFile(JPEG));
      expect(await httpStatusOf(promise)).toBe(500);

      const [put] = putCalls();
      const [del] = deleteCalls();
      expect(del).toBeDefined();
      expect(del.Key).toBe(put.Key);
    });
  });

  describe('uploadFiles (bug 3)', () => {
    it('keeps the single-file response shape (data.url)', async () => {
      const result = (await service.uploadFiles([
        makeFile(JPEG),
      ])) as MediaResponseDto;
      expect(result.url).toMatch(/^https:\/\/cdn\.tahouse\.vn\/products\//);
      expect((result as any).uploaded).toBeUndefined();
    });

    it('returns per-file results when some files fail', async () => {
      mediaRepository.create
        .mockImplementationOnce((data) =>
          Promise.resolve(MediaResponseDto.fromEntity(data)!),
        )
        .mockImplementationOnce(() => Promise.reject(new Error('D1 error')));

      const result = (await service.uploadFiles(
        [
          makeFile(JPEG, 'ok.jpg'),
          makeFile(SVG, 'bad.svg', 'image/svg+xml'),
          makeFile(PNG, 'db-fail.png', 'image/png'),
        ],
        { folder: 'banners' },
      )) as MultiUploadResult;

      expect(result.total).toBe(3);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(2);
      expect(result.uploaded[0].key).toMatch(/^banners\/ok-.*\.jpg$/);
      expect(result.failed).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            filename: 'bad.svg',
            status: 400,
            errorName: 'INVALID_FILE_TYPE',
          }),
          expect.objectContaining({
            filename: 'db-fail.png',
            status: 500,
            errorName: 'MEDIA_DB_ERROR',
          }),
        ]),
      );
      // Tệp lỗi D1 đã được gỡ khỏi R2, không còn tệp mồ côi
      expect(deleteCalls()).toHaveLength(1);
    });

    it('throws with the per-file reasons when every file fails', async () => {
      const promise = service.uploadFiles([
        makeFile(SVG, 'a.svg'),
        makeFile(PDF, 'b.pdf'),
      ]);
      let caught: HttpException | undefined;
      try {
        await promise;
      } catch (e) {
        caught = e as HttpException;
      }
      expect(caught).toBeInstanceOf(HttpException);
      expect(caught!.getStatus()).toBe(400);
      const body = caught!.getResponse() as any;
      expect(body.errorName).toBe('MEDIA_UPLOAD_FAILED');
      expect(body.params.failed).toHaveLength(2);
      expect(body.message).toContain('a.svg');
    });

    it('rejects an invalid folder once, before uploading anything', async () => {
      expect(
        await httpStatusOf(
          service.uploadFiles([makeFile(JPEG), makeFile(PNG)], {
            folder: 'nope',
          }),
        ),
      ).toBe(400);
      expect(s3Send).not.toHaveBeenCalled();
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

    it('should throw 404 if media item not found', async () => {
      mediaRepository.findById.mockResolvedValue(null);
      expect(await httpStatusOf(service.findById('non-existent'))).toBe(404);
    });
  });

  describe('deleteMedia', () => {
    it('should throw 400 if idOrKey is empty', async () => {
      expect(await httpStatusOf(service.deleteMedia(''))).toBe(400);
    });

    it('should delete from R2 and remove database record', async () => {
      const result = await service.deleteMedia('media-1');

      expect(deleteCalls()[0].Key).toBe('products/test-image.jpg');
      expect(mediaRepository.delete).toHaveBeenCalledWith('media-1');
      expect(result.deletedId).toBe('media-1');
      expect(result.key).toBe('products/test-image.jpg');
    });

    it('returns 404 and never touches R2 for a key without a D1 record (bug 1)', async () => {
      mediaRepository.findByIdOrKey.mockResolvedValue(undefined);

      const promise = service.deleteMedia('settings/secret-backup.json');
      expect(await httpStatusOf(promise)).toBe(404);
      await expect(
        service.deleteMedia('https://cdn.tahouse.vn/other/file.jpg'),
      ).rejects.toThrow('Không tìm thấy tệp');

      expect(s3Send).not.toHaveBeenCalled();
      expect(mediaRepository.delete).not.toHaveBeenCalled();
    });

    it('resolves a public URL to its D1 record and deletes the stored key (bug 1)', async () => {
      await service.deleteMedia(
        'https://cdn.tahouse.vn/products/test-image.jpg',
      );
      expect(mediaRepository.findByIdOrKey).toHaveBeenCalledWith(
        'https://cdn.tahouse.vn/products/test-image.jpg',
        'products/test-image.jpg',
      );
      expect(deleteCalls()[0].Key).toBe(mockMedia.key);
    });

    it('keeps the D1 row and returns 502 when the R2 delete fails (bug 2)', async () => {
      s3Send.mockRejectedValueOnce(new Error('R2 unavailable'));

      const promise = service.deleteMedia('media-1');
      expect(await httpStatusOf(promise)).toBe(502);
      expect(mediaRepository.delete).not.toHaveBeenCalled();
    });

    it('returns 500 when the D1 delete fails after R2 succeeded', async () => {
      mediaRepository.delete.mockRejectedValueOnce(new Error('D1 down'));
      expect(await httpStatusOf(service.deleteMedia('media-1'))).toBe(500);
    });

    it('returns 409 with a usage summary when the file is referenced (bug 5)', async () => {
      mediaRepository.findUsages.mockResolvedValue({
        products: [
          { id: 'p1', code: 'KL-989F' },
          { id: 'p2', code: 'KL-600' },
        ],
        brands: [{ id: 'b1', name: 'Kaadas' }],
        settings: ['heroBanners'],
      });

      let caught: HttpException | undefined;
      try {
        await service.deleteMedia('media-1');
      } catch (e) {
        caught = e as HttpException;
      }

      expect(caught?.getStatus()).toBe(409);
      const body = caught!.getResponse() as any;
      expect(body.errorName).toBe('MEDIA_IN_USE');
      expect(body.message).toBe(
        'Ảnh đang được dùng ở: 2 sản phẩm (KL-989F, KL-600), logo 1 thương hiệu (Kaadas), banner hero trang chủ',
      );
      expect(body.params.usage.products).toHaveLength(2);
      expect(mediaRepository.findUsages).toHaveBeenCalledWith([
        mockMedia.key,
        mockMedia.url,
      ]);
      expect(s3Send).not.toHaveBeenCalled();
      expect(mediaRepository.delete).not.toHaveBeenCalled();
    });

    it('deletes a referenced file when force=true (bug 5)', async () => {
      mediaRepository.findUsages.mockResolvedValue({
        products: [{ id: 'p1', code: 'KL-989F' }],
        brands: [],
        settings: [],
      });

      const result = await service.deleteMedia('media-1', { force: true });

      expect(mediaRepository.findUsages).not.toHaveBeenCalled();
      expect(deleteCalls()).toHaveLength(1);
      expect(result.deletedId).toBe('media-1');
    });

    it('does not delete when the usage check itself fails (bug 5)', async () => {
      mediaRepository.findUsages.mockRejectedValue(new Error('D1 timeout'));
      expect(await httpStatusOf(service.deleteMedia('media-1'))).toBe(500);
      expect(s3Send).not.toHaveBeenCalled();
    });

    it('summarises more than three products with an ellipsis', () => {
      const summary = service.describeUsage(
        {
          products: ['A', 'B', 'C', 'D'].map((code) => ({ id: code, code })),
          brands: [],
          settings: ['promoBanners', 'storeImages'],
        },
        'video/mp4',
      );
      expect(summary).toBe(
        'Video đang được dùng ở: 4 sản phẩm (A, B, C, …), banner khuyến mãi, ảnh cửa hàng',
      );
    });
  });
});
