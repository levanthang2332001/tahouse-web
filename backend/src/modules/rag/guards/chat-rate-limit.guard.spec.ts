import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ChatRateLimitGuard } from './chat-rate-limit.guard';

describe('ChatRateLimitGuard', () => {
  let guard: ChatRateLimitGuard;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    guard = new ChatRateLimitGuard();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createMockContext(ip: string, headers: Record<string, string> = {}): ExecutionContext {
    const req = {
      ip,
      headers: {
        'user-agent': 'Mozilla/5.0 Chrome/120.0',
        ...headers,
      },
      socket: { remoteAddress: ip },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;
  }

  it('nên cho phép request đầu tiên thành công', () => {
    const ctx = createMockContext('1.2.3.4');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('nên cho phép tối đa 15 request trong vòng 1 phút', () => {
    const ctx = createMockContext('1.2.3.4');

    for (let i = 0; i < 15; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }

    // Request thứ 16 trong 1 phút phải bị ném 429 TOO_MANY_REQUESTS
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
    try {
      guard.canActivate(ctx);
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.getResponse().code).toBe(429);
      expect(err.getResponse().message).toContain('Bạn đang gửi câu hỏi hơi nhanh');
    }
  });

  it('hai IP khác nhau không làm ảnh hưởng giới hạn của nhau', () => {
    const ctxIp1 = createMockContext('10.0.0.1');
    const ctxIp2 = createMockContext('10.0.0.2');

    // Dùng hết 15 lượt của IP 1
    for (let i = 0; i < 15; i++) {
      expect(guard.canActivate(ctxIp1)).toBe(true);
    }
    // IP 1 bị chặn
    expect(() => guard.canActivate(ctxIp1)).toThrow(HttpException);

    // IP 2 vẫn được gửi bình thường
    expect(guard.canActivate(ctxIp2)).toBe(true);
  });

  it('ưu tiên lấy IP từ Cloudflare header cf-connecting-ip', () => {
    const ctx = createMockContext('127.0.0.1', {
      'cf-connecting-ip': '203.113.152.1',
    });

    for (let i = 0; i < 15; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }

    // Vượt ngưỡng với Cloudflare IP
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('hỗ trợ cấu hình tùy chỉnh qua biến môi trường CHAT_RATE_LIMIT_PER_MINUTE', () => {
    process.env.CHAT_RATE_LIMIT_PER_MINUTE = '2';
    const customGuard = new ChatRateLimitGuard();
    const ctx = createMockContext('192.168.1.100');

    expect(customGuard.canActivate(ctx)).toBe(true);
    expect(customGuard.canActivate(ctx)).toBe(true);

    // Request thứ 3 phải bị chặn vì limit = 2
    expect(() => customGuard.canActivate(ctx)).toThrow(HttpException);
  });
});
