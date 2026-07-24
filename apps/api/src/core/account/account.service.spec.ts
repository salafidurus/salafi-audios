import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../db/prisma.service';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.png',
    emailVerified: true,
    roles: ['listener'],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
  };

  const mockPrisma = {
    user: { update: vi.fn<any>() },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should map all user fields to UserProfileDto correctly', () => {
      const result = service.getProfile(mockUser);

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        emailVerified: true,
        roles: ['listener'],
        permissions: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z',
      });
    });

    it('should map name to displayName', () => {
      const result = service.getProfile({ ...mockUser, name: 'Another Name' });
      expect(result.displayName).toBe('Another Name');
    });

    it('should map image to avatarUrl', () => {
      const result = service.getProfile({
        ...mockUser,
        image: 'https://cdn.example.com/pic.jpg',
      });
      expect(result.avatarUrl).toBe('https://cdn.example.com/pic.jpg');
    });

    it('should set avatarUrl to undefined when user.image is null', () => {
      const result = service.getProfile({ ...mockUser, image: null });
      expect(result.avatarUrl).toBeUndefined();
    });

    it('should set avatarUrl to undefined when user.image is undefined', () => {
      const result = service.getProfile({ ...mockUser, image: undefined });
      expect(result.avatarUrl).toBeUndefined();
    });

    it('should convert createdAt Date to ISO string', () => {
      const result = service.getProfile(mockUser);
      expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should convert updatedAt Date to ISO string', () => {
      const result = service.getProfile(mockUser);
      expect(result.updatedAt).toBe('2024-06-01T00:00:00.000Z');
    });

    it('should include emailVerified', () => {
      const result = service.getProfile({
        ...mockUser,
        emailVerified: false,
      });
      expect(result.emailVerified).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update name via prisma and return mapped profile', async () => {
      const updatedUser = {
        ...mockUser,
        name: 'New Name',
        roles: [{ role: 'listener' }],
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-1', 'New Name');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'New Name' },
        include: { roles: true },
      });
      expect(result.displayName).toBe('New Name');
      expect(result.id).toBe('user-1');
      expect(result.roles).toEqual(['listener']);
    });
  });
});
