import { Test, TestingModule } from '@nestjs/testing';
import { BrandsRepository } from './brands.repository';
import { D1_DATABASE } from '@/database/d1.constants';

describe('BrandsRepository', () => {
  let repository: BrandsRepository;
  let mockDb: any;

  const mockBrandEntity = {
    id: 'brand-uuid-1',
    name: 'Yale',
    slug: 'yale',
    logo: '/brand/yale.png',
    orderIndex: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    categories: [
      {
        id: 'cat-uuid-1',
        brandId: 'brand-uuid-1',
        name: 'Khóa Cửa Gỗ',
        slug: 'cua-go',
        orderIndex: 1,
        subcategories: [
          {
            id: 'sub-uuid-1',
            categoryId: 'cat-uuid-1',
            name: 'Khóa Vân Tay',
            slug: 'van-tay',
            orderIndex: 1,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        brands: {
          findMany: jest.fn(),
          findFirst: jest.fn(),
        },
      },
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsRepository,
        {
          provide: D1_DATABASE,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<BrandsRepository>(BrandsRepository);
  });

  describe('findAll', () => {
    it('should query all brands with categories and subcategories', async () => {
      mockDb.query.brands.findMany.mockResolvedValue([mockBrandEntity]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Yale');
      expect(result[0].categories[0].subcategories[0].name).toBe(
        'Khóa Vân Tay',
      );
      expect(mockDb.query.brands.findMany).toHaveBeenCalled();
    });
  });

  describe('findByIdOrSlug', () => {
    it('should query brand by id or slug and return DTO', async () => {
      mockDb.query.brands.findFirst.mockResolvedValue(mockBrandEntity);

      const result = await repository.findByIdOrSlug('yale');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('yale');
      expect(mockDb.query.brands.findFirst).toHaveBeenCalled();
    });

    it('should return null if brand is not found in database', async () => {
      mockDb.query.brands.findFirst.mockResolvedValue(null);

      const result = await repository.findByIdOrSlug('unknown');

      expect(result).toBeNull();
    });
  });

  describe('insertBrand', () => {
    it('should insert brand into D1 database', async () => {
      await repository.insertBrand({
        id: 'brand-uuid-2',
        name: 'Philips',
        slug: 'philips',
        orderIndex: 2,
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('insertCategoriesBatch & insertSubcategoriesBatch', () => {
    it('should execute batch insertion for categories array', async () => {
      await repository.insertCategoriesBatch([
        {
          id: 'c-1',
          brandId: 'b-1',
          name: 'Cat 1',
          slug: 'cat-1',
          orderIndex: 1,
        },
      ]);

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should execute batch insertion for subcategories array', async () => {
      await repository.insertSubcategoriesBatch([
        {
          id: 's-1',
          categoryId: 'c-1',
          name: 'Sub 1',
          slug: 'sub-1',
          orderIndex: 1,
        },
      ]);

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('deleteBrand', () => {
    it('should delete brand by id from D1 database', async () => {
      await repository.deleteBrand('brand-uuid-1');

      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
