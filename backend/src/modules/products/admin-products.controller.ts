import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '@/common/guards';

@ApiTags(SwaggerTag.ADMIN_PRODUCTS)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(ApiRoute.ADMIN_PRODUCTS)
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm quản trị (Có phân trang, bộ lọc, tìm kiếm)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm cho Admin.' })
  async findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(ApiRoute.ADMIN_PRODUCTS_DETAIL)
  @ApiOperation({
    summary: 'Lấy chi tiết đầy đủ của sản phẩm để chỉnh sửa (Admin)',
  })
  @ApiParam({ name: 'id', description: 'ID (slug) hoặc mã code sản phẩm' })
  @ApiResponse({ status: 200, description: 'Chi tiết sản phẩm.' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post(ApiRoute.ADMIN_PRODUCTS)
  @ApiOperation({
    summary: 'Thêm sản phẩm mới (Admin)',
  })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công.' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(ApiRoute.ADMIN_PRODUCTS_DETAIL)
  @ApiOperation({
    summary: 'Cập nhật thông tin sản phẩm (Admin)',
  })
  @ApiParam({ name: 'id', description: 'ID hoặc mã code sản phẩm' })
  @ApiResponse({ status: 200, description: 'Cập nhật sản phẩm thành công.' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(ApiRoute.ADMIN_PRODUCTS_DETAIL)
  @ApiOperation({
    summary: 'Xóa sản phẩm (Admin)',
  })
  @ApiParam({ name: 'id', description: 'ID hoặc mã code sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa sản phẩm thành công.' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
