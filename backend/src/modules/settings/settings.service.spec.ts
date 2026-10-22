import { SettingsService } from './settings.service';
import { SettingsRepository } from './repositories/settings.repository';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

describe('SettingsService', () => {
  let service: SettingsService;

  const mockSettingsDto: StoreSettingsResponseDto = {
    id: 'default',
    storeName: 'TA HOUSE',
    slogan: 'Giải pháp khóa thông minh',
    socialLinks: {
      zalo: 'https://zalo.me/0938824479',
      facebook: 'https://facebook.com/tahouse.vn',
      youtube: 'https://youtube.com/@tahouse',
      instagram: 'https://instagram.com/tahouse',
      tiktok: 'https://tiktok.com/@tahouse',
    },
    phoneNumbers: [
      {
        id: 'p-1',
        number: '1900 8899',
        label: 'Hotline 24/7',
        isHotline: true,
      },
      {
        id: 'p-2',
        number: '0938 824 479',
        label: 'Kỹ thuật',
        isHotline: false,
      },
    ],
    emails: [
      {
        id: 'e-1',
        email: 'info@takit.vn',
        label: 'Email chính',
        isPrimary: true,
      },
    ],
    addresses: [
      {
        id: 'a-1',
        branchName: 'Showroom Thủ Đức',
        address: '961A Kha Vạn Cân, TP. Thủ Đức',
        mapUrl: 'https://maps.google.com',
        isMain: true,
      },
    ],
    openingHours: {
      text: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)',
      weekdays: '08:00 - 21:00',
      weekend: '08:00 - 21:30',
      note: 'Mở cửa suốt tuần',
    },
    primaryPhone: '1900 8899',
    primaryEmail: 'info@takit.vn',
    mainAddress: '961A Kha Vạn Cân, TP. Thủ Đức',
    updatedAt: new Date(),
  };

  const mockSettingsRepository = {
    getSettings: jest.fn().mockResolvedValue(mockSettingsDto),
    updateSettings: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        ...mockSettingsDto,
        ...dto,
      }),
    ),
  };

  beforeEach(() => {
    service = new SettingsService(
      mockSettingsRepository as unknown as SettingsRepository,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get store settings', async () => {
    const result = await service.getSettings();
    expect(result).toEqual(mockSettingsDto);
    expect(mockSettingsRepository.getSettings).toHaveBeenCalledTimes(1);
  });

  it('should update store settings and generate item IDs if missing', async () => {
    const updateDto: UpdateStoreSettingsDto = {
      storeName: 'TA HOUSE OFFICIAL',
      phoneNumbers: [
        {
          number: '0911 222 333',
          label: 'Hotline Mới',
          isHotline: true,
        },
      ],
      emails: [
        {
          email: 'new@tahouse.vn',
          label: 'Email Mới',
          isPrimary: true,
        },
      ],
      addresses: [
        {
          branchName: 'Chi nhánh Quận 1',
          address: '123 Lê Lợi, Q1, TP. HCM',
          isMain: true,
        },
      ],
    };

    await service.updateSettings(updateDto);

    expect(mockSettingsRepository.updateSettings).toHaveBeenCalledTimes(1);
    const passedDto = mockSettingsRepository.updateSettings.mock.calls[0][0];
    expect(passedDto.phoneNumbers[0].id).toBeDefined();
    expect(passedDto.emails[0].id).toBeDefined();
    expect(passedDto.addresses[0].id).toBeDefined();
    expect(passedDto.storeName).toBe('TA HOUSE OFFICIAL');
  });
});
