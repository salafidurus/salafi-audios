import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Public } from './decorators';
import { AuthGuard } from './auth.guard';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('./auth.instance', () => ({ getAuth: () => mockAuth }));

@Controller('auth-test')
class TestController {
  @Public()
  @Get('public')
  publicRoute() {
    return { ok: true };
  }

  @Get('protected')
  protectedRoute() {
    return { ok: true };
  }
}

describe('AuthGuard — HTTP integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [TestController],
      providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /auth-test/public returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/auth-test/public').expect(200);
  });

  it('GET /auth-test/protected returns 401 without a session', () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    return request(app.getHttpServer()).get('/auth-test/protected').expect(401);
  });

  it('GET /auth-test/protected returns 200 with a valid session', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'u1', role: 'user', email: 'a@b.com' },
      session: {},
    });

    return request(app.getHttpServer()).get('/auth-test/protected').expect(200);
  });

  it('GET /auth-test/protected returns 403 for a banned user', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: {
        id: 'u2',
        role: 'user',
        email: 'banned@b.com',
        banned: true,
        banExpires: null,
      },
      session: {},
    });

    return request(app.getHttpServer()).get('/auth-test/protected').expect(403);
  });
});
