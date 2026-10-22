import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';

describe('SettingsController', () => {
  let controller: SettingsController;

  const mockSettingsDto: StoreSettingsResponseDto = {
    id: 'default',
    storeName: 'TA HOUSE',
    slogan: 'Giải pháp khóa thông minh',
    socialLinks: { zalo: 'https://zalo.me/0938824479' },
    phoneNumbers: [{ id: '1', number: '1900 8899', label: 'Hotline', isHotline: true }],
    emails: [{ id: '1', email: 'info@takit.vn', label: 'Email', isPrimary: true }],
    addresses: [{ id: '1', branchName: 'Showroom', address: '961A Kha Vạn Cân', isMain: true }],
    openingHours: { text: '08:00 - 21:00' },
    primaryPhone: '1900 8899',
    primaryEmail: 'info@takit.vn',
    mainAddress: '961A Kha Vạn Cân',
    updatedAt: new Date(),
  };

  const mockSettingsService = {
    getSettings: jest.fn().mockResolvedValue(mockSettingsDto),
  };

  beforeEach(() => {
    controller = new SettingsController(
      mockSettingsService as unknown as SettingsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return store settings on GET /settings', async () => {
    const res = await controller.getSettings();
    expect(res).toEqual(mockSettingsDto);
    expect(mockSettingsService.getSettings).toHaveBeenCalledTimes(1);
  });
});
