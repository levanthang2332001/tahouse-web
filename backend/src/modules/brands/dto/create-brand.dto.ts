import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { randomUUID } from 'crypto';
import { slugify } from '@/common/utils/string.util';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';

@DefaultErrorCode(ErrorCode.BRAND_VALIDATION_ERROR)
export class SubcategoryDto {
  @ApiPropertyOptional({
    description: 'ID danh mục con (tự sinh UUID nếu để trống)',
  })
  @Transform(({ value }) => value || randomUUID())
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ description: 'Tên danh mục con', example: 'Khóa Vân Tay' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục con (tự sinh nếu để trống)',
    example: 'van-tay',
  })
  @Transform(({ value, obj }) =>
    value && typeof value === 'string' && value.trim()
      ? slugify(value)
      : slugify(obj.name || ''),
  )
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateSubcategoryItemDto extends PartialType(SubcategoryDto) {}

@DefaultErrorCode(ErrorCode.BRAND_VALIDATION_ERROR)
export class CategoryDto {
  @ApiPropertyOptional({
    description: 'ID danh mục cha (tự sinh UUID nếu để trống)',
  })
  @Transform(({ value }) => value || randomUUID())
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiProperty({ description: 'Tên danh mục cha', example: 'Khóa Cửa Gỗ' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục cha (tự sinh nếu để trống)',
    example: 'cua-go',
  })
  @Transform(({ value, obj }) =>
    value && typeof value === 'string' && value.trim()
      ? slugify(value)
      : slugify(obj.name || ''),
  )
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Danh sách danh mục con',
    type: [SubcategoryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubcategoryDto)
  subcategories?: SubcategoryDto[];
}

export class UpdateCategoryItemDto extends PartialType(CategoryDto) {}

@DefaultErrorCode(ErrorCode.BRAND_VALIDATION_ERROR)
export class CreateBrandDto {
  @ApiPropertyOptional({
    description: 'ID UUID của thương hiệu (tự động sinh nếu để trống)',
  })
  @Transform(({ value }) => value || randomUUID())
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị số nguyên',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiProperty({ description: 'Tên thương hiệu', example: 'Yale' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Slug thương hiệu (tự động sinh từ tên nếu để trống)',
    example: 'yale',
  })
  @Transform(({ value, obj }) =>
    value && typeof value === 'string' && value.trim()
      ? slugify(value)
      : slugify(obj.name || ''),
  )
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Logo ảnh', example: '/brand/yale.png' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Logo HTML styled' })
  @IsOptional()
  @IsString()
  logoHtml?: string;

  @ApiPropertyOptional({
    description: 'Cây danh mục và danh mục con của thương hiệu',
    type: [CategoryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];
}
