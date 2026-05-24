import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';

@ApiTags(SwaggerTag.PRODUCTS)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(ApiRoute.PRODUCTS_LOCKS)
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm khóa cửa với phân trang và bộ lọc',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm phân trang được lấy thành công.',
  })
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(
      query.page,
      query.limit,
      query.categoryId,
      query.search,
      query.minPrice,
      query.maxPrice,
      query.sortBy,
      query.sortOrder,
    );
  }

  @Get(ApiRoute.PRODUCTS_LOCKS_DETAIL)
  @ApiOperation({
    summary:
      'Lấy chi tiết một sản phẩm khóa cửa theo ID (UUID) hoặc Mã sản phẩm (Code)',
  })
  @ApiParam({
    name: 'idOrCode',
    description:
      'ID UUID (ví dụ: c6b98f15-440e-4e69-a730-b2f79074be90) hoặc mã sản phẩm (ví dụ: kl-989-f)',
    example: 'kl-989-f',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết sản phẩm được tìm thấy.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm với ID hoặc mã tương ứng.',
  })
  findOne(@Param('idOrCode') idOrCode: string) {
    return this.productsService.findOne(idOrCode);
  }
}
