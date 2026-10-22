import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { User, NewUser } from '../schemas/user.schema';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockDb: any;

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'admin@tahouse.vn',
    name: 'Admin User',
    password: '$2b$10$hashedpassword',
    role: 'ADMIN',
    avatar: 'https://cdn.tahouse.vn/avatar.jpg',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        users: {
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
        UsersRepository,
        {
          provide: D1_DATABASE,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('findByEmail', () => {
    it('should query user by lowercase email', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('  ADMIN@TAHOUSE.VN  ');

      expect(result).toEqual(mockUser);
      expect(mockDb.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should query user by id', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findById('user-uuid-1');

      expect(result).toEqual(mockUser);
      expect(mockDb.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('findOtherUserByEmail', () => {
    it('should query other user with same email excluding given user id', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findOtherUserByEmail(
        'admin@tahouse.vn',
        'user-uuid-2',
      );

      expect(result).toEqual(mockUser);
      expect(mockDb.query.users.findFirst).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should insert new user into D1 database', async () => {
      const newUser: NewUser = {
        id: 'user-uuid-2',
        email: 'user2@tahouse.vn',
        name: 'User Two',
        password: 'hash',
        role: 'USER',
      };

      await repository.create(newUser);

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user fields by id', async () => {
      await repository.update('user-uuid-1', { name: 'New Name' });

      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
