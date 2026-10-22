import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { parseAuditInfo } from '../utils/audit-parser.util';

interface RateLimitRecord {
  timestamps: number[];
}

@Injectable()
export class ChatRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(ChatRateLimitGuard.name);

  // In-memory sliding window rate limiter
  private readonly ipRequests = new Map<string, RateLimitRecord>();

  // Cấu hình giới hạn: mặc định 15 tin / 1 phút; 60 tin / 1 giờ (có thể cấu hình qua biến môi trường)
  private get maxPerMinute(): number {
    const val = Number(process.env.CHAT_RATE_LIMIT_PER_MINUTE);
    return !isNaN(val) && val > 0 ? val : 15;
  }

  private get maxPerHour(): number {
    const val = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR);
    return !isNaN(val) && val > 0 ? val : 60;
  }

  private readonly ONE_MINUTE_MS = 60 * 1000;
  private readonly ONE_HOUR_MS = 60 * 60 * 1000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.extractClientIp(request);
    const now = Date.now();

    // Lấy hoặc tạo mới record cho IP
    let record = this.ipRequests.get(clientIp);
    if (!record) {
      record = { timestamps: [] };
      this.ipRequests.set(clientIp, record);
    }

    // Lọc bỏ các timestamp cũ hơn 1 giờ
    record.timestamps = record.timestamps.filter(
      (time) => now - time < this.ONE_HOUR_MS,
    );

    // 1. Kiểm tra giới hạn theo phút (mặc định 15 reqs / 1 min)
    const requestsLastMinute = record.timestamps.filter(
      (time) => now - time < this.ONE_MINUTE_MS,
    ).length;

    const limitMinute = this.maxPerMinute;
    if (requestsLastMinute >= limitMinute) {
      this.logger.warn(
        `[RateLimit Block] IP: ${clientIp} vượt quá ${limitMinute} tin/phút (${requestsLastMinute} reqs)`,
      );
      throw new HttpException(
        {
          success: false,
          code: 429,
          message:
            'Bạn đang gửi câu hỏi hơi nhanh. Vui lòng chờ 1 phút hoặc liên hệ trực tiếp Zalo 0938824479 để được chuyên viên hỗ trợ ngay.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Kiểm tra giới hạn theo giờ (mặc định 60 reqs / 1 hour)
    const limitHour = this.maxPerHour;
    if (record.timestamps.length >= limitHour) {
      this.logger.warn(
        `[RateLimit Block] IP: ${clientIp} vượt quá ${limitHour} tin/giờ (${record.timestamps.length} reqs)`,
      );
      throw new HttpException(
        {
          success: false,
          code: 429,
          message:
            'Bạn đã đạt giới hạn 60 câu hỏi trong 1 giờ. Vui lòng kết nối Zalo 0938824479 để được chuyên viên TA House tư vấn chi tiết.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Ghi nhận request hợp lệ
    record.timestamps.push(now);

    // Định kỳ dọn dẹp bộ nhớ nếu kích thước Map quá lớn (> 5000 IPs)
    if (this.ipRequests.size > 5000) {
      this.cleanupOldEntries(now);
    }

    return true;
  }

  /**
   * Trích xuất địa chỉ IP chính xác của Client, chuẩn hóa và đồng bộ với audit log
   */
  private extractClientIp(req: Request): string {
    const audit = parseAuditInfo(req);
    return audit.ipAddress || 'unknown-client';
  }

  private cleanupOldEntries(now: number): void {
    for (const [ip, record] of this.ipRequests.entries()) {
      record.timestamps = record.timestamps.filter(
        (time) => now - time < this.ONE_HOUR_MS,
      );
      if (record.timestamps.length === 0) {
        this.ipRequests.delete(ip);
      }
    }
  }
}
