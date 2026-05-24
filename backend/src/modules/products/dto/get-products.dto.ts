import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

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
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'ID danh mục để lọc sản phẩm:\n' +
      '* 1: Khóa Đại Sảnh\n' +
      '* 2: Khóa Cửa Gỗ\n' +
      '* 3: Khóa Cửa Kính\n' +
      '* 4: Khóa Cửa Nhôm\n' +
      '* 5: Khóa Cửa Cổng\n' +
      '* 6: Khóa Khách Sạn\n' +
      '* 7: Phụ Kiện\n' +
      '* 8: Két Sắt Thông Minh',
    type: Number,
    minimum: 1,
    maximum: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  categoryId?: number;

  @ApiPropertyOptional({
    description:
      'Từ khóa tìm kiếm thông minh (tìm theo tên, mã, mô tả, tính năng... hỗ trợ không dấu)',
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
    description: 'Trường sắp xếp (ví dụ: price, name)',
    enum: ['price', 'name'],
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp (asc: tăng dần, desc: giảm dần)',
    enum: ['asc', 'desc'],
    type: String,
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
