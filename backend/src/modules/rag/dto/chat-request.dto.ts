import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'Tin nhắn hiện tại của người dùng (tối đa 300 ký tự)',
    example: 'Khóa KL-989F có những tính năng gì?',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @MaxLength(300, { message: 'Nội dung câu hỏi không được vượt quá 300 ký tự' })
  message: string;

  @ApiPropertyOptional({
    description: 'Lịch sử cuộc hội thoại trước đó (tối đa 10 tin nhắn gần nhất)',
    type: [ChatMessageDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Lịch sử trò chuyện không được vượt quá 10 tin nhắn' })
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

  @ApiPropertyOptional({
    description: 'ID phiên trò chuyện (nếu có để tiếp tục chuỗi hội thoại)',
    example: 'd8c7c936-3974-4b5b-9d41-39fe40bfbb84',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
