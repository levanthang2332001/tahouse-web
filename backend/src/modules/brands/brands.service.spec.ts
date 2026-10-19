import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from './brands.service';
import { BrandsRepository } from './repositories/brands.repository';
import { BusinessException } from '@/common/exceptions';
import { BrandResponseDto } from './dto/brand-response.dto';

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: jest.Mocked<BrandsRepository>;

  const mockBrand: BrandResponseDto = {
    id: 'brand-1',
    name: 'Yale',
    slug: 'yale',
    logo: '/brand/yale.png',
    orderIndex: 0,
    categories: [
      {
        id: 'cat-1',
        name: 'Khóa Cửa Gỗ',
        slug: 'cua-go',
        subcategories: [
          {
            id: 'sub-1',
            name: 'Khóa Vân Tay',
            slug: 'van-tay',
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn().mockResolvedValue([mockBrand]),
      findByIdOrSlug: jest.fn().mockResolvedValue(mockBrand),
      findBySlug: jest.fn().mockResolvedValue(null),
      insertBrand: jest.fn().mockResolvedValue(undefined),
      updateBrand: jest.fn().mockResolvedValue(undefined),
      deleteBrand: jest.fn().mockResolvedValue(undefined),
      insertCategory: jest.fn().mockResolvedValue(undefined),
      insertCategoriesBatch: jest.fn().mockResolvedValue(undefined),
      updateCategory: jest.fn().mockResolvedValue(undefined),
      deleteCategory: jest.fn().mockResolvedValue(undefined),
      deleteCategoriesByBrandId: jest.fn().mockResolvedValue(undefined),
      insertSubcategory: jest.fn().mockResolvedValue(undefined),
      insertSubcategoriesBatch: jest.fn().mockResolvedValue(undefined),
      deleteSubcategory: jest.fn().mockResolvedValue(undefined),
      deleteSubcategoriesByCategoryId: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BrandsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        {
          provide: BrandsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  describe('findAll', () => {
    it('should return an array of brands', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockBrand]);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return brand if found', async () => {
      const result = await service.findOne('yale');
      expect(result).toEqual(mockBrand);
      expect(repository.findByIdOrSlug).toHaveBeenCalledWith('yale');
    });

    it('should throw BusinessException if brand not found', async () => {
      repository.findByIdOrSlug.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('create', () => {
    it('should throw BusinessException if slug already exists', async () => {
      repository.findBySlug.mockResolvedValue({ id: 'existing' } as any);
      await expect(
        service.create({
          id: 'brand-1',
          name: 'Yale',
          slug: 'yale',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should insert brand and return created result', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.findByIdOrSlug.mockResolvedValue(mockBrand);

      const result = await service.create({
        id: 'brand-1',
        name: 'Yale',
        slug: 'yale',
        categories: [
          {
            id: 'cat-1',
            name: 'Khóa Cửa Gỗ',
            slug: 'cua-go',
            subcategories: [
              {
                id: 'sub-1',
                name: 'Khóa Vân Tay',
                slug: 'van-tay',
              },
            ],
          },
        ],
      });

      expect(repository.insertBrand).toHaveBeenCalled();
      expect(repository.insertCategoriesBatch).toHaveBeenCalled();
      expect(repository.insertSubcategoriesBatch).toHaveBeenCalled();
      expect(result).toEqual(mockBrand);
    });
  });

  describe('addCategory', () => {
    it('should throw BusinessException if category slug exists in brand', async () => {
      await expect(
        service.addCategory('yale', {
          id: 'cat-2',
          name: 'Khóa Cửa Gỗ',
          slug: 'cua-go',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should insert category and return updated brand', async () => {
      const result = await service.addCategory('yale', {
        id: 'cat-2',
        name: 'Khóa Khách Sạn',
        slug: 'khach-san',
      });

      expect(repository.insertCategory).toHaveBeenCalled();
      expect(result).toEqual(mockBrand);
    });
  });
});
