import { vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockAudioService = {
  getUserProgress: vi.fn().mockResolvedValue([]),
  bulkSync: vi.fn().mockResolvedValue(undefined),
  upsertProgress: vi.fn().mockResolvedValue(undefined),
  resolveStreamUrl: vi.fn().mockResolvedValue({
    url: 'https://test.mp3',
    durationSeconds: 120,
    format: 'mp3',
  }),
};

describe('AudioController — boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockAuth.api.getSession.mockResolvedValue(null);

    const module = await Test.createTestingModule({
      controllers: [AudioController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: AudioService, useValue: mockAudioService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  describe('GET /audio/progress', () => {
    it('should return 401 without a session', () => {
      return request(app.getHttpServer()).get('/audio/progress').expect(401);
    });

    it('should return 200 with a valid session', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'a@b.com' },
        session: {},
      });

      return request(app.getHttpServer()).get('/audio/progress').expect(200);
    });
  });

  describe('POST /audio/progress/sync', () => {
    it('should return 401 without a session', () => {
      return request(app.getHttpServer())
        .post('/audio/progress/sync')
        .send({ items: [] })
        .expect(401);
    });

    it('should return 201 with a valid session', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'a@b.com' },
        session: {},
      });

      return request(app.getHttpServer())
        .post('/audio/progress/sync')
        .send({ items: [] })
        .expect(201);
    });
  });

  describe('PUT /audio/progress/:lectureId', () => {
    it('should return 401 without a session', () => {
      return request(app.getHttpServer())
        .put('/audio/progress/l1')
        .send({ positionSeconds: 30 })
        .expect(401);
    });

    it('should return 200 with a valid session', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'a@b.com' },
        session: {},
      });

      return request(app.getHttpServer())
        .put('/audio/progress/l1')
        .send({ positionSeconds: 30 })
        .expect(200);
    });
  });

  describe('GET /audio/lectures/:lectureId/stream', () => {
    it('should return 200 without a session (Public route)', () => {
      return request(app.getHttpServer()).get('/audio/lectures/l1/stream').expect(200);
    });
  });
});
