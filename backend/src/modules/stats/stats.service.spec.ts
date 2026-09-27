import { StatsService } from './stats.service';
import { products } from '../products/schemas/product.schema';
import { brands, categories, subcategories } from '../brands/schemas/brand.schema';

describe('StatsService', () => {
  let service: StatsService;

  const mockProductRows = [
    {
      id: 'p1',
      name: 'Khóa Face ID Kassler',
      code: 'KL-01',
      brandId: 'b1',
      categorySlug: 'dai-sanh',
      subcategorySlug: 'face-id',
      price: 9000000,
      originalPrice: 10000000,
      discountPercent: 10,
      variants: '[]',
    },
    {
      id: 'p2',
      name: 'Bếp từ Bosch',
      code: 'BS-01',
      brandId: 'b2',
      categorySlug: 'bep-tu',
      subcategorySlug: null,
      price: 15000000,
      originalPrice: null,
      discountPercent: null,
      variants: '[]',
    },
  ];

  const mockBrandRows = [
    {
      id: 'b1',
      name: 'Kassler',
      slug: 'kassler',
      logo: '/brand/kassler.png',
      orderIndex: 1,
    },
    {
      id: 'b2',
      name: 'Bosch',
      slug: 'bosch',
      logo: '/brand/bosch.png',
      orderIndex: 2,
    },
  ];

  const mockCategoryRows = [
    {
      id: 'c1',
      brandId: 'b1',
      name: 'Khóa Đại Sảnh',
      slug: 'dai-sanh',
    },
    {
      id: 'c2',
      brandId: 'b1',
      name: 'Khóa Cửa Gỗ',
      slug: 'cua-go',
    },
    {
      id: 'c3',
      brandId: 'b2',
      name: 'Bếp Từ',
      slug: 'bep-tu',
    },
  ];

  const mockSubcategoryRows = [
    {
      id: 's1',
      categoryId: 'c1',
      name: 'Khóa Face ID',
      slug: 'face-id',
    },
    {
      id: 's2',
      categoryId: 'c1',
      name: 'Khóa Vân Tay',
      slug: 'van-tay',
    },
  ];

  const mockDb = {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockImplementation((table: any) => {
        if (table === products) return Promise.resolve(mockProductRows);
        if (table === brands) return Promise.resolve(mockBrandRows);
        if (table === categories) return Promise.resolve(mockCategoryRows);
        if (table === subcategories) return Promise.resolve(mockSubcategoryRows);
        return Promise.resolve([]);
      }),
    }),
  };

  beforeEach(() => {
    service = new StatsService(mockDb as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should execute hierarchical aggregation (Brand -> Category -> Subcategory)', async () => {
    const result = await service.getDashboardStats();

    expect(result.summary.totalProducts).toBe(2);
    expect(result.summary.totalBrands).toBe(2);
    expect(result.summary.totalCategories).toBe(3);
    expect(result.summary.totalSubcategories).toBe(2);
    expect(result.summary.discountedProducts).toBe(1);
    expect(result.brands.length).toBe(2);

    const kasslerBrand = result.brands.find((b) => b.slug === 'kassler');
    expect(kasslerBrand).toBeDefined();
    expect(kasslerBrand?.totalProducts).toBe(1);
    expect(kasslerBrand?.percentage).toBe(50);
    expect(kasslerBrand?.categories.length).toBe(2);

    const daiSanhCat = kasslerBrand?.categories.find((c) => c.slug === 'dai-sanh');
    expect(daiSanhCat?.slug).toBe('dai-sanh');
    expect(daiSanhCat?.name).toBe('Khóa Đại Sảnh');
    expect(daiSanhCat?.totalProducts).toBe(1);
    expect(daiSanhCat?.percentage).toBe(100);
    expect(daiSanhCat?.subcategories.length).toBe(2);
  });
});
