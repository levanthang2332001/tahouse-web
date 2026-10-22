import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { slugify } from '@/common/utils/string.util';
import { IsLessThanOrEqualField, DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductInstallationDto {
  @ApiPropertyOptional({ description: 'Danh sách URL hình ảnh lắp đặt' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Danh sách URL video lắp đặt' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductVariantDto {
  @ApiPropertyOptional({ description: 'ID biến thể' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Tên nhãn biến thể', example: 'Màu Vàng Đồng' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: 'Thuộc tính' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Giá bán' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @IsLessThanOrEqualField('originalPrice', {
    message: 'Variant price must not exceed variant originalPrice',
    context: { errorCode: ErrorCode.PRODUCT_INVALID_PRICE },
  })
  price?: number;

  @ApiPropertyOptional({ description: 'Giá gốc' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Phần trăm giảm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Khoảng giá hiển thị' })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({ description: 'Biến thể mặc định' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductOptionDto {
  @ApiProperty({ description: 'Tên tùy chọn', example: 'Màu sắc' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Các giá trị tùy chọn',
    example: ['Đen', 'Vàng'],
  })
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductFaqDto {
  @ApiProperty({ description: 'Câu hỏi' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Câu trả lời' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'ID dạng slug duy nhất (nếu để trống tự sinh từ mã sản phẩm)',
    example: 'kl-989f',
  })
  @Transform(({ value, obj }) =>
    value && typeof value === 'string' && value.trim()
      ? slugify(value)
      : slugify(obj.code || obj.name || ''),
  )
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: 'Slug sản phẩm (tự sinh nếu để trống)',
    example: 'khoa-cua-kassler-kl-989f',
  })
  @Transform(({ value, obj }) =>
    value && typeof value === 'string' && value.trim()
      ? slugify(value)
      : slugify(obj.name || obj.code || ''),
  )
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Mã sản phẩm', example: 'KL-989F' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Khóa cửa Kassler KL - 989 F',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'ID thương hiệu (từ danh mục Brands)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({
    description: 'Slug danh mục (thuộc Brand đã chọn)',
    example: 'dai-sanh',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục con (nếu có)',
    example: 'ket-mini',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Mô tả ngắn' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    description:
      'Nội dung bài viết chi tiết của sản phẩm (hỗ trợ văn bản thuần hoặc mã HTML/Rich Text)',
    example: '<p>Chi tiết đánh giá sản phẩm...</p>',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Danh sách ảnh', example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Giá bán thực tế / Giá sau giảm (VNĐ)',
    example: 45000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @IsLessThanOrEqualField('originalPrice', {
    message: 'price must not exceed originalPrice',
    context: { errorCode: ErrorCode.PRODUCT_INVALID_PRICE },
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Giá gốc niêm yết từ hãng (VNĐ)',
    example: 50000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Phần trăm giảm giá (%)', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Chuỗi hiển thị giá',
    example: '45.000.000 VNĐ',
  })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({ description: 'Tính năng nổi bật', example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Thông số kỹ thuật' })
  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Công nghệ tích hợp' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiPropertyOptional({
    description: 'Thời gian bảo hành (tháng)',
    example: 36,
  })
  @IsOptional()
  @IsNumber()
  warranty?: number;

  @ApiPropertyOptional({ description: 'Text bảo hành', example: '3 năm' })
  @IsOptional()
  @IsString()
  warrantyText?: string;

  @ApiPropertyOptional({ description: 'Màu sắc', example: ['Vàng Đồng'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiPropertyOptional({ description: 'Media lắp đặt thực tế' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductInstallationDto)
  installation?: ProductInstallationDto;

  @ApiPropertyOptional({
    description: 'Có biến thể hay không',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  has_variants?: boolean;

  @ApiPropertyOptional({ description: 'Tuỳ chọn' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options?: ProductOptionDto[];

  @ApiPropertyOptional({ description: 'Danh sách biến thể' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({ description: 'Danh sách câu hỏi thường gặp' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFaqDto)
  faq?: ProductFaqDto[];

  @ApiPropertyOptional({ description: 'Tài liệu hướng dẫn lắp đặt' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  installationManual?: string[];

  @ApiPropertyOptional({ description: 'Preview hình ảnh lắp đặt' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  installation_preview?: string[];

  @ApiPropertyOptional({ description: 'Thứ tự ưu tiên hiển thị', example: 1 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
