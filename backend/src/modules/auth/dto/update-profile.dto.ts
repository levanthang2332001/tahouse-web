import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Họ và tên hiển thị của tài khoản',
    example: 'Quản Trị Viên TA House',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ Email liên hệ',
    example: 'admin@tahouse.vn',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email is invalid' })
  email?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh đại diện (Avatar) tải lên từ Cloudflare R2',
    example:
      'https://pub-574171c4de1f4094b5bcfb3b35270183.r2.dev/avatars/admin-avatar.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
