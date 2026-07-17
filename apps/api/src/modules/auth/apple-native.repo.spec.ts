import { vi, describe, it, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../shared/db/prisma.service';
import { AppleNativeRepository } from './apple-native.repo';

describe('AppleNativeRepository', () => {
  let repo: AppleNativeRepository;
  let prisma: {
    account: { findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    user: { create: ReturnType<typeof vi.fn> };
    session: { create: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      account: { findFirst: vi.fn<any>(), create: vi.fn<any>() },
      user: { create: vi.fn<any>() },
      session: { create: vi.fn<any>() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppleNativeRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get<AppleNativeRepository>(AppleNativeRepository);
  });

  describe('findAccountByProviderId', () => {
    it('calls prisma.account.findFirst with correct args', async () => {
      prisma.account.findFirst.mockResolvedValue({ userId: 'u1' });
      const result = await repo.findAccountByProviderId('apple', 'abc123');
      expect(prisma.account.findFirst).toHaveBeenCalledWith({
        where: { providerId: 'apple', accountId: 'abc123' },
      });
      expect(result).toEqual({ userId: 'u1' });
    });
  });

  describe('createUser', () => {
    it('creates a user with the given data', async () => {
      const data = { name: 'John Doe', email: 'j@test.com' };
      prisma.user.create.mockResolvedValue({ id: 'u1', ...data });
      const result = await repo.createUser(data, true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...data, emailVerified: true },
      });
      expect(result.id).toBe('u1');
    });
  });

  describe('createAccount', () => {
    it('creates an account record', async () => {
      prisma.account.create.mockResolvedValue({ id: 'acct1' });
      const result = await repo.createAccount({
        userId: 'u1',
        providerId: 'apple',
        accountId: 'abc',
      });
      expect(prisma.account.create).toHaveBeenCalledWith({
        data: { userId: 'u1', providerId: 'apple', accountId: 'abc' },
      });
      expect(result.id).toBe('acct1');
    });
  });

  describe('createSession', () => {
    it('creates a session and returns id + expiresAt', async () => {
      const expiresAt = new Date();
      prisma.session.create.mockResolvedValue({ id: 's1', expiresAt });
      const result = await repo.createSession('u1');
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: { userId: 'u1', expiresAt: expect.any(Date), token: expect.any(String) },
      });
      expect(result.id).toBe('s1');
    });
  });
});
