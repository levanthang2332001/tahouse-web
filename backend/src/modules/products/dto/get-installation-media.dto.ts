import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsEnum } from 'class-validator';

export enum MediaType {
  ALL = 'all',
  IMAGES = 'images',
  VIDEOS = 'videos',
}

export class GetInstallationMediaDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại',
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng media trên mỗi trang',
    default: 12,
    minimum: 1,
    maximum: 50,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({
    description:
      'Loại media cần lấy:\n' +
      '* all: Tất cả (ảnh + video)\n' +
      '* images: Chỉ ảnh\n' +
      '* videos: Chỉ video',
    enum: MediaType,
    default: MediaType.ALL,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType = MediaType.ALL;
}
