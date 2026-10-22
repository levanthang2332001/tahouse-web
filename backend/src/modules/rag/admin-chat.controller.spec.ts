jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminChatController } from './admin-chat.controller';
import { ChatRepository } from './repositories/chat.repository';

describe('AdminChatController', () => {
  let controller: AdminChatController;
  let chatRepository: jest.Mocked<ChatRepository>;

  const mockSessionDetail = {
    id: 'session-123',
    title: 'Tư vấn khóa cửa gỗ',
    ipAddress: '14.241.12.34',
    browser: 'Google Chrome',
    os: 'Windows 10/11',
    device: 'Desktop',
    origin: 'https://tahouse.vn',
    referer: 'https://tahouse.vn/products',
    location: 'Quận 1, Ho Chi Minh City, Vietnam',
    totalMessages: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        id: 'msg-1',
        sessionId: 'session-123',
        role: 'user',
        content: 'Tư vấn khóa cửa gỗ',
        createdAt: new Date(),
      },
      {
        id: 'msg-2',
        sessionId: 'session-123',
        role: 'assistant',
        content: 'Dạ chào bạn, TA House xin giới thiệu...',
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    const mockRepo = {
      findSessions: jest.fn().mockResolvedValue({
        items: [mockSessionDetail],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      findSessionWithMessages: jest.fn().mockImplementation((id: string) => {
        if (id === 'session-123') return Promise.resolve(mockSessionDetail);
        return Promise.resolve(null);
      }),
      deleteSession: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminChatController],
      providers: [
        {
          provide: ChatRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    controller = module.get<AdminChatController>(AdminChatController);
    chatRepository = module.get(ChatRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return list of sessions with audit info on GET /admin/chat/sessions', async () => {
    const res = await controller.getSessions({ page: 1, limit: 20 });
    expect(res.total).toBe(1);
    expect(res.items[0].ipAddress).toBe('14.241.12.34');
    expect(res.items[0].browser).toBe('Google Chrome');
    expect(res.items[0].location).toBe('Quận 1, Ho Chi Minh City, Vietnam');
    expect(chatRepository.findSessions).toHaveBeenCalled();
  });

  it('should return session detail and full messages on GET /admin/chat/sessions/:id', async () => {
    const res = await controller.getSessionDetail('session-123');
    expect(res.id).toBe('session-123');
    expect(res.messages?.length).toBe(2);
    expect(res.messages![0].content).toBe('Tư vấn khóa cửa gỗ');
    expect(chatRepository.findSessionWithMessages).toHaveBeenCalledWith('session-123');
  });

  it('should throw NotFoundException if session does not exist', async () => {
    await expect(controller.getSessionDetail('unknown-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete session on DELETE /admin/chat/sessions/:id', async () => {
    const res = await controller.deleteSession('session-123');
    expect(res.success).toBe(true);
    expect(chatRepository.deleteSession).toHaveBeenCalledWith('session-123');
  });
});
