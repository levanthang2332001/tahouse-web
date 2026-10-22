import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';

export class SocialLinksDto {
  @ApiPropertyOptional({
    description: 'Đường dẫn hoặc số điện thoại Zalo tư vấn',
    example: 'https://zalo.me/0938824479',
  })
  @IsOptional()
  @IsString()
  zalo?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn Fanpage hoặc Trang Facebook',
    example: 'https://facebook.com/tahouse.vn',
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'Kênh YouTube chính thức',
    example: 'https://youtube.com/@tahouse',
  })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Trang Instagram',
    example: 'https://instagram.com/tahouse.vn',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Kênh TikTok',
    example: 'https://tiktok.com/@tahouse.vn',
  })
  @IsOptional()
  @IsString()
  tiktok?: string;
}

export class PhoneNumberItemDto {
  @ApiPropertyOptional({
    description: 'ID định danh số điện thoại (nếu có)',
    example: 'phone-1',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Số điện thoại liên hệ / Hotline',
    example: '1900 8899',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  number: string;

  @ApiProperty({
    description:
      'Tên nhãn / Phòng ban phụ trách (VD: Hotline 24/7, Kỹ thuật & Lắp đặt)',
    example: 'Tổng đài Hotline 24/7',
  })
  @IsString({ message: 'Tên nhãn số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên nhãn số điện thoại không được để trống' })
  label: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu là số Hotline ưu tiên hiển thị',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isHotline?: boolean;
}

export class EmailItemDto {
  @ApiPropertyOptional({
    description: 'ID định danh email',
    example: 'email-1',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Địa chỉ Email',
    example: 'info@takit.vn',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Tên nhãn email (VD: Email CSKH, Email Báo giá)',
    example: 'Hộp thư CSKH & Hỗ trợ',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên nhãn email không được để trống' })
  label: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu là Email chính',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class AddressItemDto {
  @ApiPropertyOptional({
    description: 'ID định danh chi nhánh',
    example: 'addr-1',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Tên chi nhánh / showroom',
    example: 'Showroom Thủ Đức (Trụ sở chính)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên chi nhánh không được để trống' })
  branchName: string;

  @ApiProperty({
    description: 'Địa chỉ chi tiết của cửa hàng',
    example: '961A Kha Vạn Cân, P. Linh Xuân, TP. Thủ Đức, TP. HCM',
  })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  address: string;

  @ApiPropertyOptional({
    description: 'Link chỉ đường Google Maps hoặc tọa độ',
    example: 'https://maps.google.com/?q=961A+Kha+Van+Can',
  })
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu là trụ sở chính / địa chỉ ưu tiên',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class OpeningHoursDto {
  @ApiProperty({
    description: 'Thời gian mở cửa tổng quát hiển thị trên website',
    example: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Giờ mở cửa tổng quát không được để trống' })
  text: string;

  @ApiPropertyOptional({
    description: 'Giờ mở cửa các ngày trong tuần (Thứ 2 - Thứ 6)',
    example: '08:00 - 21:00',
  })
  @IsOptional()
  @IsString()
  weekdays?: string;

  @ApiPropertyOptional({
    description: 'Giờ mở cửa dịp cuối tuần (Thứ 7 - Chủ Nhật)',
    example: '08:00 - 21:30',
  })
  @IsOptional()
  @IsString()
  weekend?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm về giờ mở cửa hoặc ngày lễ',
    example: 'Phục vụ tư vấn và khảo sát trực tiếp tất cả các ngày trong tuần',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

@DefaultErrorCode(ErrorCode.SETTINGS_VALIDATION_ERROR)
export class UpdateStoreSettingsDto {
  @ApiPropertyOptional({
    description: 'Tên cửa hàng / thương hiệu hiển thị',
    example: 'TA HOUSE',
  })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional({
    description: 'Slogan hoặc lời giới thiệu ngắn',
    example: 'Giải pháp khóa thông minh & Thiết bị gia đình cao cấp',
  })
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional({
    description:
      'Cấu hình mạng xã hội (Zalo, Facebook, YouTube, Instagram, TikTok)',
    type: SocialLinksDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    description:
      'Danh sách số điện thoại (Có thể có nhiều số, gắn nhãn từng số)',
    type: [PhoneNumberItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneNumberItemDto)
  phoneNumbers?: PhoneNumberItemDto[];

  @ApiPropertyOptional({
    description: 'Danh sách email liên hệ',
    type: [EmailItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailItemDto)
  emails?: EmailItemDto[];

  @ApiPropertyOptional({
    description: 'Danh sách địa chỉ cửa hàng / showroom / chi nhánh',
    type: [AddressItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressItemDto)
  addresses?: AddressItemDto[];

  @ApiPropertyOptional({
    description: 'Cấu hình giờ giấc mở cửa',
    type: OpeningHoursDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OpeningHoursDto)
  openingHours?: OpeningHoursDto;

  @ApiPropertyOptional({
    description: 'Thông tin mở rộng khác',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
