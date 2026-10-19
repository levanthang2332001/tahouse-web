import { StatsService } from './stats.service';
import { StatsRepository } from './repositories/stats.repository';
import { IAdminDashboardStatsResponse } from './types/stats.types';

describe('StatsService', () => {
  let service: StatsService;

  const mockResponse: IAdminDashboardStatsResponse = {
    summary: {
      totalProducts: 2,
      totalBrands: 2,
      totalCategories: 3,
      totalSubcategories: 2,
      discountedProducts: 1,
    },
    brands: [
      {
        id: 'b1',
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
        id: 'b2',
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

  const mockStatsRepository = {
    getDashboardStats: jest.fn().mockResolvedValue(mockResponse),
  };

  beforeEach(() => {
    service = new StatsService(
      mockStatsRepository as unknown as StatsRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate getDashboardStats to StatsRepository', async () => {
    const result = await service.getDashboardStats();

    expect(result).toEqual(mockResponse);
    expect(mockStatsRepository.getDashboardStats).toHaveBeenCalled();
  });
});
