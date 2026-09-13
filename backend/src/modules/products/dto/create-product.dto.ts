import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'ID dạng slug duy nhất (nếu để trống tự sinh từ mã sản phẩm)',
    example: 'kl-989f',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Mã sản phẩm', example: 'KL-989F' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Khóa cửa Kassler KL - 989 F',
  })
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
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục con (nếu có)',
    example: 'ket-mini',
  })
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
    description: 'Nội dung bài viết chi tiết của sản phẩm (hỗ trợ văn bản thuần hoặc mã HTML/Rich Text)',
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
  images?: string[];

  @ApiPropertyOptional({ description: 'Giá bán thực tế / Giá sau giảm (VNĐ)', example: 45000000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Giá gốc niêm yết từ hãng (VNĐ)', example: 50000000 })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Phần trăm giảm giá (%)', example: 10 })
  @IsOptional()
  @IsNumber()
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
  features?: string[];

  @ApiPropertyOptional({ description: 'Thông số kỹ thuật' })
  @IsOptional()
  specs?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Công nghệ tích hợp' })
  @IsOptional()
  @IsArray()
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
  colors?: string[];

  @ApiPropertyOptional({ description: 'Media lắp đặt thực tế' })
  @IsOptional()
  installation?: {
    images?: string[];
    videos?: string[];
  };

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
  options?: any[];

  @ApiPropertyOptional({ description: 'Danh sách biến thể' })
  @IsOptional()
  @IsArray()
  variants?: any[];

  @ApiPropertyOptional({ description: 'Thứ tự ưu tiên hiển thị', example: 1 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
