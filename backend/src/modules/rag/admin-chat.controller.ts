import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { JwtAuthGuard } from '@/common/guards';
import { ChatRepository } from './repositories/chat.repository';
import { GetChatSessionsDto } from './dto/get-chat-sessions.dto';
import {
  ChatSessionsListResponseDto,
  ChatSessionResponseDto,
} from './dto/chat-session-response.dto';

@ApiTags(SwaggerTag.ADMIN_CHAT)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminChatController {
  constructor(private readonly chatRepository: ChatRepository) {}

  @Get(ApiRoute.ADMIN_CHAT_SESSIONS)
  @ApiOperation({
    summary: 'Lấy danh sách các phiên chat của khách hàng để audit (Admin)',
    description:
      'Yêu cầu Bearer Token Admin. Trả về danh sách phiên chat gồm: IP người dùng, trình duyệt, hệ điều hành, thiết bị, website nguồn (Origin/Referer), thời gian nhắn tin và số lượng tin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phiên chat.',
    type: ChatSessionsListResponseDto,
  })
  async getSessions(
    @Query() query: GetChatSessionsDto,
  ): Promise<ChatSessionsListResponseDto> {
    return this.chatRepository.findSessions(query);
  }

  @Get(ApiRoute.ADMIN_CHAT_SESSION_DETAIL)
  @ApiOperation({
    summary: 'Xem chi tiết lịch sử tin nhắn của một phiên chat cụ thể (Admin)',
    description:
      'Trả về thông tin chi tiết phiên chat cùng toàn bộ lịch sử tin nhắn của người dùng và bot để thanh tra/audit.',
  })
  @ApiParam({ name: 'id', description: 'ID định danh của phiên chat (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết phiên chat và chuỗi tin nhắn.',
    type: ChatSessionResponseDto,
  })
  async getSessionDetail(
    @Param('id') id: string,
  ): Promise<ChatSessionResponseDto> {
    const session = await this.chatRepository.findSessionWithMessages(id);
    if (!session) {
      throw new NotFoundException(`Không tìm thấy phiên chat với ID: ${id}`);
    }
    return session;
  }

  @Delete(ApiRoute.ADMIN_CHAT_SESSION_DETAIL)
  @ApiOperation({
    summary: 'Xóa một phiên chat và toàn bộ tin nhắn liên quan (Admin)',
  })
  @ApiParam({ name: 'id', description: 'ID phiên chat cần xóa' })
  @ApiResponse({
    status: 200,
    description: 'Xóa phiên chat thành công.',
  })
  async deleteSession(@Param('id') id: string) {
    const session = await this.chatRepository.findSessionWithMessages(id);
    if (!session) {
      throw new NotFoundException(`Không tìm thấy phiên chat với ID: ${id}`);
    }
    await this.chatRepository.deleteSession(id);
    return { success: true, message: 'Đã xóa phiên chat thành công' };
  }
}
