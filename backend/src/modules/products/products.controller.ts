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

  @Get(ApiRoute.PRODUCTS_LOCKS_INSTALLATION)
  @ApiOperation({
    summary: 'Lấy ảnh và video lắp đặt thực tế của sản phẩm (có phân trang)',
    description:
      'Trả về danh sách ảnh / video lắp đặt thực tế của sản phẩm. ' +
      'Hỗ trợ lọc theo loại (images/videos/all) và phân trang.',
  })
  @ApiParam({
    name: 'idOrCode',
    description: 'ID UUID hoặc mã sản phẩm',
    example: 'kl-939-f',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách media lắp đặt được trả về thành công.',
    schema: {
      example: {
        product_id: 'c1b4372f-73be-4666-9489-9a1fe774c000',
        product_code: 'KL - 939 F',
        product_name: 'KL - 939 F',
        items: [
          {
            url: '/installation/Kassler/KL_-_939_F/IMG_0627.jpg',
            type: 'image',
          },
          {
            url: '/installation/Kassler/KL_-_939_F/IMG_0636.MOV',
            type: 'video',
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
    @Param('idOrCode') idOrCode: string,
    @Query() query: GetInstallationMediaDto,
  ) {
    return this.productsService.getInstallationMedia(
      idOrCode,
      query.page,
      query.limit,
      query.type,
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
