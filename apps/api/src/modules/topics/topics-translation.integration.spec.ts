import { vi } from 'vitest';
import { ForbiddenException, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { TopicsController } from './topics.controller';
import { TopicsTranslationsController } from './topics-translations.controller';
import { TopicsService } from './topics.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const draftTranslation = {
  locale: 'ar',
  status: 'draft',
  fields: { name: 'موضوع عربي' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const publishedTranslation = { ...draftTranslation, status: 'published' };

const mockTopicsService = {
  list: vi.fn().mockResolvedValue([]),
  getBySlug: vi.fn(),
  upsert: vi.fn(),
  listChildren: vi.fn().mockResolvedValue([]),
  listLectures: vi.fn().mockResolvedValue([]),
  remove: vi.fn(),
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
    controllers: [TopicsController, TopicsTranslationsController],
    providers: [
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: TopicsService, useValue: mockTopicsService },
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

describe('TopicsTranslationsController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    vi.clearAllMocks();
    mockTopicsService.upsertTranslation.mockResolvedValue(draftTranslation);
    mockTopicsService.publishTranslation.mockResolvedValue(
      publishedTranslation,
    );
    mockTopicsService.unpublishTranslation.mockResolvedValue(draftTranslation);
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

    it('POST /topics/:id/translations creates a draft translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/topics/t1/translations')
        .send({ locale: 'ar', name: 'موضوع عربي' })
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('POST /topics/:id/translations/:locale/publish publishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/topics/t1/translations/ar/publish')
        .expect(201);
      expect(res.body.status).toBe('published');
    });

    it('POST /topics/:id/translations/:locale/unpublish unpublishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/topics/t1/translations/ar/unpublish')
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('GET /topics/:id/translations lists translations', async () => {
      mockTopicsService.listTranslations.mockResolvedValue([draftTranslation]);
      const res = await request(app.getHttpServer())
        .get('/topics/t1/translations')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('unauthenticated requests', () => {
    it('POST /topics/:id/translations returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/topics/t1/translations')
        .send({ locale: 'ar', name: 'موضوع عربي' })
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

    it('POST /topics/:id/translations returns 403', () => {
      return request(forbiddenApp.getHttpServer())
        .post('/topics/t1/translations')
        .send({ locale: 'ar', name: 'موضوع عربي' })
        .expect(403);
    });
  });
});
