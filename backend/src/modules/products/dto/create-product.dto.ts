import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { slugify } from '@/common/utils/string.util';
import { IsLessThanOrEqualField, DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';

export const PRODUCT_LIMITS = {
  NAME: 255,
  CODE: 64,
  SLUG: 160,
  TAXONOMY: 100,
  SHORT_TEXT: 255,
  SHORT_DESCRIPTION: 2000,
  URL: 2048,
  LIST: 200,
  LIST_ITEM: 1000,
  SPEC_KEY: 200,
  SPEC_VALUE: 2000,
  MAX_PRICE: 100_000_000_000,
  MAX_WARRANTY_MONTHS: 1200,
} as const;

/** Site path ("/uploads/a.jpg", not protocol-relative "//host") or an https:// URL. */
export const MEDIA_URL_PATTERN =
  /^(\/(?!\/)[^\r\n\t]*|https:\/\/[^\s/]+[^\r\n\t]*)$/;
const OPTIONAL_MEDIA_URL_PATTERN =
  /^(|\/(?!\/)[^\r\n\t]*|https:\/\/[^\s/]+[^\r\n\t]*)$/;
/** Lowercase letters, digits and single dashes (what `slugify` produces). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MEDIA_URL_MESSAGE =
  'phải là đường dẫn trong trang (bắt đầu bằng "/") hoặc URL https://';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Admin-provided slug: Vietnamese-aware slugify. Empty input stays "" so the service derives one from the code;
 * input that slugifies to nothing (e.g. "!!!") is kept as typed so validation rejects it with a clear message.
 */
const toSlug = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? slugify(value) || value.trim() : value;

const isProvided = (_obj: object, value: unknown) =>
  value !== undefined && value !== null && value !== '';

const SLUG_MESSAGE =
  'ID/slug chỉ được gồm chữ thường không dấu, số và dấu gạch ngang (ví dụ: khoa-kassler-kl-600)';

/** `specs` must be a flat object of string or number values (no nesting, arrays or null). */
function IsFlatSpecs(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'IsFlatSpecs',
      target: object.constructor,
      propertyName: String(propertyName),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return false;
          }
          return Object.entries(value as Record<string, unknown>).every(
            ([key, v]) =>
              key.trim().length > 0 &&
              key.length <= PRODUCT_LIMITS.SPEC_KEY &&
              ((typeof v === 'string' &&
                v.length <= PRODUCT_LIMITS.SPEC_VALUE) ||
                (typeof v === 'number' && Number.isFinite(v))),
          );
        },
        defaultMessage(): string {
          return `Thông số kỹ thuật phải là danh sách "tên: giá trị" với giá trị là chữ hoặc số (tên tối đa ${PRODUCT_LIMITS.SPEC_KEY} ký tự)`;
        },
      },
    });
  };
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductInstallationDto {
  @ApiPropertyOptional({ description: 'Danh sách URL hình ảnh lắp đặt' })
  @IsOptional()
  @Matches(MEDIA_URL_PATTERN, {
    each: true,
    message: `Mỗi ảnh lắp đặt ${MEDIA_URL_MESSAGE}`,
  })
  @IsString({ each: true, message: 'Mỗi ảnh lắp đặt phải là chuỗi URL' })
  @ArrayMaxSize(PRODUCT_LIMITS.LIST, {
    message: `Tối đa ${PRODUCT_LIMITS.LIST} ảnh lắp đặt`,
  })
  @IsArray({ message: 'Ảnh lắp đặt phải là danh sách' })
  images?: string[];

  @ApiPropertyOptional({ description: 'Danh sách URL video lắp đặt' })
  @IsOptional()
  @Matches(MEDIA_URL_PATTERN, {
    each: true,
    message: `Mỗi video lắp đặt ${MEDIA_URL_MESSAGE}`,
  })
  @IsString({ each: true, message: 'Mỗi video lắp đặt phải là chuỗi URL' })
  @ArrayMaxSize(PRODUCT_LIMITS.LIST, {
    message: `Tối đa ${PRODUCT_LIMITS.LIST} video lắp đặt`,
  })
  @IsArray({ message: 'Video lắp đặt phải là danh sách' })
  videos?: string[];
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductVariantDto {
  @ApiPropertyOptional({ description: 'ID biến thể' })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.CODE, {
    message: `ID biến thể tối đa ${PRODUCT_LIMITS.CODE} ký tự`,
  })
  @IsString({ message: 'ID biến thể phải là chuỗi' })
  id?: string;

  @ApiProperty({ description: 'Tên nhãn biến thể', example: 'Màu Vàng Đồng' })
  @MaxLength(PRODUCT_LIMITS.SHORT_TEXT, {
    message: `Tên biến thể tối đa ${PRODUCT_LIMITS.SHORT_TEXT} ký tự`,
  })
  @IsNotEmpty({ message: 'Tên biến thể không được để trống' })
  @IsString({ message: 'Tên biến thể phải là chuỗi' })
  label: string;

  @ApiPropertyOptional({ description: 'Thuộc tính' })
  @IsOptional()
  @IsObject({ message: 'Thuộc tính biến thể phải là đối tượng' })
  attributes?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Giá bán' })
  @IsOptional()
  @IsLessThanOrEqualField('originalPrice', {
    message: 'Giá bán của biến thể không được lớn hơn giá gốc của biến thể',
    context: { errorCode: ErrorCode.PRODUCT_INVALID_PRICE },
  })
  @Min(0, { message: 'Giá biến thể không được âm' })
  @IsNumber({}, { message: 'Giá biến thể phải là số' })
  price?: number;

  @ApiPropertyOptional({ description: 'Giá gốc' })
  @IsOptional()
  @Min(0, { message: 'Giá gốc biến thể không được âm' })
  @IsNumber({}, { message: 'Giá gốc biến thể phải là số' })
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Phần trăm giảm' })
  @IsOptional()
  @Max(100, { message: 'Phần trăm giảm tối đa 100' })
  @Min(0, { message: 'Phần trăm giảm không được âm' })
  @IsNumber({}, { message: 'Phần trăm giảm của biến thể phải là số' })
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Khoảng giá hiển thị' })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.SHORT_TEXT, {
    message: `Khoảng giá biến thể tối đa ${PRODUCT_LIMITS.SHORT_TEXT} ký tự`,
  })
  @IsString({ message: 'Khoảng giá biến thể phải là chuỗi' })
  priceRange?: string;

  @ApiPropertyOptional({ description: 'Biến thể mặc định' })
  @IsOptional()
  @IsBoolean({ message: 'Cờ biến thể mặc định phải là true/false' })
  is_default?: boolean;
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductOptionDto {
  @ApiProperty({ description: 'Tên tùy chọn', example: 'Màu sắc' })
  @MaxLength(PRODUCT_LIMITS.SHORT_TEXT, {
    message: `Tên tùy chọn tối đa ${PRODUCT_LIMITS.SHORT_TEXT} ký tự`,
  })
  @IsNotEmpty({ message: 'Tên tùy chọn không được để trống' })
  @IsString({ message: 'Tên tùy chọn phải là chuỗi' })
  name: string;

  @ApiProperty({
    description: 'Các giá trị tùy chọn',
    example: ['Đen', 'Vàng'],
  })
  @IsString({ each: true, message: 'Mỗi giá trị tùy chọn phải là chuỗi' })
  @IsArray({ message: 'Giá trị tùy chọn phải là danh sách' })
  values: string[];
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class ProductFaqDto {
  @ApiProperty({ description: 'Câu hỏi' })
  @MaxLength(PRODUCT_LIMITS.LIST_ITEM, {
    message: `Câu hỏi FAQ tối đa ${PRODUCT_LIMITS.LIST_ITEM} ký tự`,
  })
  @IsNotEmpty({ message: 'Câu hỏi FAQ không được để trống' })
  @IsString({ message: 'Câu hỏi FAQ phải là chuỗi' })
  question: string;

  @ApiProperty({ description: 'Câu trả lời' })
  @IsNotEmpty({ message: 'Câu trả lời FAQ không được để trống' })
  @IsString({ message: 'Câu trả lời FAQ phải là chuỗi' })
  answer: string;
}

@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class CreateProductDto {
  @ApiPropertyOptional({
    description:
      'ID dạng slug duy nhất (đường dẫn URL). Để trống thì tự sinh từ mã sản phẩm.',
    example: 'kl-989f',
  })
  @Transform(toSlug)
  @ValidateIf(isProvided)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(PRODUCT_LIMITS.SLUG, {
    message: `ID/slug tối đa ${PRODUCT_LIMITS.SLUG} ký tự`,
  })
  @IsString({ message: 'ID/slug phải là chuỗi' })
  id?: string;

  @ApiPropertyOptional({
    description: 'Slug sản phẩm (ưu tiên hơn `id`; tự sinh nếu để trống)',
    example: 'khoa-cua-kassler-kl-989f',
  })
  @Transform(toSlug)
  @ValidateIf(isProvided)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(PRODUCT_LIMITS.SLUG, {
    message: `Slug tối đa ${PRODUCT_LIMITS.SLUG} ký tự`,
  })
  @IsString({ message: 'Slug phải là chuỗi' })
  slug?: string;

  @ApiProperty({ description: 'Mã sản phẩm', example: 'KL-989F' })
  @Transform(trimString)
  @MaxLength(PRODUCT_LIMITS.CODE, {
    message: `Mã sản phẩm tối đa ${PRODUCT_LIMITS.CODE} ký tự`,
  })
  @IsString({ message: 'Mã sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
  code: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Khóa cửa Kassler KL - 989 F',
  })
  @Transform(trimString)
  @MaxLength(PRODUCT_LIMITS.NAME, {
    message: `Tên sản phẩm tối đa ${PRODUCT_LIMITS.NAME} ký tự`,
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({
    description: 'ID thương hiệu (UUID, từ danh mục Brands)',
    example: '7afccd8e-940e-4e9f-81bb-8754925f6e48',
  })
  @Transform(trimString)
  @IsUUID('all', { message: 'Mã thương hiệu (brandId) không hợp lệ' })
  @IsString({ message: 'Mã thương hiệu (brandId) phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng chọn thương hiệu cho sản phẩm' })
  brandId: string;

  @ApiProperty({
    description: 'Slug danh mục (thuộc Brand đã chọn)',
    example: 'dai-sanh',
  })
  @Transform(trimString)
  @MaxLength(PRODUCT_LIMITS.TAXONOMY, {
    message: `Danh mục chính tối đa ${PRODUCT_LIMITS.TAXONOMY} ký tự`,
  })
  @IsString({ message: 'Danh mục chính phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng chọn danh mục chính cho sản phẩm' })
  category: string;

  @ApiPropertyOptional({
    description: 'Slug danh mục con (nếu có; gửi "" để bỏ danh mục con)',
    example: 'ket-mini',
  })
  @Transform(trimString)
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.TAXONOMY, {
    message: `Danh mục phụ tối đa ${PRODUCT_LIMITS.TAXONOMY} ký tự`,
  })
  @IsString({ message: 'Danh mục phụ phải là chuỗi' })
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({ description: 'Mô tả ngắn' })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.SHORT_DESCRIPTION, {
    message: `Mô tả ngắn tối đa ${PRODUCT_LIMITS.SHORT_DESCRIPTION} ký tự`,
  })
  @IsString({ message: 'Mô tả ngắn phải là chuỗi' })
  shortDescription?: string;

  @ApiPropertyOptional({
    description:
      'Nội dung bài viết chi tiết của sản phẩm (hỗ trợ văn bản thuần hoặc mã HTML/Rich Text)',
    example: '<p>Chi tiết đánh giá sản phẩm...</p>',
  })
  @IsOptional()
  @IsString({ message: 'Nội dung bài viết phải là chuỗi' })
  content?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện' })
  @IsOptional()
  @Matches(OPTIONAL_MEDIA_URL_PATTERN, {
    message: `Ảnh đại diện ${MEDIA_URL_MESSAGE}`,
  })
  @MaxLength(PRODUCT_LIMITS.URL, {
    message: `Đường dẫn ảnh đại diện tối đa ${PRODUCT_LIMITS.URL} ký tự`,
  })
  @IsString({ message: 'Ảnh đại diện phải là chuỗi URL' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Danh sách ảnh', example: [] })
  @IsOptional()
  @Matches(MEDIA_URL_PATTERN, {
    each: true,
    message: `Mỗi ảnh sản phẩm ${MEDIA_URL_MESSAGE}`,
  })
  @IsString({ each: true, message: 'Mỗi ảnh sản phẩm phải là chuỗi URL' })
  @ArrayMaxSize(PRODUCT_LIMITS.LIST, {
    message: `Tối đa ${PRODUCT_LIMITS.LIST} ảnh sản phẩm`,
  })
  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  images?: string[];

  @ApiPropertyOptional({
    description:
      'Giá bán thực tế / Giá sau giảm (VNĐ). 0 hoặc null = "Liên hệ" (lưu là 0).',
    example: 45000000,
  })
  @Transform(({ value }) => (value === null ? 0 : value))
  @IsOptional()
  @IsLessThanOrEqualField('originalPrice', {
    message: 'Giá bán không được lớn hơn giá gốc',
    context: { errorCode: ErrorCode.PRODUCT_INVALID_PRICE },
  })
  @Max(PRODUCT_LIMITS.MAX_PRICE, { message: 'Giá bán quá lớn' })
  @Min(0, { message: 'Giá bán không được âm' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Giá bán phải là số' },
  )
  price?: number;

  @ApiPropertyOptional({
    description: 'Giá gốc niêm yết từ hãng (VNĐ). Gửi null để xóa giá gốc.',
    example: 50000000,
  })
  @IsOptional()
  @Max(PRODUCT_LIMITS.MAX_PRICE, { message: 'Giá gốc quá lớn' })
  @Min(0, { message: 'Giá gốc không được âm' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Giá gốc phải là số' },
  )
  originalPrice?: number | null;

  @ApiPropertyOptional({ description: 'Phần trăm giảm giá (%)', example: 10 })
  @IsOptional()
  @Max(100, { message: 'Phần trăm giảm giá tối đa 100' })
  @Min(0, { message: 'Phần trăm giảm giá không được âm' })
  @IsNumber({}, { message: 'Phần trăm giảm giá phải là số' })
  discountPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Chuỗi hiển thị giá',
    example: '45.000.000 VNĐ',
  })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.SHORT_TEXT, {
    message: `Chuỗi hiển thị giá tối đa ${PRODUCT_LIMITS.SHORT_TEXT} ký tự`,
  })
  @IsString({ message: 'Chuỗi hiển thị giá phải là chuỗi' })
  priceRange?: string | null;

  @ApiPropertyOptional({ description: 'Tính năng nổi bật', example: [] })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.LIST_ITEM, {
    each: true,
    message: `Mỗi tính năng nổi bật tối đa ${PRODUCT_LIMITS.LIST_ITEM} ký tự`,
  })
  @IsString({ each: true, message: 'Mỗi tính năng nổi bật phải là chuỗi' })
  @ArrayMaxSize(PRODUCT_LIMITS.LIST, {
    message: `Tối đa ${PRODUCT_LIMITS.LIST} tính năng nổi bật`,
  })
  @IsArray({ message: 'Tính năng nổi bật phải là danh sách' })
  features?: string[];

  @ApiPropertyOptional({
    description: 'Thông số kỹ thuật (đối tượng phẳng: tên -> chữ hoặc số)',
  })
  @IsOptional()
  @IsFlatSpecs()
  specs?: Record<string, string | number>;

  @ApiPropertyOptional({ description: 'Công nghệ tích hợp' })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.LIST_ITEM, {
    each: true,
    message: `Mỗi công nghệ tích hợp tối đa ${PRODUCT_LIMITS.LIST_ITEM} ký tự`,
  })
  @IsString({ each: true, message: 'Mỗi công nghệ tích hợp phải là chuỗi' })
  @IsArray({ message: 'Công nghệ tích hợp phải là danh sách' })
  technologies?: string[];

  @ApiPropertyOptional({
    description: 'Thời gian bảo hành (tháng, số nguyên ≥ 0)',
    example: 36,
  })
  @IsOptional()
  @Max(PRODUCT_LIMITS.MAX_WARRANTY_MONTHS, {
    message: `Thời hạn bảo hành tối đa ${PRODUCT_LIMITS.MAX_WARRANTY_MONTHS} tháng`,
  })
  @Min(0, { message: 'Thời hạn bảo hành không được âm' })
  @IsInt({ message: 'Thời hạn bảo hành phải là số tháng nguyên' })
  warranty?: number;

  @ApiPropertyOptional({ description: 'Text bảo hành', example: '3 năm' })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.SHORT_TEXT, {
    message: `Ghi chú bảo hành tối đa ${PRODUCT_LIMITS.SHORT_TEXT} ký tự`,
  })
  @IsString({ message: 'Ghi chú bảo hành phải là chuỗi' })
  warrantyText?: string;

  @ApiPropertyOptional({ description: 'Màu sắc', example: ['Vàng Đồng'] })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.SHORT_TEXT, {
    each: true,
    message: `Mỗi màu sắc tối đa ${PRODUCT_LIMITS.SHORT_TEXT} ký tự`,
  })
  @IsString({ each: true, message: 'Mỗi màu sắc phải là chuỗi' })
  @IsArray({ message: 'Màu sắc phải là danh sách' })
  colors?: string[];

  @ApiPropertyOptional({ description: 'Media lắp đặt thực tế (ảnh + video)' })
  @IsOptional()
  @Type(() => ProductInstallationDto)
  @ValidateNested()
  @IsObject({ message: 'Media lắp đặt phải có dạng { images, videos }' })
  installation?: ProductInstallationDto;

  @ApiPropertyOptional({
    description: 'Có biến thể hay không',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Cờ biến thể phải là true/false' })
  has_variants?: boolean;

  @ApiPropertyOptional({ description: 'Tuỳ chọn' })
  @IsOptional()
  @Type(() => ProductOptionDto)
  @ValidateNested({ each: true })
  @IsArray({ message: 'Tùy chọn phải là danh sách' })
  options?: ProductOptionDto[];

  @ApiPropertyOptional({ description: 'Danh sách biến thể' })
  @IsOptional()
  @Type(() => ProductVariantDto)
  @ValidateNested({ each: true })
  @IsArray({ message: 'Biến thể phải là danh sách' })
  variants?: ProductVariantDto[];

  @ApiPropertyOptional({ description: 'Danh sách câu hỏi thường gặp' })
  @IsOptional()
  @Type(() => ProductFaqDto)
  @ValidateNested({ each: true })
  @IsArray({ message: 'FAQ phải là danh sách' })
  faq?: ProductFaqDto[];

  @ApiPropertyOptional({ description: 'Tài liệu hướng dẫn lắp đặt' })
  @IsOptional()
  @MaxLength(PRODUCT_LIMITS.LIST_ITEM, {
    each: true,
    message: `Mỗi bước lắp đặt tối đa ${PRODUCT_LIMITS.LIST_ITEM} ký tự`,
  })
  @IsString({ each: true, message: 'Mỗi bước lắp đặt phải là chuỗi' })
  @IsArray({ message: 'Quy trình lắp đặt phải là danh sách' })
  installationManual?: string[];

  @ApiPropertyOptional({ description: 'Preview hình ảnh lắp đặt' })
  @IsOptional()
  @Matches(MEDIA_URL_PATTERN, {
    each: true,
    message: `Mỗi ảnh xem trước ${MEDIA_URL_MESSAGE}`,
  })
  @IsString({ each: true, message: 'Mỗi ảnh xem trước phải là chuỗi URL' })
  @IsArray({ message: 'Ảnh xem trước lắp đặt phải là danh sách' })
  installation_preview?: string[];

  @ApiPropertyOptional({
    description: 'Thứ tự ưu tiên hiển thị (số nguyên, nhỏ lên đầu)',
    example: 1,
  })
  @IsOptional()
  @Max(1_000_000, { message: 'Thứ tự ưu tiên quá lớn' })
  @Min(0, { message: 'Thứ tự ưu tiên không được âm' })
  @IsInt({ message: 'Thứ tự ưu tiên phải là số nguyên' })
  priority?: number;
}
