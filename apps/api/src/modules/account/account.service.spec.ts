import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.png',
    role: 'user',
    emailVerified: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService],
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
        role: 'user',
        emailVerified: true,
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

    it('should include role and emailVerified', () => {
      const result = service.getProfile({
        ...mockUser,
        role: 'admin',
        emailVerified: false,
      });
      expect(result.role).toBe('admin');
      expect(result.emailVerified).toBe(false);
    });
  });
});
