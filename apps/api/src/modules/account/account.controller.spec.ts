import { vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockProfile = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.png',
  role: 'user',
  emailVerified: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
};

const mockAccountService = {
  getProfile: vi.fn().mockReturnValue(mockProfile),
  updateProfile: vi.fn().mockResolvedValue(mockProfile),
};

describe('AccountController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    vi.clearAllMocks();
    mockAccountService.getProfile.mockReturnValue(mockProfile);

    const module = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: AccountService, useValue: mockAccountService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  describe('401 — no session', () => {
    it('GET /account/profile returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer()).get('/account/profile').expect(401);
    });
  });

  describe('200 — authenticated', () => {
    const authenticatedSession = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.png',
        role: 'user',
        emailVerified: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-06-01T00:00:00.000Z'),
      },
      session: {},
    };

    it('GET /account/profile returns the mapped profile for an authenticated user', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);

      const res = await request(app.getHttpServer()).get('/account/profile').expect(200);

      expect(res.body).toEqual(mockProfile);
      expect(mockAccountService.getProfile).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-1', email: 'test@example.com' }),
      );
    });

    it('PATCH /account/profile updates and returns the profile', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);

      const res = await request(app.getHttpServer())
        .patch('/account/profile')
        .send({ displayName: 'Updated Name' })
        .expect(200);

      expect(res.body).toEqual(mockProfile);
      expect(mockAccountService.updateProfile).toHaveBeenCalledWith('user-1', 'Updated Name');
    });
  });

  describe('401 — unauthenticated PATCH', () => {
    it('PATCH /account/profile returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .patch('/account/profile')
        .send({ displayName: 'X' })
        .expect(401);
    });
  });
});
