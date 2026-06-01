import { ForbiddenException, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LecturesController } from './lectures.controller';
import { LecturesTranslationsController } from './lectures-translations.controller';
import { LecturesService } from './lectures.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const draftTranslation = {
  locale: 'ar',
  status: 'draft',
  fields: { title: 'محاضرة عربية', description: null },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const publishedTranslation = { ...draftTranslation, status: 'published' };

const mockLecturesService = {
  getById: jest.fn().mockResolvedValue({ id: 'l1', title: 'Test Lecture' }),
  getRelated: jest.fn().mockResolvedValue([]),
  updateLecture: jest.fn().mockResolvedValue({}),
  publishLecture: jest.fn().mockResolvedValue({}),
  archiveLecture: jest.fn().mockResolvedValue({}),
  listTranslations: jest.fn().mockResolvedValue([]),
  upsertTranslation: jest.fn().mockResolvedValue(draftTranslation),
  updateTranslation: jest.fn().mockResolvedValue(draftTranslation),
  publishTranslation: jest.fn().mockResolvedValue(publishedTranslation),
  unpublishTranslation: jest.fn().mockResolvedValue(draftTranslation),
};

async function buildApp(
  overrideGuard?: () => boolean | never,
): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    controllers: [LecturesController, LecturesTranslationsController],
    providers: [
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: LecturesService, useValue: mockLecturesService },
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

describe('LecturesTranslationsController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    jest.clearAllMocks();
    mockLecturesService.upsertTranslation.mockResolvedValue(draftTranslation);
    mockLecturesService.publishTranslation.mockResolvedValue(
      publishedTranslation,
    );
    mockLecturesService.unpublishTranslation.mockResolvedValue(
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

    it('POST /lectures/:id/translations creates a draft translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/lectures/l1/translations')
        .send({ locale: 'ar', title: 'محاضرة عربية' })
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('POST /lectures/:id/translations/:locale/publish publishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/lectures/l1/translations/ar/publish')
        .expect(201);
      expect(res.body.status).toBe('published');
    });

    it('POST /lectures/:id/translations/:locale/unpublish unpublishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/lectures/l1/translations/ar/unpublish')
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('GET /lectures/:id/translations lists translations', async () => {
      mockLecturesService.listTranslations.mockResolvedValue([
        draftTranslation,
      ]);
      const res = await request(app.getHttpServer())
        .get('/lectures/l1/translations')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('unauthenticated requests', () => {
    it('POST /lectures/:id/translations returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/lectures/l1/translations')
        .send({ locale: 'ar', title: 'محاضرة عربية' })
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

    it('POST /lectures/:id/translations returns 403', () => {
      return request(forbiddenApp.getHttpServer())
        .post('/lectures/l1/translations')
        .send({ locale: 'ar', title: 'محاضرة عربية' })
        .expect(403);
    });
  });
});
