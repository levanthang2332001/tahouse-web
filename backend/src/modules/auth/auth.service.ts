import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/user.schema';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode } from '@/common/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(
        { sub: payload.sub, jti: crypto.randomUUID() },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn as any,
        },
      ),
    ]);

    const refreshExpiryMs = this.parseDuration(refreshExpiresIn);
    const expiresAt = new Date(Date.now() + refreshExpiryMs);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const identifier = loginDto.username.trim().toLowerCase();

    // Query user via UsersRepository
    const user = await this.usersRepository.findByEmail(identifier);

    if (!user || !user.password) {
      throw new BusinessException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Invalid username or password',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BusinessException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Invalid username or password',
      );
    }

    const { accessToken, refreshToken, expiresAt } =
      await this.generateTokens(user);

    await this.refreshTokensRepository.create({
      userId: user.id,
      hashedToken: this.hashToken(refreshToken),
      userAgent: userAgent || '',
      ipAddress: ipAddress || '',
      isRevoked: false,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const { refreshToken } = refreshTokenDto;
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new BusinessException(
        ErrorCode.AUTH_REFRESH_TOKEN_INVALID,
        'Invalid or expired refresh token',
      );
    }

    const hashedToken = this.hashToken(refreshToken);

    const tokenRecord =
      await this.refreshTokensRepository.findActiveByHashedToken(hashedToken);

    if (!tokenRecord || !tokenRecord.user) {
      throw new BusinessException(
        ErrorCode.AUTH_REFRESH_TOKEN_INVALID,
        'Refresh token has been revoked, expired or user not found',
      );
    }

    const user = tokenRecord.user;

    // Revoke old token
    await this.refreshTokensRepository.revokeById(tokenRecord.id);

    const tokens = await this.generateTokens(user);

    await this.refreshTokensRepository.create({
      userId: user.id,
      hashedToken: this.hashToken(tokens.refreshToken),
      userAgent: userAgent || tokenRecord.userAgent,
      ipAddress: ipAddress || tokenRecord.ipAddress,
      isRevoked: false,
      expiresAt: tokens.expiresAt,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      const hashedToken = this.hashToken(refreshToken);
      await this.refreshTokensRepository.revokeByHashedToken(hashedToken);
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokensRepository.revokeAllByUserId(userId);
    return { message: 'All sessions have been revoked' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new BusinessException(
        ErrorCode.AUTH_USER_NOT_FOUND,
        'User not found',
      );
    }

    const updates: Partial<User> = {
      updatedAt: new Date(),
    };

    if (updateProfileDto.email) {
      const email = updateProfileDto.email.trim().toLowerCase();
      const existingEmail = await this.usersRepository.findOtherUserByEmail(
        email,
        user.id,
      );

      if (existingEmail) {
        throw new BusinessException(
          ErrorCode.AUTH_EMAIL_EXISTS,
          'Email is already in use by another account',
          'email',
          { email },
        );
      }
      updates.email = email;
    }

    if (updateProfileDto.fullName !== undefined) {
      updates.name = updateProfileDto.fullName.trim();
    }

    if (updateProfileDto.avatarUrl !== undefined) {
      updates.avatar = updateProfileDto.avatarUrl.trim();
    }

    await this.usersRepository.update(userId, updates);

    return {
      username: updates.email || user.email,
      email: updates.email || user.email,
      fullName: updates.name || user.name || '',
      avatarUrl: updates.avatar || user.avatar || '',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new BusinessException(
        ErrorCode.AUTH_USER_NOT_FOUND,
        'User not found',
      );
    }

    if (!user.password) {
      throw new BusinessException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Password is not set for this account',
      );
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BusinessException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Current password is incorrect',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      salt,
    );

    await this.usersRepository.update(userId, {
      password: newHashedPassword,
      updatedAt: new Date(),
    });

    await this.logoutAll(userId);

    return { message: 'Password changed successfully' };
  }
}
