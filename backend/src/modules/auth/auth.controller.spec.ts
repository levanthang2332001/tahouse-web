jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'user-1',
      username: 'admin',
      email: 'admin@tahouse.vn',
      fullName: 'Admin User',
      avatarUrl: '',
    },
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue(mockTokens),
      refreshTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
      updateProfile: jest.fn().mockResolvedValue({
        id: 'user-1',
        fullName: 'Updated Name',
        email: 'updated@tahouse.vn',
      }),
      logout: jest
        .fn()
        .mockResolvedValue({ success: true, message: 'Logged out' }),
      logoutAll: jest.fn().mockResolvedValue({
        success: true,
        message: 'All sessions logged out',
      }),
      changePassword: jest
        .fn()
        .mockResolvedValue({ success: true, message: 'Password changed' }),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should authenticate user and return accessToken + refreshToken', async () => {
      const dto = { username: 'admin', password: 'password123' };
      const result = await controller.login(dto, 'Mozilla/5.0');

      expect(authService.login).toHaveBeenCalledWith(
        dto,
        'Mozilla/5.0',
        undefined,
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refresh', () => {
    it('should rotate tokens given a valid refresh token', async () => {
      const dto = { refreshToken: 'valid-refresh-token' };
      const result = await controller.refresh(dto, 'Mozilla/5.0');

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        dto,
        'Mozilla/5.0',
        undefined,
      );
      expect(result).toHaveProperty('accessToken', 'new-access-token');
    });
  });

  describe('getProfile', () => {
    it('should return normalized profile without password', () => {
      const mockUser = {
        id: 'user-1',
        username: 'admin',
        email: 'admin@tahouse.vn',
        fullName: 'Admin TA House',
        avatarUrl: '/avatar.jpg',
        lastLoginAt: '2026-01-01',
      };

      const profile = controller.getProfile(mockUser);

      expect(profile).toEqual({
        username: 'admin',
        email: 'admin@tahouse.vn',
        fullName: 'Admin TA House',
        avatarUrl: '/avatar.jpg',
        lastLoginAt: '2026-01-01',
      });
      expect(profile).not.toHaveProperty('password');
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return updated user info', async () => {
      const dto = { fullName: 'Updated Name', email: 'updated@tahouse.vn' };
      const result = await controller.updateProfile('user-1', dto);

      expect(authService.updateProfile).toHaveBeenCalledWith('user-1', dto);
      expect(result).toHaveProperty('fullName', 'Updated Name');
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with current user id', async () => {
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const result = await controller.changePassword('user-1', dto);

      expect(authService.changePassword).toHaveBeenCalledWith('user-1', dto);
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('logout', () => {
    it('should revoke refresh token on logout', async () => {
      const result = await controller.logout({
        refreshToken: 'mock-refresh-token',
      });

      expect(authService.logout).toHaveBeenCalledWith('mock-refresh-token');
      expect(result).toHaveProperty('success', true);
    });
  });
});
