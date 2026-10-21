import { Test, TestingModule } from '@nestjs/testing';
import { SettingsRepository } from './settings.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { StoreSettings } from '../schemas/settings.schema';

describe('SettingsRepository', () => {
  let repository: SettingsRepository;
  let mockDb: any;

  const mockSettingsRow: StoreSettings = {
    id: 'default',
    storeName: 'TA HOUSE TEST',
    slogan: 'Khóa thông minh test',
    socialLinks: {
      zalo: 'https://zalo.me/0938824479',
      facebook: 'https://facebook.com/tahouse.vn',
      youtube: 'https://youtube.com/@tahouse',
      instagram: 'https://instagram.com/tahouse',
      tiktok: 'https://tiktok.com/@tahouse',
    },
    phoneNumbers: [
      { id: 'p1', number: '1900 8899', label: 'Hotline', isHotline: true },
      { id: 'p2', number: '0938 824 479', label: 'CSKH', isHotline: false },
    ],
    emails: [{ id: 'e1', email: 'test@tahouse.vn', label: 'Email', isPrimary: true }],
    addresses: [
      {
        id: 'a1',
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
      note: 'Mở cửa cả tuần',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        storeSettings: {
          findFirst: jest.fn().mockResolvedValue(mockSettingsRow),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsRepository,
        {
          provide: D1_DATABASE,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<SettingsRepository>(SettingsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return existing settings when row exists', async () => {
    const result = await repository.getSettings();
    expect(result.storeName).toBe('TA HOUSE TEST');
    expect(result.primaryPhone).toBe('1900 8899');
    expect(result.primaryEmail).toBe('test@tahouse.vn');
    expect(result.phoneNumbers.length).toBe(2);
    expect(mockDb.query.storeSettings.findFirst).toHaveBeenCalled();
  });

  it('should insert and return default settings when row does not exist', async () => {
    mockDb.query.storeSettings.findFirst.mockResolvedValueOnce(null);

    const result = await repository.getSettings();
    expect(result.storeName).toBe('TA HOUSE');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should update existing settings in database', async () => {
    const updateDto = {
      storeName: 'TA HOUSE VIP',
      phoneNumbers: [
        { id: 'p1', number: '0988 888 888', label: 'VIP Hotline', isHotline: true },
      ],
    };

    mockDb.query.storeSettings.findFirst
      .mockResolvedValueOnce(mockSettingsRow) // check existing
      .mockResolvedValueOnce({ ...mockSettingsRow, ...updateDto }); // fetch updated

    const result = await repository.updateSettings(updateDto);
    expect(mockDb.update).toHaveBeenCalled();
    expect(result.storeName).toBe('TA HOUSE VIP');
  });
});
