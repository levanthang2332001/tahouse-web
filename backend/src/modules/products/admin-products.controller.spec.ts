jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';
import type {
  IProduct,
  IProductListItem,
  IProductsListResponse,
} from './types/product.types';

describe('AdminProductsController', () => {
  let controller: AdminProductsController;
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

  const mockListResponse: IProductsListResponse = {
    items: [mockProduct as IProductListItem],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeEach(async () => {
    productsService = {
      findAll: jest.fn().mockResolvedValue(mockListResponse),
      findOneForAdmin: jest.fn().mockResolvedValue(mockProduct),
      create: jest.fn().mockResolvedValue(mockProduct),
      update: jest.fn().mockResolvedValue(mockProduct),
      remove: jest
        .fn()
        .mockResolvedValue({ success: true, message: 'Deleted' }),
    } as unknown as jest.Mocked<ProductsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsService,
        },
      ],
    }).compile();

    controller = module.get<AdminProductsController>(AdminProductsController);
  });

  it('should list products for admin dashboard', async () => {
    const result = await controller.findAll({ page: 1, limit: 20 });
    expect(productsService.findAll).toHaveBeenCalled();
    expect(result.items.length).toBe(1);
  });

  it('should get detailed product by id', async () => {
    const result = await controller.findOne('kl-989f');
    expect(productsService.findOneForAdmin).toHaveBeenCalledWith('kl-989f');
    expect(result.code).toBe('KL-989F');
  });

  it('should create new product', async () => {
    const dto = {
      name: 'Khóa cửa Kassler KL-989F',
      code: 'KL-989F',
      brandId: '7afccd8e-940e-4e9f-81bb-8754925f6e48',
      category: 'dai-sanh',
      price: 32450000,
      imageUrl: '/img.jpg',
    };
    const result = await controller.create(dto);
    expect(productsService.create).toHaveBeenCalledWith(dto);
    expect(result.code).toBe('KL-989F');
  });

  it('should update existing product', async () => {
    const dto = { price: 30000000 };
    const result = await controller.update('prod-1', dto);
    expect(productsService.update).toHaveBeenCalledWith('prod-1', dto);
    expect(result).toEqual(mockProduct);
  });

  it('should remove product', async () => {
    const result = await controller.remove('prod-1');
    expect(productsService.remove).toHaveBeenCalledWith('prod-1');
    expect(result).toHaveProperty('success', true);
  });
});
