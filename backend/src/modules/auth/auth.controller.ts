import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public, CurrentUser } from '@/common/decorators';
import { JwtAuthGuard } from '@/common/guards';

@ApiTags(SwaggerTag.AUTH)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post(ApiRoute.AUTH_LOGIN)
  @ApiOperation({
    summary: 'Đăng nhập tài khoản quản trị viên',
    description:
      'Xác thực username và password, trả về Access Token (15 phút) và Refresh Token (7 ngày).',
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Sai thông tin đăng nhập.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: Request,
  ) {
    const ip = req?.ip || req?.socket?.remoteAddress;
    return this.authService.login(loginDto, userAgent, ip);
  }

  @Public()
  @Post(ApiRoute.AUTH_REFRESH)
  @ApiOperation({
    summary: 'Làm mới Access Token bằng Refresh Token',
    description:
      'Gửi Refresh Token còn hạn để cấp phát cặp Access Token và Refresh Token mới (Refresh Token Rotation).',
  })
  @ApiResponse({
    status: 200,
    description: 'Làm mới token thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: Request,
  ) {
    const ip = req?.ip || req?.socket?.remoteAddress;
    return this.authService.refreshTokens(refreshTokenDto, userAgent, ip);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(ApiRoute.AUTH_ME)
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản hiện tại đang đăng nhập',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tài khoản.',
  })
  async getProfile(@CurrentUser() user: any) {
    return {
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || '',
      lastLoginAt: user.lastLoginAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(ApiRoute.AUTH_ME)
  @ApiOperation({
    summary: 'Cập nhật thông tin tài khoản cá nhân (Họ tên, Email, Ảnh đại diện)',
    description:
      'Cho phép người dùng cập nhật họ tên hiển thị, email và URL avatar (đã upload lên R2).',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin tài khoản thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Email đã được sử dụng bởi tài khoản khác.',
  })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(ApiRoute.AUTH_LOGOUT)
  @ApiOperation({
    summary: 'Đăng xuất tài khoản và thu hồi Refresh Token',
  })
  async logout(@Body() body?: { refreshToken?: string }) {
    return this.authService.logout(body?.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(ApiRoute.AUTH_LOGOUT_ALL)
  @ApiOperation({
    summary: 'Đăng xuất và thu hồi phiên trên tất cả thiết bị',
  })
  async logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logoutAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(ApiRoute.AUTH_CHANGE_PASSWORD)
  @ApiOperation({
    summary: 'Đổi mật khẩu tài khoản',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
