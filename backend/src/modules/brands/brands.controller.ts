import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { BrandsService } from './brands.service';
import type { IBrand } from './types/brand.types';

@ApiTags(SwaggerTag.BRANDS)
@Controller()
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get(ApiRoute.BRANDS)
  @ApiOperation({
    summary: 'Lấy danh sách các thương hiệu và các danh mục tương ứng',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thương hiệu và danh mục được lấy thành công.',
  })
  findAll(): IBrand[] {
    return this.brandsService.findAll();
  }
}
