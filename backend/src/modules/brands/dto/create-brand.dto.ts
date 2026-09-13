import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubcategoryDto {
  @ApiProperty({ description: 'Tên danh mục con', example: 'Khóa Vân Tay' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục con (tự sinh nếu để trống)',
    example: 'van-tay',
  })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateSubcategoryItemDto extends PartialType(SubcategoryDto) {}

export class CategoryDto {
  @ApiProperty({ description: 'Tên danh mục cha', example: 'Khóa Cửa Gỗ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục cha (tự sinh nếu để trống)',
    example: 'cua-go',
  })
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

export class CreateBrandDto {
  @ApiPropertyOptional({
    description: 'ID số nguyên duy nhất (tự động tăng nếu để trống)',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Tên thương hiệu', example: 'Yale' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Slug thương hiệu (tự động sinh từ tên nếu để trống)',
    example: 'yale',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Logo ảnh', example: '/brand/yale.png' })
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
