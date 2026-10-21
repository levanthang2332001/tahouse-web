import { ApiProperty } from '@nestjs/swagger';
import type {
  ISocialLinks,
  IStorePhoneNumber,
  IStoreEmail,
  IStoreAddress,
  IOpeningHours,
  StoreSettings,
} from '../schemas/settings.schema';

export const DEFAULT_STORE_SETTINGS = {
  id: 'default',
  storeName: 'TA HOUSE',
  slogan: 'Giải pháp khóa thông minh & phụ kiện nội thất cho không gian sống của bạn',
  socialLinks: {
    zalo: 'https://zalo.me/0938824479',
    facebook: 'https://facebook.com/tahouse.vn',
    youtube: 'https://youtube.com/@tahouse',
    instagram: 'https://instagram.com/tahouse',
    tiktok: 'https://tiktok.com/@tahouse',
  },
  phoneNumbers: [
    {
      id: 'phone-hotline',
      number: '1900 8899',
      label: 'Tổng đài Hotline toàn quốc',
      isHotline: true,
    },
    {
      id: 'phone-technical',
      number: '0938 824 479',
      label: 'Hỗ trợ kỹ thuật & Khảo sát lắp đặt',
      isHotline: false,
    },
  ],
  emails: [
    {
      id: 'email-primary',
      email: 'info@takit.vn',
      label: 'Email hỗ trợ kỹ thuật & dịch vụ',
      isPrimary: true,
    },
    {
      id: 'email-contact',
      email: 'info@tahouse.vn',
      label: 'Email tư vấn bán hàng & dự án',
      isPrimary: false,
    },
  ],
  addresses: [
    {
      id: 'addr-main',
      branchName: 'Showroom Thủ Đức (Trụ sở chính)',
      address: '961A Kha Vạn Cân, P. Linh Xuân, TP. Thủ Đức, TP. HCM',
      mapUrl: 'https://maps.google.com/?q=961A+Kha+V%E1%BA%A1n+C%C3%A2n',
      isMain: true,
    },
  ],
  openingHours: {
    text: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    weekdays: '08:00 - 21:00',
    weekend: '08:00 - 21:30',
    note: 'Phục vụ tư vấn và khảo sát trực tiếp tất cả các ngày trong tuần',
  },
  metadata: {},
};

export class SocialLinksResponseDto implements ISocialLinks {
  @ApiProperty({ example: 'https://zalo.me/0938824479' })
  zalo?: string;

  @ApiProperty({ example: 'https://facebook.com/tahouse.vn' })
  facebook?: string;

  @ApiProperty({ example: 'https://youtube.com/@tahouse' })
  youtube?: string;

  @ApiProperty({ example: 'https://instagram.com/tahouse' })
  instagram?: string;

  @ApiProperty({ example: 'https://tiktok.com/@tahouse' })
  tiktok?: string;
}

export class OpeningHoursResponseDto implements IOpeningHours {
  @ApiProperty({ example: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)' })
  text: string;

  @ApiProperty({ example: '08:00 - 21:00' })
  weekdays?: string;

  @ApiProperty({ example: '08:00 - 21:30' })
  weekend?: string;

  @ApiProperty({ example: 'Phục vụ tư vấn và khảo sát trực tiếp tất cả các ngày trong tuần' })
  note?: string;
}

export class StoreSettingsResponseDto {
  @ApiProperty({ example: 'default' })
  id: string;

  @ApiProperty({ example: 'TA HOUSE' })
  storeName: string;

  @ApiProperty({ example: 'Giải pháp khóa thông minh & phụ kiện nội thất' })
  slogan: string;

  @ApiProperty({ type: SocialLinksResponseDto })
  socialLinks: SocialLinksResponseDto;

  @ApiProperty({ type: [Object] })
  phoneNumbers: IStorePhoneNumber[];

  @ApiProperty({ type: [Object] })
  emails: IStoreEmail[];

  @ApiProperty({ type: [Object] })
  addresses: IStoreAddress[];

  @ApiProperty({ type: OpeningHoursResponseDto })
  openingHours: OpeningHoursResponseDto;

  @ApiProperty({ example: '1900 8899' })
  primaryPhone: string;

  @ApiProperty({ example: 'info@takit.vn' })
  primaryEmail: string;

  @ApiProperty({ example: '961A Kha Vạn Cân, P. Linh Xuân, TP. Thủ Đức, TP. HCM' })
  mainAddress: string;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity?: Partial<StoreSettings> | null): StoreSettingsResponseDto {
    const fallback = DEFAULT_STORE_SETTINGS;
    const phoneNumbers =
      Array.isArray(entity?.phoneNumbers) && entity.phoneNumbers.length > 0
        ? entity.phoneNumbers
        : fallback.phoneNumbers;

    const emails =
      Array.isArray(entity?.emails) && entity.emails.length > 0
        ? entity.emails
        : fallback.emails;

    const addresses =
      Array.isArray(entity?.addresses) && entity.addresses.length > 0
        ? entity.addresses
        : fallback.addresses;

    const socialLinks: SocialLinksResponseDto = {
      ...fallback.socialLinks,
      ...(entity?.socialLinks || {}),
    };

    const openingHours: OpeningHoursResponseDto = {
      ...fallback.openingHours,
      ...(entity?.openingHours || {}),
    };

    const primaryPhone =
      phoneNumbers.find((p) => p.isHotline)?.number ||
      phoneNumbers[0]?.number ||
      fallback.phoneNumbers[0].number;

    const primaryEmail =
      emails.find((e) => e.isPrimary)?.email ||
      emails[0]?.email ||
      fallback.emails[0].email;

    const mainAddress =
      addresses.find((a) => a.isMain)?.address ||
      addresses[0]?.address ||
      fallback.addresses[0].address;

    const dto = new StoreSettingsResponseDto();
    dto.id = entity?.id || fallback.id;
    dto.storeName = entity?.storeName || fallback.storeName;
    dto.slogan = entity?.slogan || fallback.slogan;
    dto.socialLinks = socialLinks;
    dto.phoneNumbers = phoneNumbers;
    dto.emails = emails;
    dto.addresses = addresses;
    dto.openingHours = openingHours;
    dto.primaryPhone = primaryPhone;
    dto.primaryEmail = primaryEmail;
    dto.mainAddress = mainAddress;
    dto.updatedAt = entity?.updatedAt ? new Date(entity.updatedAt) : new Date();

    return dto;
  }
}
