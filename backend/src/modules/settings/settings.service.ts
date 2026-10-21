import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SettingsRepository } from './repositories/settings.repository';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  /**
   * Lấy cấu hình công khai của cửa hàng
   */
  async getSettings(): Promise<StoreSettingsResponseDto> {
    return this.settingsRepository.getSettings();
  }

  /**
   * Cập nhật cấu hình cửa hàng bởi Quản trị viên
   */
  async updateSettings(
    dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettingsResponseDto> {
    // Tự động gán ID cho từng phần tử nếu chưa có để dễ quản lý ở Frontend
    if (Array.isArray(dto.phoneNumbers)) {
      dto.phoneNumbers = dto.phoneNumbers.map((p, idx) => ({
        ...p,
        id: p.id || `phone-${idx + 1}-${randomUUID().slice(0, 8)}`,
      }));
    }

    if (Array.isArray(dto.emails)) {
      dto.emails = dto.emails.map((e, idx) => ({
        ...e,
        id: e.id || `email-${idx + 1}-${randomUUID().slice(0, 8)}`,
      }));
    }

    if (Array.isArray(dto.addresses)) {
      dto.addresses = dto.addresses.map((a, idx) => ({
        ...a,
        id: a.id || `addr-${idx + 1}-${randomUUID().slice(0, 8)}`,
      }));
    }

    return this.settingsRepository.updateSettings(dto);
  }
}
