import { vi } from 'vitest';
import { Controller, Get } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { Public } from './decorators';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('./auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn().mockResolvedValue([{ role: 'user' }]),
  },
};

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
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
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
