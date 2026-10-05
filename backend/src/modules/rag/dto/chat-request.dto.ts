import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class ChatMessageDto {
  @ApiProperty({
    description: 'Vai trò của người gửi tin nhắn',
    enum: ChatRole,
    example: 'user',
  })
  @IsEnum(ChatRole)
  role: ChatRole;

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Tìm cho tôi khóa cửa gỗ Kassler mạ vàng',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'Tin nhắn hiện tại của người dùng',
    example: 'Khóa KL-989F có những tính năng gì?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Lịch sử cuộc hội thoại trước đó (Frontend lưu)',
    type: [ChatMessageDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[] = [];

  @ApiPropertyOptional({
    description: 'Vị trí hiện tại của người dùng',
    example: 'Quận 1, Thành phố Hồ Chí Minh',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
