import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageResponseDto {
  @ApiProperty({ example: 'msg-uuid-1' })
  id: string;

  @ApiProperty({ example: 'session-uuid-1' })
  sessionId: string;

  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  role: string;

  @ApiProperty({ example: 'Tư vấn cho tôi khóa cửa gỗ' })
  content: string;

  @ApiPropertyOptional({ example: '14.241.12.34' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent?: string;

  @ApiPropertyOptional({ example: 'https://tahouse.vn/products' })
  origin?: string;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;
}

export class ChatSessionResponseDto {
  @ApiProperty({ example: 'session-uuid-1' })
  id: string;

  @ApiPropertyOptional({ example: 'Tư vấn cho tôi khóa cửa gỗ' })
  title?: string;

  @ApiPropertyOptional({ example: '14.241.12.34' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent?: string;

  @ApiPropertyOptional({ example: 'Google Chrome' })
  browser?: string;

  @ApiPropertyOptional({ example: 'Windows 10/11' })
  os?: string;

  @ApiPropertyOptional({ example: 'Desktop' })
  device?: string;

  @ApiPropertyOptional({ example: 'https://tahouse.vn' })
  origin?: string;

  @ApiPropertyOptional({ example: 'https://tahouse.vn/products/locks' })
  referer?: string;

  @ApiPropertyOptional({ example: 'Thành phố Hồ Chí Minh' })
  location?: string;

  @ApiProperty({ example: 4 })
  totalMessages: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [ChatMessageResponseDto] })
  messages?: ChatMessageResponseDto[];
}

export class ChatSessionsListResponseDto {
  @ApiProperty({ type: [ChatSessionResponseDto] })
  items: ChatSessionResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
