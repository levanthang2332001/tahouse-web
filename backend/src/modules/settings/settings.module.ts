import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './repositories/settings.repository';

@Module({
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
