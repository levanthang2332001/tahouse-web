import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { GetInstallationMediaDto } from './dto/get-installation-media.dto';

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
    return this.productsService.findAll(query);
  }

  @Get(ApiRoute.PRODUCTS_LOCKS_INSTALLATION)
  @ApiOperation({
    summary: 'Lấy ảnh và video lắp đặt thực tế của sản phẩm (có phân trang)',
    description:
      'Trả về danh sách ảnh / video lắp đặt thực tế của sản phẩm. ' +
      'Hỗ trợ lọc theo loại (images/videos/all) và phân trang.',
  })
  @ApiParam({
    name: 'code',
    description: 'ID dạng slug hoặc Mã sản phẩm (ví dụ: kl-939f hoặc KL-939F)',
    example: 'kl-939f',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách media lắp đặt được trả về thành công.',
    schema: {
      example: {
        product_id: 'kl-939f',
        product_name: 'KL - 939 F',
        items: [
          {
            url: '/installation/Kassler/KL_-_939_F/IMG_0627.jpg',
            type: 'image',
          },
        ],
        total: 18,
        total_images: 17,
        total_videos: 1,
        page: 1,
        limit: 12,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  getInstallationMedia(
    @Param('code') code: string,
    @Query() query: GetInstallationMediaDto,
  ) {
    return this.productsService.getInstallationMedia(code, query);
  }

  @Get(ApiRoute.PRODUCTS_LOCKS_DETAIL)
  @ApiOperation({
    summary:
      'Lấy chi tiết một sản phẩm khóa cửa theo ID (slug) hoặc Mã sản phẩm (Code)',
  })
  @ApiParam({
    name: 'code',
    description: 'ID dạng slug hoặc Mã sản phẩm (ví dụ: kl-989f hoặc KL-989F)',
    example: 'kl-989f',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết sản phẩm được tìm thấy.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm với mã hoặc ID tương ứng.',
  })
  findOne(@Param('code') code: string) {
    return this.productsService.findOne(code);
  }
}
