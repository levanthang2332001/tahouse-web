import { Controller, Post, Body, Res, Get, Query } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
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

    // Gửi headers về client ngay lập tức để kích hoạt chế độ stream
    res.flushHeaders();

    // 2. Gọi service lấy RxJS Observable stream
    const stream$ = this.ragService.streamChat(
      body.message,
      body.history || [],
      body.location,
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

  @Get('client')
  @ApiOperation({
    summary: 'Giao diện chat client để test tư vấn AI trên mọi thiết bị trong mạng LAN',
  })
  getClient(@Res() res: Response) {
    const filePath = path.join(process.cwd(), 'test-chat.html');
    res.sendFile(filePath);
  }

  @Get('zalo')
  @ApiOperation({
    summary: 'Chuyển hướng qua Zalo và tự động copy tin nhắn mẫu sản phẩm',
  })
  zaloRedirect(
    @Query('product') product: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    const zaloPhone = process.env.ZALO_PHONE_NUMBER || '0987654321';
    const cleanPhone = zaloPhone.replace(/\D/g, '');
    const zaloLink = process.env.ZALO_LINK || `https://zalo.me/${cleanPhone}`;
    const templateMessage = `Xin chào TA House, tôi muốn nhận tư vấn và lắp đặt sản phẩm khóa ${product || ''} (Mã: ${code || ''}).`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đang kết nối Zalo - TA House</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #0b0d19;
      color: #f3f4f6;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: rgba(20, 24, 46, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(147, 51, 234, 0.25);
      padding: 35px 30px;
      border-radius: 20px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 20px 0 rgba(168, 85, 247, 0.2);
      max-width: 450px;
      width: 100%;
    }
    h2 {
      background: linear-gradient(to right, #e879f9, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 0;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 15px;
    }
    .message-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(168, 85, 247, 0.2);
      padding: 15px;
      border-radius: 12px;
      margin: 20px 0;
      font-size: 0.95rem;
      color: #e2e8f0;
      text-align: left;
      word-break: break-word;
      line-height: 1.5;
    }
    .btn {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      border: none;
      color: white;
      padding: 14px 28px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
      width: 80%;
      box-sizing: border-box;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
    }
    .toast {
      position: fixed;
      bottom: 30px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 9999;
    }
    .toast.show {
      opacity: 1;
    }
    .icon-container {
      font-size: 3rem;
      margin-bottom: 10px;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="icon-container">💬</div>
    <h2>Tư vấn qua Zalo</h2>
    <p style="margin: 0; color: #9ca3af; font-size: 0.9rem; line-height: 1.4; margin-bottom: 20px;">
      Vui lòng làm theo hướng dẫn 3 bước dưới đây để gửi tin nhắn yêu cầu tư vấn cho chuyên viên TA House:
    </p>

    <!-- Khối hướng dẫn 3 bước cực kỳ trực quan -->
    <div style="text-align: left; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(168, 85, 247, 0.15); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
      <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.85rem; line-height: 1.4; color: #e2e8f0;">
        <span style="background: #a855f7; color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.75rem;">1</span>
        <span>Nhấn nút <strong>"Sao chép & Mở Zalo"</strong> ở dưới cùng. Tin nhắn sẽ tự động được lưu vào khay nhớ tạm.</span>
      </div>
      <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 0.85rem; line-height: 1.4; color: #e2e8f0;">
        <span style="background: #a855f7; color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.75rem;">2</span>
        <span>Ứng dụng Zalo sẽ tự động mở ra khung chat của chuyên viên kỹ thuật.</span>
      </div>
      <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; line-height: 1.4; color: #e2e8f0;">
        <span style="background: #a855f7; color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.75rem;">3</span>
        <span>Nhấp vào ô soạn tin nhắn, thực hiện <strong>Dán (Paste hoặc Ctrl+V / Cmd+V)</strong> và nhấn <strong>Gửi</strong>.</span>
      </div>
    </div>

    <p style="margin: 0; color: #e2e8f0; font-size: 0.85rem; text-align: left; font-weight: 600; margin-bottom: -10px;">Nội dung tin nhắn sẽ gửi:</p>
    <div class="message-box" id="msgBox" onclick="copyMessageText()" style="cursor: pointer; position: relative;" title="Nhấn để sao chép">
      <div style="user-select: text; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text;">${templateMessage}</div>
      <div style="font-size: 0.75rem; color: #a855f7; font-weight: 600; margin-top: 8px; border-top: 1px dashed rgba(168, 85, 247, 0.2); padding-top: 6px; text-align: right; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;">📋 Nhấn vào đây để copy nhanh</div>
    </div>
    
    <a href="${zaloLink}" target="_blank" class="btn" id="zaloBtn">Sao chép & Mở Zalo</a>
  </div>

  <div class="toast" id="toast">Đã sao chép tin nhắn mẫu vào bộ nhớ tạm!</div>

  <script>
    const message = ${JSON.stringify(templateMessage)};
    const toast = document.getElementById('toast');
    const zaloBtn = document.getElementById('zaloBtn');

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Không thể copy:', err);
        }
        document.body.removeChild(textarea);
        return Promise.resolve();
      }
    }

    function copyMessageText() {
      copyToClipboard(message).then(() => {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 1500);
      });
    }

    // Hàm copy và cập nhật trạng thái nút bấm
    zaloBtn.addEventListener('click', (e) => {
      // Thực hiện copy tin nhắn mẫu vào clipboard
      copyToClipboard(message).then(() => {
        // Hiển thị thông báo Toast thành công
        toast.classList.add('show');
        
        // Đổi giao diện nút bấm sang trạng thái thành công
        const originalText = zaloBtn.innerText;
        const originalBg = zaloBtn.style.background;
        
        zaloBtn.innerText = "Đã sao chép! Đang mở Zalo...";
        zaloBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
        
        setTimeout(() => {
          toast.classList.remove('show');
          zaloBtn.innerText = originalText;
          zaloBtn.style.background = originalBg;
        }, 2000);
      }).catch(err => {
        console.error('Lỗi khi copy:', err);
      });
      
      // Cho phép trình duyệt mở tab mới tự nhiên theo thuộc tính target="_blank"
    });
  </script>
</body>
</html>
`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
