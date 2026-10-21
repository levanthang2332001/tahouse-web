import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';

interface LoginAttemptRecord {
  attempts: number[];
}

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(LoginRateLimitGuard.name);

  // In-memory sliding window rate limiter chống brute-force mật khẩu
  private readonly ipAttempts = new Map<string, LoginAttemptRecord>();

  // Tối đa 5 lần thử đăng nhập trong 15 phút
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 phút

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.extractClientIp(request);
    const now = Date.now();

    let record = this.ipAttempts.get(clientIp);
    if (!record) {
      record = { attempts: [] };
      this.ipAttempts.set(clientIp, record);
    }

    // Lọc bỏ các lần thử cũ hơn 15 phút
    record.attempts = record.attempts.filter(
      (time) => now - time < this.LOCKOUT_WINDOW_MS,
    );

    if (record.attempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      const oldestAttempt = record.attempts[0];
      const remainingSeconds = Math.ceil(
        (this.LOCKOUT_WINDOW_MS - (now - oldestAttempt)) / 1000,
      );

      this.logger.warn(
        `[BruteForce Block] IP: ${clientIp} đã thử đăng nhập sai ${record.attempts.length} lần. Tạm khóa trong ${remainingSeconds}s.`,
      );

      throw new HttpException(
        {
          success: false,
          code: 429,
          message: `Bạn đã thử đăng nhập quá nhiều lần. Để bảo mật tài khoản quản trị, vui lòng thử lại sau ${Math.ceil(remainingSeconds / 60)} phút.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Ghi nhận lần thử đăng nhập này
    record.attempts.push(now);

    // Dọn dẹp bộ nhớ nếu Map quá lớn (> 2000 IPs)
    if (this.ipAttempts.size > 2000) {
      this.cleanupOldEntries(now);
    }

    return true;
  }

  /**
   * Trích xuất Client IP chính xác qua Cloudflare Edge
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
    for (const [ip, record] of this.ipAttempts.entries()) {
      record.attempts = record.attempts.filter(
        (time) => now - time < this.LOCKOUT_WINDOW_MS,
      );
      if (record.attempts.length === 0) {
        this.ipAttempts.delete(ip);
      }
    }
  }
}
