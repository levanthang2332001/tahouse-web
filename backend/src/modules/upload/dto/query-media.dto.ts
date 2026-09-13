import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MediaType } from '../schemas/media.schema';

export class QueryMediaDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số bản ghi hiển thị trên mỗi trang', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Lọc theo định dạng loại tệp', enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  fileType?: string;

  @ApiPropertyOptional({ description: 'Lọc theo slug hoặc tên thương hiệu (brand)', example: 'kaadas' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Lọc theo slug hoặc tên danh mục chính (category)', example: 'khoa-cua-dien-tu' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Lọc theo slug hoặc tên danh mục phụ (subcategory)', example: 'khoa-nhan-dien-khuon-mat' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Lọc theo mã model sản phẩm (productCode)', example: 'KL-589FG' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên file, tiêu đề, mô tả hoặc key lưu trữ' })
  @IsOptional()
  @IsString()
  search?: string;
}
