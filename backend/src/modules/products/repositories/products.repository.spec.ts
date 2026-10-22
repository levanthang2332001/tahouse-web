import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from './products.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { ConfigService } from '@nestjs/config';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let mockDb: any;
  let configService: jest.Mocked<ConfigService>;

  const mockProductEntity = {
    id: 'prod-uuid-1',
    code: 'KL-989F',
    slug: 'kl-989f',
    name: 'Khóa cửa vân tay Kassler KL-989F',
    brandId: 'brand-uuid-1',
    brand: 'Kassler',
    brandSlug: 'kassler',
    category: 'dai-sanh',
    categoryName: 'Khóa Đại Sảnh',
    subcategory: 'face-id',
    subcategoryName: 'Khóa Face ID',
    price: 32450000,
    originalPrice: 64890000,
    discountPercent: 50,
    priceRange: '32.450.000 VNĐ',
    description: 'Khóa cửa cao cấp',
    shortDescription: 'Face ID 3D',
    content: '',
    imageUrl: '/products/kl-989f.jpg',
    images: ['/products/kl-989f-1.jpg'],
    features: ['Face ID'],
    specs: { 'Chất liệu': 'Hợp kim' },
    technologies: [],
    warranty: 36,
    warrantyText: '3 năm',
    colors: ['Đen'],
    installation: '',
    installationManual: [],
    faq: [],
    has_variants: false,
    options: [],
    variants: [],
    priority: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        products: {
          findFirst: jest.fn(),
        },
      },
      select: jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                      offset: jest.fn().mockResolvedValue([mockProductEntity]),
                    }),
                  }),
                  limit: jest.fn().mockResolvedValue([mockProductEntity]),
                }),
              }),
            }),
          }),
        }),
      })),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    configService = {
      get: jest.fn().mockReturnValue('https://cdn.tahouse.vn'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
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

    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  describe('findByCodeOrSlug', () => {
    it('should query product by code or slug', async () => {
      mockDb.query.products.findFirst.mockResolvedValue(mockProductEntity);

      const result = await repository.findByCodeOrSlug('KL-989F', 'kl-989f');

      expect(result).not.toBeNull();
      expect(mockDb.query.products.findFirst).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should delete product record by id', async () => {
      const result = await repository.deleteProduct('prod-uuid-1');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
