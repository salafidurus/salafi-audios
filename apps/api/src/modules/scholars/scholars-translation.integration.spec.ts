import { vi } from 'vitest';
import { ForbiddenException, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsController } from './scholars.controller';
import { ScholarsTranslationsController } from './scholars-translations.controller';
import { ScholarsService } from './scholars.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const draftTranslation = {
  locale: 'ar',
  status: 'draft',
  fields: { name: 'ابن تيمية', bio: null },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const publishedTranslation = { ...draftTranslation, status: 'published' };

const mockScholarsService = {
  list: vi.fn().mockResolvedValue({ scholars: [] }),
  getBySlug: vi.fn(),
  getContent: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  listTranslations: vi.fn().mockResolvedValue([]),
  upsertTranslation: vi.fn().mockResolvedValue(draftTranslation),
  updateTranslation: vi.fn().mockResolvedValue(draftTranslation),
  publishTranslation: vi.fn().mockResolvedValue(publishedTranslation),
  unpublishTranslation: vi.fn().mockResolvedValue(draftTranslation),
};

async function buildApp(
  overrideGuard?: () => boolean | never,
): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    controllers: [ScholarsController, ScholarsTranslationsController],
    providers: [
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: ScholarsService, useValue: mockScholarsService },
    ],
  })
    .overrideGuard(AdminPermissionGuard)
    .useValue({
      canActivate: overrideGuard ?? (() => true),
    });

  const module = await builder.compile();
  const app = module.createNestApplication();
  await app.init();
  return app;
}

describe('ScholarsTranslationsController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    vi.clearAllMocks();
    mockScholarsService.upsertTranslation.mockResolvedValue(draftTranslation);
    mockScholarsService.publishTranslation.mockResolvedValue(
      publishedTranslation,
    );
    mockScholarsService.unpublishTranslation.mockResolvedValue(
      draftTranslation,
    );
    app = await buildApp();
  });

  afterEach(() => app.close());

  describe('authenticated admin with manage:content permission', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'admin' },
        session: {},
      });
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
      mockScholarsService.listTranslations.mockResolvedValue([
        draftTranslation,
      ]);
      const res = await request(app.getHttpServer())
        .get('/scholars/s1/translations')
        .expect(200);
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
    it('POST /scholars/:id/translations returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/scholars/s1/translations')
        .send({ locale: 'ar', name: 'ابن تيمية' })
        .expect(401);
    });
  });

  describe('missing manage:content permission', () => {
    let forbiddenApp: INestApplication;

    beforeEach(async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user' },
        session: {},
      });
      forbiddenApp = await buildApp(() => {
        throw new ForbiddenException('Missing permission: manage:content');
      });
    });

    afterEach(() => forbiddenApp.close());

    it('POST /scholars/:id/translations returns 403', () => {
      return request(forbiddenApp.getHttpServer())
        .post('/scholars/s1/translations')
        .send({ locale: 'ar', name: 'ابن تيمية' })
        .expect(403);
    });
  });
});
