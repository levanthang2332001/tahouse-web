import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import type { IProduct, IProductsListResponse } from './types/product.types';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: jest.Mocked<ProductsService>;

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
    price: 32450000,
    originalPrice: 64890000,
    discountPercent: 50,
    priceRange: '32.450.000 VNĐ',
    description: 'Khóa vân tay cao cấp',
    shortDescription: 'Face ID 3D',
    content: '',
    imageUrl: '/products/kl-989f.jpg',
    images: ['/products/kl-989f.jpg'],
    features: ['Face ID'],
    specs: {},
    technologies: [],
    warranty: 36,
    warrantyText: '3 năm',
    colors: ['Đen'],
    installationManual: [],
    faq: [],
    has_variants: false,
    options: [],
    variants: [],
    installation_preview: [],
  };

  const mockListResponse: IProductsListResponse = {
    items: [mockProduct],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeEach(async () => {
    productsService = {
      findAll: jest.fn().mockResolvedValue(mockListResponse),
      findOne: jest.fn().mockResolvedValue(mockProduct),
      getInstallationMedia: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 12,
      }),
    } as unknown as jest.Mocked<ProductsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('findAll', () => {
    it('should call productsService.findAll with query parameters and return paginated products', async () => {
      const query = { page: 1, limit: 10, category: 'dai-sanh' };
      const result = await controller.findAll(query);

      expect(productsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
      expect(result.items[0].code).toBe('KL-989F');
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOne with code/slug and return full IProduct', async () => {
      const result = await controller.findOne('kl-989f');

      expect(productsService.findOne).toHaveBeenCalledWith('kl-989f');
      expect(result).toEqual(mockProduct);
      expect(result.id).toBe('prod-1');
    });
  });

  describe('getInstallationMedia', () => {
    it('should call productsService.getInstallationMedia with product code and query', async () => {
      const query = { page: 1, limit: 12 };
      const result = await controller.getInstallationMedia('kl-989f', query);

      expect(productsService.getInstallationMedia).toHaveBeenCalledWith(
        'kl-989f',
        query,
      );
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
    });
  });
});
