import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { Public } from '@/common/decorators';
import { SettingsService } from './settings.service';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';

@ApiTags(SwaggerTag.SETTINGS)
@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get(ApiRoute.SETTINGS)
  @ApiOperation({
    summary:
      'Lấy cấu hình thông tin cửa hàng, mạng xã hội, hotline, địa chỉ (Công khai)',
    description:
      'API trả về thông tin liên hệ chính thức của cửa hàng: Zalo, Facebook, nhiều số điện thoại/hotline, danh sách email, địa chỉ showroom và giờ mở cửa để hiển thị trên website.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy cấu hình cửa hàng thành công.',
    type: StoreSettingsResponseDto,
  })
  async getSettings(): Promise<StoreSettingsResponseDto> {
    return this.settingsService.getSettings();
  }
}
