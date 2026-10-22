import { ProductRetrieverService } from './product-retriever.service';
import { ProductsService } from '../../products/products.service';
import { ConfigService } from '@nestjs/config';

describe('ProductRetrieverService', () => {
  let service: ProductRetrieverService;
  let productsService: jest.Mocked<ProductsService>;
  let configService: jest.Mocked<ConfigService>;

  const mockProducts = [
    {
      id: '1',
      code: 'KL-989F',
      slug: 'kl-989f',
      name: 'Khóa cửa vân tay Kassler KL-989F',
      brand: 'Kassler',
      categoryName: 'Khóa Face ID',
      description: 'Khóa nhận diện khuôn mặt cao cấp',
      features: ['Face ID 3D', 'Vân tay', 'Mã số'],
      specs: { 'Chất liệu': 'Hợp kim nhôm' },
      priceRange: '32.450.000 VNĐ',
      imageUrl: '/products/kl-989f.jpg',
    },
    {
      id: '2',
      code: 'PL-7000',
      slug: 'pl-7000',
      name: 'Khóa cửa Philips Alpha-V',
      brand: 'Philips',
      categoryName: 'Khóa Thông Minh',
      description: 'Khóa cửa kéo đẩy',
      features: ['Wifi', 'Vân tay'],
      specs: {},
      priceRange: '15.000.000 VNĐ',
      imageUrl: '/products/pl-7000.jpg',
    },
  ];

  beforeEach(() => {
    productsService = {
      getRawProducts: jest.fn().mockResolvedValue(mockProducts),
    } as unknown as jest.Mocked<ProductsService>;

    configService = {
      get: jest.fn().mockReturnValue('https://cdn.tahouse.vn'),
    } as unknown as jest.Mocked<ConfigService>;

    service = new ProductRetrieverService(productsService, configService);
  });

  it('should return empty message when no products in store', async () => {
    productsService.getRawProducts.mockResolvedValue([]);
    const result = await service.retrieve('khóa vân tay');
    expect(result).toBe('Không có sản phẩm nào trong cửa hàng.');
  });

  it('should retrieve context matching brand inquiry', async () => {
    const result = await service.retrieve('hãng kassler có những sản phẩm nào');
    expect(result).toContain('DANH SÁCH SẢN PHẨM NỔI BẬT CỦA HÃNG KASSLER');
    expect(result).toContain('KL-989F');
  });

  it('should retrieve and rank products by keywords', async () => {
    const result = await service.retrieve('KL-989F Face ID');
    expect(result).toContain('KL-989F');
    expect(result).toContain('Khóa cửa vân tay Kassler KL-989F');
  });

  it('should retrieve product from previous turn when user asks follow-up', async () => {
    const history = [
      { role: 'user', content: 'Mẫu Kassler KL-989F' },
      { role: 'assistant', content: 'Dạ đây là Khóa cửa vân tay Kassler KL-989F giá tốt ạ' },
    ];
    const result = await service.retrieve('cho xme đi', 4, history);
    expect(result).toContain('KL-989F');
  });

  it('should match product code even if user enters space instead of hyphen', async () => {
    const result = await service.retrieve('KL 989F');
    expect(result).toContain('KL-989F');
  });

  it('should prioritize product from current page URL (referer)', async () => {
    const result = await service.retrieve('sản phẩm này có tốt không', 4, [], 'https://tahouse.vn/product/pl-7000');
    expect(result).toContain('PL-7000');
    expect(result).toContain('Philips');
  });

  it('should match exact product code when user asks in natural language', async () => {
    const result = await service.retrieve('cho mình hỏi mã KL - 989F này có những màu gì');
    expect(result).toContain('KL-989F');
  });
});
