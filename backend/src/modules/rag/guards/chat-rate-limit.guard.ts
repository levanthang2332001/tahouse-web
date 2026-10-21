import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

@Injectable()
export class ChatRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(ChatRateLimitGuard.name);

  // In-memory sliding window rate limiter
  private readonly ipRequests = new Map<string, RateLimitRecord>();

  // Cấu hình giới hạn: 5 tin / 1 phút; 20 tin / 1 giờ
  private readonly MAX_PER_MINUTE = 5;
  private readonly MAX_PER_HOUR = 20;

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

    // 1. Kiểm tra giới hạn theo phút (5 reqs / 1 min)
    const requestsLastMinute = record.timestamps.filter(
      (time) => now - time < this.ONE_MINUTE_MS,
    ).length;

    if (requestsLastMinute >= this.MAX_PER_MINUTE) {
      this.logger.warn(
        `[RateLimit Block] IP: ${clientIp} vượt quá 5 tin/phút (${requestsLastMinute} reqs)`,
      );
      throw new HttpException(
        {
          success: false,
          code: 429,
          message:
            'Bạn đang gửi câu hỏi quá nhanh. Vui lòng chờ 1 phút hoặc liên hệ trực tiếp Zalo 0938824479 để được chuyên viên hỗ trợ ngay.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Kiểm tra giới hạn theo giờ (20 reqs / 1 hour)
    if (record.timestamps.length >= this.MAX_PER_HOUR) {
      this.logger.warn(
        `[RateLimit Block] IP: ${clientIp} vượt quá 20 tin/giờ (${record.timestamps.length} reqs)`,
      );
      throw new HttpException(
        {
          success: false,
          code: 429,
          message:
            'Bạn đã đạt giới hạn 20 câu hỏi trong 1 giờ. Vui lòng kết nối Zalo 0938824479 để được chuyên viên TA House tư vấn chi tiết.',
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
   * Trích xuất địa chỉ IP chính xác của Client, hỗ trợ Cloudflare Edge
   */
  private extractClientIp(req: Request): string {
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && cfIp.trim().length > 0) {
      return cfIp.trim();
    }

    const xForwardedFor = req.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string') {
      const firstIp = xForwardedFor.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    return req.ip || req.socket?.remoteAddress || 'unknown-client';
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
