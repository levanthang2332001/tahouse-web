import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RagService } from './services/rag.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@ApiTags('RAG Chatbot')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('chat')
  @ApiOperation({
    summary:
      'Gửi câu hỏi tư vấn chatbot và nhận luồng dữ liệu stream trả về (HTTP POST Streaming)',
    description:
      'Endpoint nhận câu hỏi và lịch sử trò chuyện qua phương thức POST, trả về kết quả stream chữ chạy từng phần.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Kết nối stream thành công. Trả về luồng dữ liệu text/event-stream.',
  })
  chat(@Body() body: ChatRequestDto, @Res() res: Response) {
    // 1. Cấu hình Headers cho HTTP POST Streaming (SSE-like)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Vô hiệu hóa buffering trên Nginx giúp dữ liệu stream chảy về client lập tức không bị nghẽn
    res.setHeader('X-Accel-Buffering', 'no');

    // 2. Gọi service lấy RxJS Observable stream
    const stream$ = this.ragService.streamChat(
      body.message,
      body.history || [],
    );

    // 3. Subscribe nhận dữ liệu và đẩy xuống client
    const subscription = stream$.subscribe({
      next: (chunk) => {
        // Serialize chunk thành JSON để tránh ký tự ngắt dòng (\n) của Markdown làm gãy giao thức event-stream
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      error: (err) => {
        res.write(
          `data: ${JSON.stringify({ error: err.message || 'Lỗi xử lý luồng stream' })}\n\n`,
        );
        res.end();
      },
      complete: () => {
        res.write('data: [DONE]\n\n');
        res.end();
      },
    });

    // 4. Lắng nghe sự kiện client đóng kết nối (ví dụ: tắt trình duyệt, hủy request)
    res.on('close', () => {
      // Hủy subscribe sẽ tự động kích hoạt AbortController hủy kết nối HTTP đến API LLM phía sau
      subscription.unsubscribe();
    });
  }
}
