import { Test, TestingModule } from '@nestjs/testing';
import { ChatRepository } from './chat.repository';
import { D1_DATABASE } from '@/database/d1.constants';
import { ChatSession, ChatMessageEntity } from '../schemas/chat.schema';

describe('ChatRepository', () => {
  let repository: ChatRepository;
  let mockDb: any;

  const mockSession: ChatSession = {
    id: 'session-123',
    title: 'Khóa cửa vân tay Kassler',
    ipAddress: '14.241.12.34',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    browser: 'Google Chrome',
    os: 'Windows 10/11',
    device: 'Desktop',
    origin: 'https://tahouse.vn',
    referer: 'https://tahouse.vn/products',
    location: 'Quận 1, Ho Chi Minh City, Vietnam',
    totalMessages: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage: ChatMessageEntity = {
    id: 'msg-1',
    sessionId: 'session-123',
    role: 'user',
    content: 'Tư vấn khóa cửa gỗ giá dưới 15 triệu',
    ipAddress: '14.241.12.34',
    userAgent: 'Mozilla/5.0',
    origin: 'https://tahouse.vn',
    metadata: {},
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        chatSessions: {
          findFirst: jest.fn().mockResolvedValue(mockSession),
          findMany: jest.fn().mockResolvedValue([mockSession]),
        },
        chatMessages: {
          findMany: jest.fn().mockResolvedValue([mockMessage]),
        },
      },
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 1 }]),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRepository,
        {
          provide: D1_DATABASE,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create new session when not found', async () => {
    mockDb.query.chatSessions.findFirst.mockResolvedValueOnce(null);

    const session = await repository.createOrGetSession({
      sessionId: 'session-new',
      title: 'Hỏi về khóa KL-989F',
      ipAddress: '113.190.1.2',
      browser: 'Apple Safari',
      os: 'iOS',
      device: 'Mobile',
      location: 'Hà Nội, Vietnam',
    });

    expect(session.id).toBe('session-new');
    expect(session.browser).toBe('Apple Safari');
    expect(session.location).toBe('Hà Nội, Vietnam');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should save a chat message and increment session message count', async () => {
    const msg = await repository.saveMessage({
      sessionId: 'session-123',
      role: 'user',
      content: 'Khóa cửa Kassler có chống nước không?',
      ipAddress: '14.241.12.34',
    });

    expect(msg.sessionId).toBe('session-123');
    expect(msg.role).toBe('user');
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('should find sessions with pagination and search filter', async () => {
    const result = await repository.findSessions({
      page: 1,
      limit: 10,
      search: 'Kassler',
    });

    expect(result.total).toBe(1);
    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe('session-123');
    expect(result.items[0].browser).toBe('Google Chrome');
  });

  it('should find session with messages for audit view', async () => {
    const detail = await repository.findSessionWithMessages('session-123');

    expect(detail).not.toBeNull();
    expect(detail!.id).toBe('session-123');
    expect(detail!.messages?.length).toBe(1);
    expect(detail!.messages![0].content).toBe('Tư vấn khóa cửa gỗ giá dưới 15 triệu');
  });

  it('should delete a session by id', async () => {
    const success = await repository.deleteSession('session-123');
    expect(success).toBe(true);
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
