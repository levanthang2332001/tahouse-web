import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { randomUUID } from 'crypto';
import { slugify } from '@/common/utils/string.util';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';

export const TAXONOMY_NAME_MAX_LENGTH = 100;
export const TAXONOMY_SLUG_MAX_LENGTH = 120;
/** Slug hợp lệ: chữ thường không dấu, số, nối bằng một dấu gạch ngang */
export const TAXONOMY_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Chuẩn hóa slug: ưu tiên slug nhập vào, để trống thì sinh từ tên (hỗ trợ tiếng Việt) */
const toSlug = ({ value, obj }: { value: unknown; obj: { name?: unknown } }) =>
  typeof value === 'string' && value.trim()
    ? slugify(value)
    : slugify(typeof obj.name === 'string' ? obj.name : '');

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@DefaultErrorCode(ErrorCode.BRAND_VALIDATION_ERROR)
export class SubcategoryDto {
  @ApiPropertyOptional({
    description: 'ID danh mục con (tự sinh UUID nếu để trống)',
  })
  @Transform(({ value }) => value || randomUUID())
  @IsOptional()
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  id?: string;

  @ApiProperty({ description: 'Tên danh mục con', example: 'Khóa Vân Tay' })
  @Transform(trimString)
  @IsString({ message: 'Tên danh mục con phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên danh mục con không được để trống' })
  @MaxLength(TAXONOMY_NAME_MAX_LENGTH, {
    message: `Tên danh mục con tối đa ${TAXONOMY_NAME_MAX_LENGTH} ký tự`,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục con (tự sinh nếu để trống)',
    example: 'van-tay',
  })
  @Transform(toSlug)
  @IsOptional()
  @IsString({ message: 'Slug danh mục con phải là chuỗi ký tự' })
  @IsNotEmpty({
    message:
      'Slug danh mục con không hợp lệ: cần có ít nhất một chữ cái hoặc chữ số (không dấu)',
  })
  @MaxLength(TAXONOMY_SLUG_MAX_LENGTH, {
    message: `Slug danh mục con tối đa ${TAXONOMY_SLUG_MAX_LENGTH} ký tự`,
  })
  @Matches(TAXONOMY_SLUG_PATTERN, {
    message:
      'Slug danh mục con chỉ gồm chữ thường không dấu, số và dấu gạch ngang (VD: khoa-van-tay)',
  })
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
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  id?: string;

  @ApiProperty({ description: 'Tên danh mục cha', example: 'Khóa Cửa Gỗ' })
  @Transform(trimString)
  @IsString({ message: 'Tên danh mục cha phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên danh mục cha không được để trống' })
  @MaxLength(TAXONOMY_NAME_MAX_LENGTH, {
    message: `Tên danh mục cha tối đa ${TAXONOMY_NAME_MAX_LENGTH} ký tự`,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục cha (tự sinh nếu để trống)',
    example: 'cua-go',
  })
  @Transform(toSlug)
  @IsOptional()
  @IsString({ message: 'Slug danh mục cha phải là chuỗi ký tự' })
  @IsNotEmpty({
    message:
      'Slug danh mục cha không hợp lệ: cần có ít nhất một chữ cái hoặc chữ số (không dấu)',
  })
  @MaxLength(TAXONOMY_SLUG_MAX_LENGTH, {
    message: `Slug danh mục cha tối đa ${TAXONOMY_SLUG_MAX_LENGTH} ký tự`,
  })
  @Matches(TAXONOMY_SLUG_PATTERN, {
    message:
      'Slug danh mục cha chỉ gồm chữ thường không dấu, số và dấu gạch ngang (VD: khoa-van-tay)',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Danh sách danh mục con',
    type: [SubcategoryDto],
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách danh mục phải là mảng' })
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
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  id?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị số nguyên',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự hiển thị phải là số' })
  orderIndex?: number;

  @ApiProperty({ description: 'Tên thương hiệu', example: 'Yale' })
  @Transform(trimString)
  @IsString({ message: 'Tên thương hiệu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên thương hiệu không được để trống' })
  @MaxLength(TAXONOMY_NAME_MAX_LENGTH, {
    message: `Tên thương hiệu tối đa ${TAXONOMY_NAME_MAX_LENGTH} ký tự`,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Slug thương hiệu (tự động sinh từ tên nếu để trống)',
    example: 'yale',
  })
  @Transform(toSlug)
  @IsOptional()
  @IsString({ message: 'Slug thương hiệu phải là chuỗi ký tự' })
  @IsNotEmpty({
    message:
      'Slug thương hiệu không hợp lệ: cần có ít nhất một chữ cái hoặc chữ số (không dấu)',
  })
  @MaxLength(TAXONOMY_SLUG_MAX_LENGTH, {
    message: `Slug thương hiệu tối đa ${TAXONOMY_SLUG_MAX_LENGTH} ký tự`,
  })
  @Matches(TAXONOMY_SLUG_PATTERN, {
    message:
      'Slug thương hiệu chỉ gồm chữ thường không dấu, số và dấu gạch ngang (VD: khoa-van-tay)',
  })
  slug?: string;

  @ApiPropertyOptional({ description: 'Logo ảnh', example: '/brand/yale.png' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  @IsOptional()
  @IsString({ message: 'Logo phải là chuỗi đường dẫn' })
  @MaxLength(2048, { message: 'Đường dẫn logo tối đa 2048 ký tự' })
  logo?: string;

  @ApiPropertyOptional({ description: 'Logo HTML styled' })
  @IsOptional()
  @IsString({ message: 'Logo HTML phải là chuỗi ký tự' })
  logoHtml?: string;

  @ApiPropertyOptional({
    description: 'Cây danh mục và danh mục con của thương hiệu',
    type: [CategoryDto],
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách danh mục phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];
}
