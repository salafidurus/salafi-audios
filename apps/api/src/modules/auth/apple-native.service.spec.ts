import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../shared/config/config.service';
import { AppleNativeRepository } from './apple-native.repo';
import { AppleNativeService } from './apple-native.service';

describe('AppleNativeService', () => {
  let service: AppleNativeService;
  let config: { APPLE_CLIENT_ID: string };
  let repo: {
    findAccountByProviderId: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    createAccount: ReturnType<typeof vi.fn>;
    createSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    config = { APPLE_CLIENT_ID: 'com.example.app' };
    repo = {
      findAccountByProviderId: vi.fn<any>(),
      createUser: vi.fn<any>(),
      createAccount: vi.fn<any>(),
      createSession: vi.fn<any>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleNativeService,
        { provide: ConfigService, useValue: config },
        { provide: AppleNativeRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<AppleNativeService>(AppleNativeService);
  });

  describe('verifyIdentityToken', () => {
    it('throws on missing identity token', async () => {
      await expect(service.verifyIdentityToken('')).rejects.toThrow('Identity token is required');
    });

    it('throws on invalid JWT format', async () => {
      await expect(service.verifyIdentityToken('not-a-jwt')).rejects.toThrow('Failed to parse JWT');
    });
  });

  describe('handleAppleSignIn', () => {
    it('creates user, account, and session for new Apple user', async () => {
      repo.findAccountByProviderId.mockResolvedValue(null);
      repo.createUser.mockResolvedValue({ id: 'user_1', name: 'John Doe' });
      repo.createSession.mockResolvedValue({ id: 'sess_1', expiresAt: new Date() });

      const result = await service.handleAppleSignIn(
        { sub: 'apple_001', email: 'test@icloud.com' },
        { firstName: 'John', lastName: 'Doe' },
      );

      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('user');
      expect(repo.findAccountByProviderId).toHaveBeenCalledWith('apple', 'apple_001');
      expect(repo.createUser).toHaveBeenCalledWith(
        { name: 'John Doe', email: 'test@icloud.com' },
        true,
      );
      expect(repo.createAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_1',
          providerId: 'apple',
          accountId: 'apple_001',
        }),
      );
      expect(repo.createSession).toHaveBeenCalledWith('user_1');
    });

    it('returns existing user when account already exists', async () => {
      repo.findAccountByProviderId.mockResolvedValue({ userId: 'existing_user' });
      repo.createSession.mockResolvedValue({ id: 'sess_2', expiresAt: new Date() });

      const result = await service.handleAppleSignIn(
        { sub: 'apple_001' },
        { email: 'existing@icloud.com' },
      );

      expect(result.user.id).toBe('existing_user');
      expect(repo.createUser).not.toHaveBeenCalled();
      expect(repo.createAccount).not.toHaveBeenCalled();
      expect(repo.createSession).toHaveBeenCalledWith('existing_user');
    });
  });
});
