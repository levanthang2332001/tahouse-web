import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MediaType } from '../schemas/media.schema';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';
import { ALLOWED_UPLOAD_FOLDERS } from '../upload.constants';

@DefaultErrorCode(ErrorCode.MEDIA_VALIDATION_ERROR)
export class QueryMediaDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại (bắt đầu từ 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số bản ghi hiển thị trên mỗi trang',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Lọc theo thư mục gốc (bao gồm cả thư mục con)',
    enum: ALLOWED_UPLOAD_FOLDERS,
    example: 'products',
  })
  @IsOptional()
  @IsIn(ALLOWED_UPLOAD_FOLDERS, {
    message: `Thư mục không hợp lệ. Chỉ chấp nhận: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
  })
  folder?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo định dạng loại tệp',
    enum: MediaType,
  })
  @IsOptional()
  @IsEnum(MediaType)
  fileType?: MediaType;

  @ApiPropertyOptional({
    description: 'Lọc theo slug hoặc tên thương hiệu (brand)',
    example: 'kaadas',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo slug hoặc tên danh mục chính (category)',
    example: 'khoa-cua-dien-tu',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo slug hoặc tên danh mục phụ (subcategory)',
    example: 'khoa-nhan-dien-khuon-mat',
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo mã model sản phẩm (productCode)',
    example: 'KL-589FG',
  })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên file, tiêu đề, mô tả hoặc key lưu trữ',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
