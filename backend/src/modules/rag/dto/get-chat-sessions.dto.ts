import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetChatSessionsDto {
  @ApiPropertyOptional({
    description: 'Số trang (bắt đầu từ 1)',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng phiên trò chuyện trên một trang',
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo Tiêu đề, Địa chỉ IP hoặc Vị trí',
    example: '127.0.0.1',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo địa chỉ IP cụ thể để audit',
    example: '14.241.12.34',
  })
  @IsOptional()
  @IsString()
  ip?: string;
}
