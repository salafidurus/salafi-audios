import { ForbiddenException, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { CollectionTranslationsController } from './collection-translations.controller';
import { ScholarsService } from './scholars.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const draftTranslation = {
  locale: 'ar',
  status: 'draft',
  fields: { title: 'مجموعة عربية', description: null },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const publishedTranslation = { ...draftTranslation, status: 'published' };

const mockScholarsService = {
  listCollectionTranslations: jest.fn().mockResolvedValue([]),
  upsertCollectionTranslation: jest.fn().mockResolvedValue(draftTranslation),
  updateCollectionTranslation: jest.fn().mockResolvedValue(draftTranslation),
  publishCollectionTranslation: jest
    .fn()
    .mockResolvedValue(publishedTranslation),
  unpublishCollectionTranslation: jest.fn().mockResolvedValue(draftTranslation),
};

async function buildApp(
  overrideGuard?: () => boolean | never,
): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    controllers: [CollectionTranslationsController],
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

describe('CollectionTranslationsController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    jest.clearAllMocks();
    mockScholarsService.upsertCollectionTranslation.mockResolvedValue(
      draftTranslation,
    );
    mockScholarsService.publishCollectionTranslation.mockResolvedValue(
      publishedTranslation,
    );
    mockScholarsService.unpublishCollectionTranslation.mockResolvedValue(
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

    it('POST /scholars/:scholarId/collections/:collectionId/translations creates a draft translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/scholars/sc1/collections/col1/translations')
        .send({ locale: 'ar', title: 'مجموعة عربية' })
        .expect(201);
      expect(res.body.status).toBe('draft');
    });

    it('POST .../publish publishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/scholars/sc1/collections/col1/translations/ar/publish')
        .expect(201);
      expect(res.body.status).toBe('published');
    });

    it('POST .../unpublish unpublishes the translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/scholars/sc1/collections/col1/translations/ar/unpublish')
        .expect(201);
      expect(res.body.status).toBe('draft');
    });
  });

  describe('unauthenticated requests', () => {
    it('POST /scholars/:scholarId/collections/:collectionId/translations returns 401', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/scholars/sc1/collections/col1/translations')
        .send({ locale: 'ar', title: 'مجموعة عربية' })
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

    it('POST /scholars/:scholarId/collections/:collectionId/translations returns 403', () => {
      return request(forbiddenApp.getHttpServer())
        .post('/scholars/sc1/collections/col1/translations')
        .send({ locale: 'ar', title: 'مجموعة عربية' })
        .expect(403);
    });
  });
});
