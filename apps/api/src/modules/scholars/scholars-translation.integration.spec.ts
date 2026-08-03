import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import request from 'supertest';
import { createTestApp } from '../../test/create-test-app';
import { AuthGuard } from '../../core/auth/auth.guard';
import { PolicyGuard } from '../../core/auth/policy.guard';
import { ScholarsController } from './scholars.controller';
import { ScholarsTranslationsController } from './scholars-translations.controller';
import { ScholarsService } from './scholars.service';
import { PrismaService } from '../../core/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../../core/auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userAccessGrant: {
    findMany: vi.fn<any>().mockResolvedValue([]),
  },
  userPermission: {
    findMany: vi.fn<any>().mockResolvedValue([]),
    findUnique: vi.fn<any>().mockResolvedValue(null),
  },
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
    findUnique: vi.fn<any>().mockResolvedValue(null),
  },
  userScholarRole: {
    findMany: vi.fn<any>().mockResolvedValue([]),
  },
  userTranslatorRole: {
    findMany: vi.fn<any>().mockResolvedValue([]),
  },
};

const draftTranslation = {
  locale: 'ar',
  status: 'draft',
  fields: { name: 'ابن تيمية', bio: null },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const publishedTranslation = { ...draftTranslation, status: 'published' };

const mockScholarsService = {
  list: vi.fn<any>().mockResolvedValue({ scholars: [] }),
  getBySlug: vi.fn<any>(),
  getContent: vi.fn<any>(),
  create: vi.fn<any>(),
  update: vi.fn<any>(),
  listTranslations: vi.fn<any>().mockResolvedValue([]),
  upsertTranslation: vi.fn<any>().mockResolvedValue(draftTranslation),
  updateTranslation: vi.fn<any>().mockResolvedValue(draftTranslation),
  publishTranslation: vi.fn<any>().mockResolvedValue(publishedTranslation),
  unpublishTranslation: vi.fn<any>().mockResolvedValue(draftTranslation),
};

async function buildApp(_overrideGuard?: () => boolean | never): Promise<NestFastifyApplication> {
  const builder = Test.createTestingModule({
    imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
    controllers: [ScholarsController, ScholarsTranslationsController],
    providers: [
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: APP_GUARD, useClass: PolicyGuard },
      { provide: ScholarsService, useValue: mockScholarsService },
      { provide: PrismaService, useValue: mockPrisma },
    ],
  });

  return createTestApp(builder);
}

describe('ScholarsTranslationsController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    vi.clearAllMocks();
    mockScholarsService.upsertTranslation.mockResolvedValue(draftTranslation);
    mockScholarsService.publishTranslation.mockResolvedValue(publishedTranslation);
    mockScholarsService.unpublishTranslation.mockResolvedValue(draftTranslation);
    app = await buildApp();
  });

  afterEach(() => app.close());

  describe('authenticated admin with scholar translation access', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'admin' },
        session: {},
      });
      mockPrisma.userAccessGrant.findMany.mockResolvedValue([
        { target: 'translation', capability: 'translate', scholarId: 's1', locale: 'ar' },
        { target: 'translation', capability: 'publish', scholarId: 's1', locale: 'ar' },
      ]);
    });

    it('POST /scholars/:id/translations creates a draft translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/scholars/s1/translations')
        .send({ locale: 'ar', name: 'ابن تيمية' })
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('POST /scholars/:id/translations/:locale/publish publishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/scholars/s1/translations/ar/publish')
        .expect(201);
      expect(res.body.status).toBe('published');
    });

    it('POST /scholars/:id/translations/:locale/unpublish unpublishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/scholars/s1/translations/ar/unpublish')
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('GET /scholars/:id/translations lists translations', async () => {
      mockScholarsService.listTranslations.mockResolvedValue([draftTranslation]);
      const res = await request(app.getHttpServer()).get('/scholars/s1/translations').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /scholars/:slug with locale param', () => {
    it('returns Arabic name when published Arabic translation exists', async () => {
      mockScholarsService.getBySlug.mockResolvedValue({
        id: 's1',
        slug: 'ibn-taymiyyah',
        name: 'ابن تيمية',
        lectureCount: 0,
        seriesCount: 0,
        totalDurationSeconds: 0,
      });
      const res = await request(app.getHttpServer())
        .get('/scholars/ibn-taymiyyah?locale=ar')
        .expect(200);
      expect(res.body.name).toBe('ابن تيمية');
    });
  });

  describe('unauthenticated requests', () => {
    it('POST /scholars/:id/translations returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .post('/scholars/s1/translations')
        .send({ locale: 'ar', name: 'ابن تيمية' });
      expect(response.status).toBe(401);
    });
  });

  describe('missing scholar translation access', () => {
    let forbiddenApp: NestFastifyApplication;

    beforeEach(async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user' },
        session: {},
      });
      mockPrisma.userAccessGrant.findMany.mockResolvedValue([]);
      forbiddenApp = await buildApp();
    });

    afterEach(() => forbiddenApp.close());

    it('POST /scholars/:id/translations returns 403', async () => {
      const response = await request(forbiddenApp.getHttpServer())
        .post('/scholars/s1/translations')
        .send({ locale: 'ar', name: 'ابن تيمية' });
      expect(response.status).toBe(403);
    });
  });
});
