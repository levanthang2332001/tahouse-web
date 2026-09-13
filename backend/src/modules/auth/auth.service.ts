import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
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

  private async generateTokens(user: any) {
    const payload = {
      sub: user._id ? user._id.toString() : user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
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

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const identifier = loginDto.username.trim().toLowerCase();
    const user = await this.userModel
      .findOne({
        $or: [{ username: identifier }, { email: identifier }],
      })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (!user.password) {
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

    await this.refreshTokenModel.create({
      userId: new Types.ObjectId(user._id.toString()),
      hashedToken: this.hashToken(refreshToken),
      userAgent: userAgent || '',
      ipAddress: ipAddress || '',
      isRevoked: false,
      expiresAt,
    });

    await this.userModel.findByIdAndUpdate(user._id, {
      $set: { lastLoginAt: new Date() },
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
    const tokenRecord = await this.refreshTokenModel.findOne({
      hashedToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token has been revoked or expired');
    }

    const user = await this.userModel.findById(tokenRecord.userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    tokenRecord.isRevoked = true;
    await tokenRecord.save();

    const tokens = await this.generateTokens(user);

    await this.refreshTokenModel.create({
      userId: new Types.ObjectId(user._id.toString()),
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
      await this.refreshTokenModel.updateMany(
        { hashedToken },
        { $set: { isRevoked: true } },
      );
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), isRevoked: false },
      { $set: { isRevoked: true } },
    );
    return { message: 'All sessions have been revoked' };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email) {
      const email = updateProfileDto.email.trim().toLowerCase();
      const existingEmail = await this.userModel.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        throw new BadRequestException('Email is already in use by another account');
      }
      user.email = email;
    }

    if (updateProfileDto.fullName !== undefined) {
      user.fullName = updateProfileDto.fullName.trim();
    }

    if (updateProfileDto.avatarUrl !== undefined) {
      user.avatarUrl = updateProfileDto.avatarUrl.trim();
    }

    await user.save();

    return {
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      avatarUrl: user.avatarUrl || '',
      lastLoginAt: user.lastLoginAt,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .exec();

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
    user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);
    await user.save();

    await this.logoutAll(userId);

    return { message: 'Password changed successfully' };
  }
}
