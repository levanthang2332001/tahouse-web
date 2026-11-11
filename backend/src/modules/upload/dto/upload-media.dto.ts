import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';
import { ALLOWED_UPLOAD_FOLDERS } from '../upload.constants';

@DefaultErrorCode(ErrorCode.MEDIA_VALIDATION_ERROR)
export class UploadMediaDto {
  @ApiPropertyOptional({
    description: `Thư mục gốc lưu trữ trên Cloudflare R2 (mặc định: products). Chỉ chấp nhận: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
    enum: ALLOWED_UPLOAD_FOLDERS,
    example: 'products',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Thương hiệu sản phẩm (ví dụ: kaadas, philips, hafele)',
    example: 'kaadas',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Danh mục chính (ví dụ: khoa-cua-dien-tu, dai-sanh)',
    example: 'khoa-cua-dien-tu',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Danh mục phụ (ví dụ: khoa-nhan-dien-khuon-mat, tay-gat)',
    example: 'khoa-nhan-dien-khuon-mat',
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Mã model sản phẩm (ví dụ: KL-589FG, K9)',
    example: 'KL-589FG',
  })
  @IsOptional()
  @IsString()
  productCode?: string;
}
