import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IpGeoService {
  private cache = new Map<string, { location: string; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // Cache 24 giờ

  /**
   * Phân giải địa chỉ IP thành vị trí địa lý thực tế (Quận/Huyện, Tỉnh/Thành phố, Quốc gia)
   * Sử dụng kết hợp Headers của Cloudflare + Dịch vụ miễn phí ip-api.com & ipwho.is (Không cần API Key)
   */
  async resolveLocation(
    ip?: string,
    headers?: Record<string, any>,
  ): Promise<string> {
    if (!ip || ip === 'unknown') return 'Không xác định';

    const cleanIp = ip.replace(/^::ffff:/, '').trim();

    // 1. Kiểm tra IP nội bộ / Localhost
    if (this.isPrivateIp(cleanIp)) {
      return 'Localhost / Mạng nội bộ';
    }

    // 2. Ưu tiên kiểm tra Headers của Cloudflare nếu ứng dụng chạy qua Cloudflare CDN (0ms latency)
    if (headers) {
      const cfCity = headers['cf-ipcity'] as string;
      const cfRegion = headers['cf-region'] as string;
      const cfCountry = headers['cf-ipcountry'] as string;
      if (cfCity || cfRegion || cfCountry) {
        const parts = [cfCity, cfRegion, cfCountry].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    }

    // 3. Kiểm tra Cache bộ nhớ đệm
    const cached = this.cache.get(cleanIp);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.location;
    }

    // 4. Dịch vụ miễn phí 1: ip-api.com (Miễn phí, cực kỳ chuẩn xác cho các dải IP tại Việt Nam)
    try {
      const res = await axios.get(
        `http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,district`,
        { timeout: 2000 },
      );
      if (res.data?.status === 'success') {
        const { district, city, regionName, country } = res.data;
        const parts = [district, city || regionName, country].filter(
          (p) => p && typeof p === 'string' && p.trim().length > 0,
        );
        const location =
          parts.length > 0 ? parts.join(', ') : country || 'Không xác định';
        this.cache.set(cleanIp, {
          location,
          expiresAt: Date.now() + this.CACHE_TTL_MS,
        });
        return location;
      }
    } catch {
      // Fallback sang dịch vụ tiếp theo nếu timeout hoặc lỗi
    }

    // 5. Dịch vụ miễn phí 2 (Fallback): ipwho.is (Miễn phí, hỗ trợ HTTPS, không cần API Key)
    try {
      const res = await axios.get(`https://ipwho.is/${cleanIp}`, {
        timeout: 2000,
      });
      if (res.data?.success) {
        const { city, region, country } = res.data;
        const parts = [city, region, country].filter(
          (p) => p && typeof p === 'string' && p.trim().length > 0,
        );
        const location =
          parts.length > 0 ? parts.join(', ') : country || 'Không xác định';
        this.cache.set(cleanIp, {
          location,
          expiresAt: Date.now() + this.CACHE_TTL_MS,
        });
        return location;
      }
    } catch {
      // Bỏ qua lỗi
    }

    return 'Không xác định';
  }

  private isPrivateIp(ip: string): boolean {
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') return true;
    if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
    return false;
  }
}
