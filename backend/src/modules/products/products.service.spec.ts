import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { BrandsRepository } from '../brands/repositories/brands.repository';
import { BusinessException } from '@/common/exceptions';
import type { IProduct } from './types/product.types';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<ProductsRepository>;
  let brandsRepository: jest.Mocked<BrandsRepository>;

  const mockBrand = {
    id: 'brand-1',
    name: 'Kassler',
    slug: 'kassler',
    logo: '/brand/kassler.png',
    orderIndex: 0,
    categories: [
      {
        id: 'cat-1',
        name: 'Khóa Đại Sảnh',
        slug: 'dai-sanh',
        subcategories: [
          {
            id: 'sub-1',
            name: 'Khóa Face ID',
            slug: 'face-id',
          },
        ],
      },
    ],
  };

  const mockProduct: IProduct = {
    id: 'prod-1',
    code: 'KL-989F',
    name: 'Khóa cửa Kassler KL-989F',
    slug: 'kl-989f',
    brandId: 'brand-1',
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
    description: '',
    shortDescription: '',
    content: '',
    imageUrl: '',
    images: [],
    features: [],
    specs: {},
    technologies: [],
    warranty: 36,
    warrantyText: '3 năm',
    colors: [],
    installationManual: [],
    faq: [],
    has_variants: false,
    options: [],
    variants: [],
    installation_preview: [],
  };

  beforeEach(async () => {
    productsRepository = {
      findAllRaw: jest.fn().mockResolvedValue([mockProduct]),
      findAllPaginated: jest.fn().mockResolvedValue({
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      findByIdOrCode: jest.fn().mockResolvedValue(mockProduct),
      findByCode: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn().mockResolvedValue(null),
      findOtherByCode: jest.fn().mockResolvedValue(null),
      findOtherBySlug: jest.fn().mockResolvedValue(null),
      createProduct: jest.fn().mockResolvedValue(mockProduct),
      updateProduct: jest.fn().mockResolvedValue(mockProduct),
      deleteProduct: jest.fn().mockResolvedValue(true),
      findInstallationMedia: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 12,
      }),
    } as unknown as jest.Mocked<ProductsRepository>;

    brandsRepository = {
      findByIdOrSlug: jest.fn().mockResolvedValue(mockBrand),
      findBrandById: jest
        .fn()
        .mockResolvedValue({ id: 'brand-1', name: 'Kassler' }),
      findCategoryInBrand: jest.fn().mockResolvedValue({
        id: 'cat-1',
        slug: 'dai-sanh',
        name: 'Khóa Đại Sảnh',
      }),
      findSubcategoryInCategory: jest.fn().mockResolvedValue({
        id: 'sub-1',
        slug: 'face-id',
        name: 'Khóa Face ID',
      }),
    } as unknown as jest.Mocked<BrandsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: productsRepository,
        },
        {
          provide: BrandsRepository,
          useValue: brandsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.items).toEqual([mockProduct]);
      expect(productsRepository.findAllPaginated).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return product by id or code', async () => {
      const result = await service.findOne('KL-989F');
      expect(result).toEqual(mockProduct);
      expect(productsRepository.findByIdOrCode).toHaveBeenCalledWith('KL-989F');
    });

    it('should throw BusinessException if product not found', async () => {
      productsRepository.findByIdOrCode.mockResolvedValue(undefined);
      await expect(service.findOne('invalid')).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('create', () => {
    it('should throw BusinessException if brand not found', async () => {
      brandsRepository.findBrandById.mockResolvedValue(null);
      await expect(
        service.create({
          code: 'KL-100',
          name: 'Khóa không có brand',
          brandId: 999,
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if category does not belong to brand', async () => {
      brandsRepository.findCategoryInBrand.mockResolvedValue(null);
      await expect(
        service.create({
          code: 'KL-100',
          name: 'Khóa sai danh mục',
          brandId: 1,
          category: 'khong-ton-tai',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if subcategory does not belong to category', async () => {
      brandsRepository.findSubcategoryInCategory.mockResolvedValue(null);
      await expect(
        service.create({
          code: 'KL-100',
          name: 'Khóa sai danh mục con',
          brandId: 1,
          category: 'dai-sanh',
          subcategory: 'sub-khong-ton-tai',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if code or slug already exists', async () => {
      productsRepository.findByCode.mockResolvedValue(mockProduct);
      await expect(
        service.create({
          code: 'KL-989F',
          name: 'Khóa cửa Kassler',
          slug: 'kl-989f',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should create product successfully when all validations pass', async () => {
      const result = await service.create({
        code: 'NEW-01',
        name: 'Khóa cửa mới',
        brandId: 1,
        category: 'dai-sanh',
        subcategory: 'face-id',
        price: 20000000,
        originalPrice: 25000000,
        discountPercent: 20,
      });

      expect(productsRepository.createProduct).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should throw BusinessException if update code or slug conflicts with another product', async () => {
      productsRepository.findOtherByCode.mockResolvedValue({
        id: 'prod-2',
        code: 'EXISTING-CODE',
      } as any);

      await expect(
        service.update('prod-1', {
          code: 'EXISTING-CODE',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException when only price sent and it exceeds current originalPrice in DB', async () => {
      // mockProduct.originalPrice = 64_890_000; sending price higher than that
      await expect(
        service.update('prod-1', {
          price: 99000000, // exceeds current.originalPrice (64_890_000)
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException when only originalPrice sent lower than current price in DB', async () => {
      // mockProduct.price = 32_450_000; sending originalPrice lower than that
      await expect(
        service.update('prod-1', {
          originalPrice: 10000000, // lower than current.price (32_450_000)
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should update product successfully', async () => {
      const result = await service.update('prod-1', {
        name: 'Tên mới',
        price: 30000000,
      });

      expect(productsRepository.updateProduct).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining({ name: 'Tên mới', price: 30000000 }),
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('should delete product by id', async () => {
      const result = await service.remove('prod-1');

      expect(productsRepository.deleteProduct).toHaveBeenCalledWith('prod-1');
      expect(result.message).toContain('deleted successfully');
    });
  });
});
