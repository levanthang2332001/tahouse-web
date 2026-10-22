import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { NewRefreshToken } from '../schemas/refresh-token.schema';

describe('RefreshTokensRepository', () => {
  let repository: RefreshTokensRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      query: {
        refreshTokens: {
          findFirst: jest.fn(),
        },
      },
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensRepository,
        {
          provide: D1_DATABASE,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<RefreshTokensRepository>(RefreshTokensRepository);
  });

  describe('create', () => {
    it('should insert refresh token into database', async () => {
      const tokenData: NewRefreshToken = {
        userId: 'user-uuid-1',
        hashedToken: 'hash123',
        userAgent: 'Chrome',
        ipAddress: '127.0.0.1',
        isRevoked: false,
        expiresAt: new Date(),
      };

      await repository.create(tokenData);

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('findActiveByHashedToken', () => {
    it('should query active unrevoked unexpired token with associated user', async () => {
      const mockResult = {
        id: 'token-1',
        userId: 'user-1',
        hashedToken: 'hash123',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 10000),
        user: { id: 'user-1', email: 'admin@tahouse.vn' },
      };
      mockDb.query.refreshTokens.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findActiveByHashedToken('hash123');

      expect(result).toEqual(mockResult);
      expect(mockDb.query.refreshTokens.findFirst).toHaveBeenCalled();
    });
  });

  describe('revokeById', () => {
    it('should update isRevoked to true by token id', async () => {
      await repository.revokeById('token-1');

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('revokeByHashedToken', () => {
    it('should update isRevoked to true by hashed token', async () => {
      await repository.revokeByHashedToken('hash123');

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('revokeAllByUserId', () => {
    it('should update isRevoked to true for all active tokens belonging to user', async () => {
      await repository.revokeAllByUserId('user-uuid-1');

      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
