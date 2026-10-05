jest.mock('@nestjs/mongoose', () => ({
  InjectModel: () => () => {},
  Prop: () => () => {},
  Schema: () => () => {},
  SchemaFactory: {
    createForClass: () => ({ index: jest.fn() }),
  },
}));

import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;

  const mockAggregatedOutput = {
    summary: {
      totalProducts: 2,
      totalBrands: 2,
      totalCategories: 3,
      totalSubcategories: 2,
      discountedProducts: 1,
    },
    brands: [
      {
        id: 1,
        name: 'Kassler',
        slug: 'kassler',
        logo: '/brand/kassler.png',
        totalProducts: 1,
        percentage: 50,
        categories: [
          {
            slug: 'dai-sanh',
            name: 'Khóa Đại Sảnh',
            totalProducts: 1,
            percentage: 100,
            subcategories: [
              {
                slug: 'face-id',
                name: 'Khóa Face ID',
                totalProducts: 1,
                percentage: 100,
              },
            ],
          },
        ],
      },
      {
        id: 3,
        name: 'Bosch',
        slug: 'bosch',
        logo: '/brand/bosch.png',
        totalProducts: 1,
        percentage: 50,
        categories: [
          {
            slug: 'bep-tu',
            name: 'Bếp Từ',
            totalProducts: 1,
            percentage: 100,
            subcategories: [],
          },
        ],
      },
    ],
  };

  const mockProductModel = {};
  const mockBrandModel = {
    aggregate: jest.fn().mockResolvedValue([mockAggregatedOutput]),
  };

  beforeEach(() => {
    service = new StatsService(mockProductModel as any, mockBrandModel as any);
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
    expect(kasslerBrand?.categories.length).toBe(1);

    const daiSanhCat = kasslerBrand?.categories[0];
    expect(daiSanhCat?.slug).toBe('dai-sanh');
    expect(daiSanhCat?.name).toBe('Khóa Đại Sảnh');
    expect(daiSanhCat?.totalProducts).toBe(1);
    expect(daiSanhCat?.percentage).toBe(100);
    expect(daiSanhCat?.subcategories.length).toBe(1);

    expect(mockBrandModel.aggregate).toHaveBeenCalled();
  });
});
