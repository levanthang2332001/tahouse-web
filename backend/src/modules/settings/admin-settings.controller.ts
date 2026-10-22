import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { JwtAuthGuard } from '@/common/guards';
import { SettingsService } from './settings.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsResponseDto } from './dto/store-settings-response.dto';

@ApiTags(SwaggerTag.ADMIN_SETTINGS)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(ApiRoute.ADMIN_SETTINGS)
  @ApiOperation({
    summary: 'Lấy toàn bộ thông tin cấu hình cửa hàng để chỉnh sửa (Admin)',
    description:
      'Yêu cầu Bearer Token của Admin. Trả về thông tin social (Zalo, Facebook...), nhiều số điện thoại, email, địa chỉ, giờ mở cửa để điền vào form quản trị.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy cấu hình thành công.',
    type: StoreSettingsResponseDto,
  })
  async getSettings(): Promise<StoreSettingsResponseDto> {
    return this.settingsService.getSettings();
  }

  @Put(ApiRoute.ADMIN_SETTINGS)
  @ApiOperation({
    summary: 'Cập nhật toàn bộ thông tin cấu hình cửa hàng (Admin)',
    description:
      'Admin cấu hình social (Zalo, Facebook, YouTube...), nhiều số điện thoại/hotline, danh sách email, địa chỉ showroom và giờ mở cửa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin cấu hình cửa hàng thành công.',
    type: StoreSettingsResponseDto,
  })
  async updateSettings(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettingsResponseDto> {
    return this.settingsService.updateSettings(dto);
  }

  @Patch(ApiRoute.ADMIN_SETTINGS)
  @ApiOperation({
    summary: 'Cập nhật từng phần thông tin cấu hình cửa hàng (Admin)',
    description:
      'Cho phép cập nhật lẻ một vài trường (ví dụ chỉ đổi link Zalo, hoặc chỉ thêm số điện thoại hotline).',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật từng phần cấu hình cửa hàng thành công.',
    type: StoreSettingsResponseDto,
  })
  async patchSettings(
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettingsResponseDto> {
    return this.settingsService.updateSettings(dto);
  }
}
