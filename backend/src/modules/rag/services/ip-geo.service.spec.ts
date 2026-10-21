import { IpGeoService } from './ip-geo.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IpGeoService', () => {
  let service: IpGeoService;

  beforeEach(() => {
    service = new IpGeoService();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return Localhost / Mạng nội bộ for 127.0.0.1 and private IPs', async () => {
    const loc1 = await service.resolveLocation('127.0.0.1');
    expect(loc1).toBe('Localhost / Mạng nội bộ');

    const loc2 = await service.resolveLocation('192.168.1.100');
    expect(loc2).toBe('Localhost / Mạng nội bộ');

    const loc3 = await service.resolveLocation('10.0.0.5');
    expect(loc3).toBe('Localhost / Mạng nội bộ');

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should extract location from Cloudflare headers if present', async () => {
    const headers = {
      'cf-ipcity': 'Thủ Đức',
      'cf-region': 'Thành phố Hồ Chí Minh',
      'cf-ipcountry': 'VN',
    };

    const loc = await service.resolveLocation('14.241.12.34', headers);
    expect(loc).toBe('Thủ Đức, Thành phố Hồ Chí Minh, VN');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should resolve location using free ip-api.com service', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        district: 'Quận 1',
        city: 'Ho Chi Minh City',
        regionName: 'Ho Chi Minh',
        country: 'Vietnam',
      },
    });

    const loc = await service.resolveLocation('14.241.12.34');
    expect(loc).toBe('Quận 1, Ho Chi Minh City, Vietnam');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('http://ip-api.com/json/14.241.12.34'),
      expect.anything(),
    );

    // Second call for same IP should hit memory cache without calling axios
    const locCached = await service.resolveLocation('14.241.12.34');
    expect(locCached).toBe('Quận 1, Ho Chi Minh City, Vietnam');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should fallback to ipwho.is if ip-api.com fails', async () => {
    mockedAxios.get
      .mockRejectedValueOnce(new Error('ip-api timeout'))
      .mockResolvedValueOnce({
        data: {
          success: true,
          city: 'Hà Nội',
          region: 'Ha Noi',
          country: 'Vietnam',
        },
      });

    const loc = await service.resolveLocation('113.190.1.2');
    expect(loc).toBe('Hà Nội, Ha Noi, Vietnam');
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});
