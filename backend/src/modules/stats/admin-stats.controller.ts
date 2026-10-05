import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { JwtAuthGuard } from '@/common/guards';
import { StatsService } from './stats.service';

@ApiTags(SwaggerTag.ADMIN_STATS)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminStatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(ApiRoute.ADMIN_STATS)
  @ApiOperation({
    summary:
      'Lấy dữ liệu thống kê tổng quan Dashboard Admin (4 thẻ số liệu + cơ cấu 6 ngành hàng)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu thống kê tổng quan Dashboard cho Admin thành công.',
  })
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }
}
