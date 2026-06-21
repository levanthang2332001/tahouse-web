import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsString, IsEnum } from 'class-validator';

export enum ProductSortBy {
  NEWEST = 'newest',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
}

export class GetProductsDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại',
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng sản phẩm trên mỗi trang',
    default: 10,
    minimum: 1,
    maximum: 500,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Slug danh mục chính để lọc sản phẩm:\n' +
      '* lock-parent (toàn bộ khóa)\n' +
      '* dai-sanh\n' +
      '* cua-go\n' +
      '* cua-kinh\n' +
      '* xingfa-sat\n' +
      '* cua-cong\n' +
      '* khach-san\n' +
      '* Smart',
    type: String,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description:
      'Slug danh mục con để lọc sản phẩm:\n' +
      '* ket-mini\n' +
      '* ket-gia-dinh\n' +
      '* ket-van-phong',
    type: String,
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    description:
      'Slug thương hiệu để lọc sản phẩm (ví dụ: kassler, philips, bosch)',
    type: String,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description:
      'Từ khóa tìm kiếm thông minh (tìm theo tên, mã, danh mục, mô tả, tính năng... hỗ trợ không dấu)',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Giá tối thiểu (VND) để lọc sản phẩm',
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Giá tối đa (VND) để lọc sản phẩm',
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Tiêu chí sắp xếp sản phẩm',
    enum: ProductSortBy,
    default: ProductSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.NEWEST;
}
