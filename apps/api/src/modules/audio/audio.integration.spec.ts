import { vi } from 'vitest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockAudioService = {
  getUserProgress: vi.fn<any>().mockResolvedValue([]),
  bulkSync: vi.fn<any>().mockResolvedValue(undefined),
  upsertProgress: vi.fn<any>().mockResolvedValue(undefined),
  resolveStreamUrl: vi.fn<any>().mockResolvedValue({
    url: 'https://test.mp3',
    durationSeconds: 120,
    format: 'mp3',
  }),
};

describe('AudioController — boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockAuth.api.getSession.mockResolvedValue(null);

    const module = await Test.createTestingModule({
      controllers: [AudioController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: AudioService, useValue: mockAudioService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  describe('GET /audio/progress', () => {
    it('should return 401 without a session', async () => {
      const response = await request(app.getHttpServer()).get('/audio/progress');
      expect(response.status).toBe(401);
    });

    it('should return 200 with a valid session', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'a@b.com' },
        session: {},
      });

      const response = await request(app.getHttpServer()).get('/audio/progress');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('POST /audio/progress/sync', () => {
    it('should return 401 without a session', async () => {
      const response = await request(app.getHttpServer())
        .post('/audio/progress/sync')
        .send({ items: [] });
      expect(response.status).toBe(401);
    });

    it('should return 201 with a valid session', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'a@b.com' },
        session: {},
      });

      const response = await request(app.getHttpServer())
        .post('/audio/progress/sync')
        .send({ items: [] });
      expect(response.status).toBe(201);
    });
  });

  describe('PUT /audio/progress/:listingId', () => {
    it('should return 401 without a session', async () => {
      const response = await request(app.getHttpServer())
        .put('/audio/progress/l1')
        .send({ positionSeconds: 30 });
      expect(response.status).toBe(401);
    });

    it('should return 200 with a valid session', async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'a@b.com' },
        session: {},
      });

      const response = await request(app.getHttpServer())
        .put('/audio/progress/l1')
        .send({ positionSeconds: 30 });
      expect(response.status).toBe(200);
    });
  });

  describe('GET /audio/listings/:listingId/stream', () => {
    it('should return 200 without a session (Public route)', async () => {
      const response = await request(app.getHttpServer()).get('/audio/listings/l1/stream');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
