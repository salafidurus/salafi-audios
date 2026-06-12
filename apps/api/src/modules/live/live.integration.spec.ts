import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LiveController } from './live.controller';
import { AdminLiveController } from './admin-live.controller';
import { LiveService } from './live.service';
import { ConfigService } from '../../shared/config/config.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockLiveService = {
  getChannels: jest.fn().mockResolvedValue([]),
  getChannelBySlug: jest.fn().mockResolvedValue(null),
  getActive: jest.fn().mockResolvedValue([]),
  getUpcoming: jest.fn().mockResolvedValue([]),
  getEnded: jest.fn().mockResolvedValue([]),
  createChannel: jest.fn().mockResolvedValue({}),
  updateChannel: jest.fn().mockResolvedValue({}),
  createSession: jest.fn().mockResolvedValue({}),
  updateSession: jest.fn().mockResolvedValue({}),
  updateSessionStatus: jest.fn().mockResolvedValue({}),
};

describe('LiveController — auth boundaries', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LiveController, AdminLiveController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: LiveService, useValue: mockLiveService },
        {
          provide: ConfigService,
          useValue: {
            LIVESTREAM_SECRET: 'test-secret',
          },
        },
      ],
    })
      .overrideGuard(AdminPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
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
      return request(app.getHttpServer())
        .get('/live/sessions/active')
        .expect(200);
    });

    it('GET /live/sessions/upcoming returns 200 without auth', () => {
      return request(app.getHttpServer())
        .get('/live/sessions/upcoming')
        .expect(200);
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
