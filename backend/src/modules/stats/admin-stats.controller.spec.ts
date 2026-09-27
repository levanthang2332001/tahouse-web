jest.mock('@nestjs/mongoose', () => ({
  InjectModel: () => () => {},
  Prop: () => () => {},
  Schema: () => () => {},
  SchemaFactory: {
    createForClass: () => ({ index: jest.fn() }),
  },
}));
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => {},
  ApiOperation: () => () => {},
  ApiResponse: () => () => {},
  ApiBearerAuth: () => () => {},
}));

import { AdminStatsController } from './admin-stats.controller';
import { StatsService } from './stats.service';

describe('AdminStatsController', () => {
  let controller: AdminStatsController;
  let service: {
    getDashboardStats: jest.Mock;
  };

  const mockStatsResponse = {
    summary: {
      totalProducts: 10,
      totalBrands: 2,
      totalCategories: 4,
      totalSubcategories: 2,
      discountedProducts: 3,
    },
    brands: [],
  };

  beforeEach(() => {
    service = {
      getDashboardStats: jest.fn().mockResolvedValue(mockStatsResponse),
    };
    controller = new AdminStatsController(service as unknown as StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return dashboard stats', async () => {
    const result = await controller.getDashboardStats();
    expect(result).toEqual(mockStatsResponse);
    expect(service.getDashboardStats).toHaveBeenCalled();
  });
});
