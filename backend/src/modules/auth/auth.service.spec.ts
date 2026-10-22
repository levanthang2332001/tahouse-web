jest.mock('@nestjs/jwt');
jest.mock('bcryptjs');

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '@/common/exceptions';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'admin@tahouse.vn',
    name: 'Admin User',
    password: 'hashed-password',
    role: 'ADMIN' as const,
    avatar: 'https://cdn.tahouse.vn/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersRepository = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn().mockResolvedValue(mockUser),
      findOtherUserByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UsersRepository>;

    refreshTokensRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findActiveByHashedToken: jest.fn().mockResolvedValue({
        id: 'token-1',
        userId: 'user-uuid-1',
        hashedToken: 'hash123',
        userAgent: 'Chrome',
        ipAddress: '127.0.0.1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
        user: mockUser,
      }),
      revokeById: jest.fn().mockResolvedValue(undefined),
      revokeByHashedToken: jest.fn().mockResolvedValue(undefined),
      revokeAllByUserId: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RefreshTokensRepository>;

    jwtService = {
      signAsync: jest.fn().mockImplementation((payload) => {
        if (payload.jti) return Promise.resolve('mock-refresh-token');
        return Promise.resolve('mock-access-token');
      }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-uuid-1' }),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return 'test-secret';
      }),
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
        {
          provide: RefreshTokensRepository,
          useValue: refreshTokensRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw BusinessException if user does not exist', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          username: 'unknown@tahouse.vn',
          password: 'password123',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          username: 'admin@tahouse.vn',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should authenticate and return tokens on valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(
        { username: 'admin@tahouse.vn', password: 'correctpassword' },
        'Mozilla/5.0',
        '192.168.1.1',
      );

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(refreshTokensRepository.create).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should throw BusinessException if JWT verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.refreshTokens({ refreshToken: 'expired-or-invalid' }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if token record is revoked or not found', async () => {
      refreshTokensRepository.findActiveByHashedToken.mockResolvedValue(null);

      await expect(
        service.refreshTokens({ refreshToken: 'revoked-token' }),
      ).rejects.toThrow(BusinessException);
    });

    it('should issue new tokens and revoke old token on valid refresh', async () => {
      const result = await service.refreshTokens({
        refreshToken: 'valid-token',
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(refreshTokensRepository.revokeById).toHaveBeenCalledWith(
        'token-1',
      );
      expect(refreshTokensRepository.create).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke token by hash if refresh token is provided', async () => {
      const result = await service.logout('some-token');

      expect(refreshTokensRepository.revokeByHashedToken).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should return success message if no token is provided', async () => {
      const result = await service.logout();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('logoutAll', () => {
    it('should revoke all tokens for given user id', async () => {
      const result = await service.logoutAll('user-uuid-1');

      expect(refreshTokensRepository.revokeAllByUserId).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(result).toEqual({ message: 'All sessions have been revoked' });
    });
  });

  describe('updateProfile', () => {
    it('should throw BusinessException if user does not exist', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', { fullName: 'New Name' }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if new email is already in use', async () => {
      usersRepository.findOtherUserByEmail.mockResolvedValue({
        id: 'other-user',
        email: 'other@tahouse.vn',
      } as any);

      await expect(
        service.updateProfile('user-uuid-1', { email: 'other@tahouse.vn' }),
      ).rejects.toThrow(BusinessException);
    });

    it('should update user profile fields and return updated values', async () => {
      const result = await service.updateProfile('user-uuid-1', {
        fullName: 'Updated Name',
        avatarUrl: 'https://cdn.tahouse.vn/new.png',
      });

      expect(usersRepository.update).toHaveBeenCalledWith('user-uuid-1', {
        name: 'Updated Name',
        avatar: 'https://cdn.tahouse.vn/new.png',
        updatedAt: expect.any(Date),
      });
      expect(result.fullName).toBe('Updated Name');
      expect(result.avatarUrl).toBe('https://cdn.tahouse.vn/new.png');
    });
  });

  describe('changePassword', () => {
    it('should throw BusinessException if user not found', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('user-uuid-1', {
          oldPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should throw BusinessException if old password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-uuid-1', {
          oldPassword: 'wrong-old-password',
          newPassword: 'new-password-123',
        }),
      ).rejects.toThrow(BusinessException);
    });

    it('should update password and revoke all sessions on success', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.changePassword('user-uuid-1', {
        oldPassword: 'correct-old-password',
        newPassword: 'new-password-123',
      });

      expect(usersRepository.update).toHaveBeenCalledWith('user-uuid-1', {
        password: 'new-hashed-password',
        updatedAt: expect.any(Date),
      });
      expect(refreshTokensRepository.revokeAllByUserId).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(result).toEqual({ message: 'Password changed successfully' });
    });
  });

  describe('bcryptjs parity check', () => {
    it('should verify standard bcrypt $2a$ and $2b$ hashes correctly without native binary', async () => {
      const realBcrypt =
        jest.requireActual<typeof import('bcryptjs')>('bcryptjs');
      const password = 'TestSecurePassword#123';
      const hash = await realBcrypt.hash(password, 10);

      const isValid = await realBcrypt.compare(password, hash);
      expect(isValid).toBe(true);

      // Kiểm tra tương thích chuẩn $2a$ và $2b$
      const hash2a = hash.replace(/^\$2[by]\$/, '$2a$');
      const is2aValid = await realBcrypt.compare(password, hash2a);
      expect(is2aValid).toBe(true);

      const isWrongValid = await realBcrypt.compare('wrongpassword', hash);
      expect(isWrongValid).toBe(false);
    });
  });
});
