import { vi } from 'vitest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LiveController } from './live.controller';
import { AdminLiveController } from './admin-live.controller';
import { LiveService } from './live.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockLiveService = {
  getChannels: vi.fn().mockResolvedValue([]),
  getChannelBySlug: vi.fn().mockResolvedValue(null),
  getActive: vi.fn().mockResolvedValue([]),
  getUpcoming: vi.fn().mockResolvedValue([]),
  getEnded: vi.fn().mockResolvedValue([]),
  createChannel: vi.fn().mockResolvedValue({}),
  updateChannel: vi.fn().mockResolvedValue({}),
  createSession: vi.fn().mockResolvedValue({}),
  updateSession: vi.fn().mockResolvedValue({}),
  updateSessionStatus: vi.fn().mockResolvedValue({}),
};

describe('LiveController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LiveController, AdminLiveController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: LiveService, useValue: mockLiveService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(AdminPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(() => {
    mockAuth.api.getSession.mockReset();
  });

  afterAll(() => app.close());

  describe('public endpoints', () => {
    it('GET /live/channels returns 200 without auth', () => {
      return request(app.getHttpServer()).get('/live/channels').expect(200);
    });

    it('GET /live/sessions/active returns 200 without auth', () => {
      return request(app.getHttpServer()).get('/live/sessions/active').expect(200);
    });

    it('GET /live/sessions/upcoming returns 200 without auth', () => {
      return request(app.getHttpServer()).get('/live/sessions/upcoming').expect(200);
    });

    it('GET /live/ended returns 200 without auth', () => {
      return request(app.getHttpServer()).get('/live/ended').expect(200);
    });
  });

  describe('admin endpoints', () => {
    it('POST /admin/live/channels returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/live/channels')
        .send({ name: 'Test', slug: 'test' })
        .expect(401);
    });

    it('POST /admin/live/sessions returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/live/sessions')
        .send({ channelId: 'c1', title: 'Session' })
        .expect(401);
    });
  });
});
