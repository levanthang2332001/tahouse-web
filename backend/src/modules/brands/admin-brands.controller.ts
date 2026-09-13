import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { BrandsService } from './brands.service';
import {
  CreateBrandDto,
  CategoryDto,
  SubcategoryDto,
  UpdateCategoryItemDto,
} from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '@/common/guards';

@ApiTags(SwaggerTag.ADMIN_BRANDS)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get(ApiRoute.ADMIN_BRANDS)
  @ApiOperation({
    summary: 'Lấy danh sách tất cả thương hiệu (Admin)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách thương hiệu cho Admin.' })
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(ApiRoute.ADMIN_BRANDS_DETAIL)
  @ApiOperation({
    summary: 'Lấy chi tiết thương hiệu theo ID hoặc Slug (Admin)',
  })
  @ApiParam({ name: 'idOrSlug', description: 'ID số hoặc slug của thương hiệu', example: '1' })
  @ApiResponse({ status: 200, description: 'Chi tiết thương hiệu.' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.brandsService.findOne(idOrSlug);
  }

  @Post(ApiRoute.ADMIN_BRANDS)
  @ApiOperation({
    summary: 'Thêm thương hiệu mới (kèm cây danh mục nếu có)',
  })
  @ApiResponse({ status: 201, description: 'Tạo thương hiệu thành công.' })
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Patch(ApiRoute.ADMIN_BRANDS_DETAIL)
  @ApiOperation({
    summary: 'Cập nhật toàn bộ thông tin thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', description: 'ID số hoặc slug của thương hiệu', example: '1' })
  @ApiResponse({ status: 200, description: 'Cập nhật thương hiệu thành công.' })
  async update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(idOrSlug, updateBrandDto);
  }

  @Delete(ApiRoute.ADMIN_BRANDS_DETAIL)
  @ApiOperation({
    summary: 'Xóa thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', description: 'ID số hoặc slug của thương hiệu', example: '1' })
  @ApiResponse({ status: 200, description: 'Xóa thương hiệu thành công.' })
  async remove(@Param('idOrSlug') idOrSlug: string) {
    return this.brandsService.remove(idOrSlug);
  }

  // --- Sub-resource: Category CRUD inside Brand ---

  @Post(ApiRoute.ADMIN_BRANDS_CATEGORIES)
  @ApiOperation({
    summary: 'Thêm mới một danh mục cha vào thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', example: '1' })
  async addCategory(
    @Param('idOrSlug') idOrSlug: string,
    @Body() categoryDto: CategoryDto,
  ) {
    return this.brandsService.addCategory(idOrSlug, categoryDto);
  }

  @Patch(ApiRoute.ADMIN_BRANDS_CATEGORY_DETAIL)
  @ApiOperation({
    summary: 'Cập nhật một danh mục cha của thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', example: '1' })
  @ApiParam({ name: 'categorySlug', example: 'cua-go' })
  async updateCategory(
    @Param('idOrSlug') idOrSlug: string,
    @Param('categorySlug') categorySlug: string,
    @Body() dto: UpdateCategoryItemDto,
  ) {
    return this.brandsService.updateCategory(idOrSlug, categorySlug, dto);
  }

  @Delete(ApiRoute.ADMIN_BRANDS_CATEGORY_DETAIL)
  @ApiOperation({
    summary: 'Xóa một danh mục cha khỏi thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', example: '1' })
  @ApiParam({ name: 'categorySlug', example: 'cua-go' })
  async removeCategory(
    @Param('idOrSlug') idOrSlug: string,
    @Param('categorySlug') categorySlug: string,
  ) {
    return this.brandsService.removeCategory(idOrSlug, categorySlug);
  }

  // --- Sub-resource: Subcategory CRUD inside Category of Brand ---

  @Post(ApiRoute.ADMIN_BRANDS_SUBCATEGORIES)
  @ApiOperation({
    summary: 'Thêm mới một danh mục con vào danh mục cha của thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', example: '1' })
  @ApiParam({ name: 'categorySlug', example: 'cua-go' })
  async addSubcategory(
    @Param('idOrSlug') idOrSlug: string,
    @Param('categorySlug') categorySlug: string,
    @Body() subDto: SubcategoryDto,
  ) {
    return this.brandsService.addSubcategory(idOrSlug, categorySlug, subDto);
  }

  @Delete(ApiRoute.ADMIN_BRANDS_SUBCATEGORY_DETAIL)
  @ApiOperation({
    summary: 'Xóa một danh mục con khỏi danh mục cha của thương hiệu',
  })
  @ApiParam({ name: 'idOrSlug', example: '1' })
  @ApiParam({ name: 'categorySlug', example: 'cua-go' })
  @ApiParam({ name: 'subcategorySlug', example: 'van-tay' })
  async removeSubcategory(
    @Param('idOrSlug') idOrSlug: string,
    @Param('categorySlug') categorySlug: string,
    @Param('subcategorySlug') subcategorySlug: string,
  ) {
    return this.brandsService.removeSubcategory(
      idOrSlug,
      categorySlug,
      subcategorySlug,
    );
  }
}
