import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and, ne } from 'drizzle-orm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { D1_DATABASE } from '@/database';
import type { D1Database } from '@/database';
import { users, User } from './schemas/user.schema';
import { refreshTokens } from './schemas/refresh-token.schema';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(D1_DATABASE)
    private readonly db: D1Database,
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

    // Query user by email using Drizzle query API
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, identifier),
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { accessToken, refreshToken, expiresAt } =
      await this.generateTokens(user);

    await this.db.insert(refreshTokens).values({
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const hashedToken = this.hashToken(refreshToken);

    const tokenRecord = await this.db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.hashedToken, hashedToken),
        eq(refreshTokens.isRevoked, false),
      ),
      with: {
        user: true,
      },
    });

    if (!tokenRecord || !tokenRecord.user) {
      throw new UnauthorizedException(
        'Refresh token has been revoked, expired or user not found',
      );
    }

    const user = tokenRecord.user;

    // Revoke old token
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, tokenRecord.id));

    const tokens = await this.generateTokens(user);

    await this.db.insert(refreshTokens).values({
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
      await this.db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.hashedToken, hashedToken));
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
        ),
      );
    return { message: 'All sessions have been revoked' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updates: Partial<User> = {
      updatedAt: new Date(),
    };

    if (updateProfileDto.email) {
      const email = updateProfileDto.email.trim().toLowerCase();
      const existingEmail = await this.db.query.users.findFirst({
        where: and(eq(users.email, email), ne(users.id, user.id)),
      });

      if (existingEmail) {
        throw new BadRequestException(
          'Email is already in use by another account',
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

    await this.db.update(users).set(updates).where(eq(users.id, userId));

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
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Password is not set for this account');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      salt,
    );

    await this.db
      .update(users)
      .set({ password: newHashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.logoutAll(userId);

    return { message: 'Password changed successfully' };
  }
}
