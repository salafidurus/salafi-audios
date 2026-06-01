import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

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
  getProfile: jest.fn().mockReturnValue(mockProfile),
};

describe('AccountController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    jest.clearAllMocks();
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
    it('GET /account/profile returns the mapped profile for an authenticated user', async () => {
      mockAuth.api.getSession.mockResolvedValue({
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
      });

      const res = await request(app.getHttpServer())
        .get('/account/profile')
        .expect(200);

      expect(res.body).toEqual(mockProfile);
      expect(mockAccountService.getProfile).toHaveBeenCalledTimes(1);
    });
  });
});
