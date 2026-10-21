jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));

import { AdminSettingsController } from './admin-settings.controller';
import { SettingsService } from './settings.service';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

describe('AdminSettingsController', () => {
  let controller: AdminSettingsController;

  const mockSettingsDto: StoreSettingsResponseDto = {
    id: 'default',
    storeName: 'TA HOUSE',
    slogan: 'Giải pháp khóa thông minh',
    socialLinks: { zalo: 'https://zalo.me/0938824479', facebook: 'https://facebook.com/tahouse' },
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
    updateSettings: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        ...mockSettingsDto,
        ...dto,
      }),
    ),
  };

  beforeEach(() => {
    controller = new AdminSettingsController(
      mockSettingsService as unknown as SettingsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get settings on GET /admin/settings', async () => {
    const res = await controller.getSettings();
    expect(res).toEqual(mockSettingsDto);
    expect(mockSettingsService.getSettings).toHaveBeenCalledTimes(1);
  });

  it('should update settings on PUT /admin/settings', async () => {
    const updateDto: UpdateStoreSettingsDto = {
      storeName: 'TA HOUSE UPDATED',
      socialLinks: {
        zalo: 'https://zalo.me/0999888777',
      },
    };

    const res = await controller.updateSettings(updateDto);
    expect(res.storeName).toBe('TA HOUSE UPDATED');
    expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(updateDto);
  });

  it('should patch settings on PATCH /admin/settings', async () => {
    const patchDto: UpdateStoreSettingsDto = {
      storeName: 'TA HOUSE PATCHED',
    };

    const res = await controller.patchSettings(patchDto);
    expect(res.storeName).toBe('TA HOUSE PATCHED');
    expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(patchDto);
  });
});
