import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import request from 'supertest';
import { createTestApp } from '../../test/create-test-app';
import { AuthGuard } from '../../core/auth/auth.guard';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsService } from './scholars.service';
import { PrismaService } from '../../core/db/prisma.service';
import { ScholarsRecommendationService } from '../recommendation/scholars-recommendation.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../../core/auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userAccessGrant: {
    findMany: vi.fn<any>().mockResolvedValue([]),
  },
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockScholarsService = {
  getPageFeed: vi.fn<any>().mockResolvedValue({ schemaVersion: 1, batches: [], exhausted: true }),
  directory: vi.fn<any>().mockResolvedValue({ scholars: [], hasMore: false }),
  search: vi.fn<any>().mockResolvedValue({ scholars: [], hasMore: false }),
  getBySlug: vi.fn<any>().mockResolvedValue(null),
  getContent: vi.fn<any>().mockResolvedValue({ lectures: [], series: [] }),
  create: vi.fn<any>().mockResolvedValue({}),
  update: vi.fn<any>().mockResolvedValue({}),
};

describe('ScholarsController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const moduleBuilder = Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
      controllers: [ScholarsController, AdminScholarsController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ScholarsService, useValue: mockScholarsService },
        { provide: ScholarsRecommendationService, useValue: { recommend: vi.fn() } },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    });

    app = await createTestApp(moduleBuilder);
  });

  afterEach(() => app?.close());

  describe('public endpoints', () => {
    it('GET /scholars returns 200 without auth', async () => {
      const response = await request(app.getHttpServer()).get('/scholars');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('GET /scholars forwards opaque continuation and bounded page size', async () => {
      const response = await request(app.getHttpServer())
        .get('/scholars')
        .query({ cursor: 'opaque-next-page', limit: 2 });

      expect(response.status).toBe(200);
      expect(mockScholarsService.getPageFeed).toHaveBeenLastCalledWith('opaque-next-page', 2);
    });

    it('GET /scholars rejects an invalid page size', async () => {
      const response = await request(app.getHttpServer()).get('/scholars').query({ limit: 101 });

      expect(response.status).toBe(400);
      expect(mockScholarsService.getPageFeed).not.toHaveBeenLastCalledWith(undefined, 101);
    });

    it('GET /scholars/directory returns 200 without auth', async () => {
      const response = await request(app.getHttpServer()).get('/scholars/directory');
      expect(response.status).toBe(200);
      expect(mockScholarsService.directory).toHaveBeenCalled();
    });

    it('GET /scholars/search requires a non-empty query', async () => {
      const response = await request(app.getHttpServer()).get('/scholars/search?q=');
      expect(response.status).toBe(400);
      expect(mockScholarsService.search).not.toHaveBeenCalled();
    });

    it('GET /scholars/search delegates a normalized query without auth', async () => {
      const response = await request(app.getHttpServer()).get('/scholars/search?q=%20ibn%20');
      expect(response.status).toBe(200);
      expect(mockScholarsService.search).toHaveBeenCalledWith('ibn');
    });

    it('GET /scholars/:slug returns 200 without auth', async () => {
      mockScholarsService.getBySlug.mockResolvedValue({
        id: 's1',
        slug: 'ibn-taymiyyah',
        name: 'Ibn Taymiyyah',
        lectureCount: 0,
        seriesCount: 0,
        totalDurationSeconds: 0,
      });
      const response = await request(app.getHttpServer()).get('/scholars/ibn-taymiyyah');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('admin endpoints', () => {
    it('POST /admin/scholars returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .post('/admin/scholars')
        .send({ name: 'Test Scholar', slug: 'test-scholar' });
      expect(response.status).toBe(401);
    });

    it('PATCH /admin/scholars/:id returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .patch('/admin/scholars/s1')
        .send({ name: 'Updated Scholar' });
      expect(response.status).toBe(401);
    });
  });
});
