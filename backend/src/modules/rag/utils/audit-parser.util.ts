import type { Request } from 'express';

export interface IAuditInfo {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  origin: string;
  referer: string;
}

export function parseAuditInfo(req?: Request, userAgentHeader?: string): IAuditInfo {
  const ua = (userAgentHeader || req?.headers?.['user-agent'] || '').trim();

  // 1. Trích xuất địa chỉ IP chính xác (Ưu tiên headers của Cloudflare và Reverse Proxy)
  const rawIp =
    (req?.headers?.['cf-connecting-ip'] as string) ||
    ((req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim()) ||
    (req?.headers?.['x-real-ip'] as string) ||
    req?.ip ||
    req?.socket?.remoteAddress ||
    '127.0.0.1';

  const ipAddress = rawIp.replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1');

  // 2. Trích xuất Origin và Referer (URL trang người dùng đứng khi nhắn tin)
  const origin = ((req?.headers?.['origin'] as string) || '').trim();
  const referer = ((req?.headers?.['referer'] as string) || '').trim();

  // 3. Phân tích Trình duyệt (Browser)
  let browser = 'Unknown Browser';
  if (/Zalo/i.test(ua)) {
    browser = 'Zalo App In-App Browser';
  } else if (/FBAN|FBAV/i.test(ua)) {
    browser = 'Facebook In-App Browser';
  } else if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/OPR\/|Opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = 'Internet Explorer';
  }

  // 4. Phân tích Hệ điều hành (OS)
  let os = 'Unknown OS';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'Chrome OS';

  // 5. Phân tích Thiết bị (Device)
  let device = 'Desktop';
  if (/tablet|ipad/i.test(ua)) {
    device = 'Tablet';
  } else if (/mobile|iphone|android/i.test(ua)) {
    device = 'Mobile';
  }

  return {
    ipAddress,
    userAgent: ua,
    browser,
    os,
    device,
    origin,
    referer,
  };
}
