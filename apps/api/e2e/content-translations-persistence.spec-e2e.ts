process.env.DISABLE_THROTTLER = 'true';

import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { Permission } from '@sd/core-db';
import { TEST_SCHOLAR_ID, TEST_LISTING_ID, seedTestData } from './helpers/seed-test-data';

/**
 * Translations are written exclusively through the standalone per-locale
 * endpoints (POST /listings/:id/translations, POST /scholars/:id/translations,
 * and their PATCH :locale counterparts) — never as an embedded `translations`
 * array on the listing/scholar create or update DTOs. This suite exercises
 * that standalone path end-to-end against a real database.
 */
describe('Content translations persistence (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authFactory: TestAuthFactory;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrismaService);
    authFactory = new TestAuthFactory(prisma);
    await seedTestData(prisma);
  });

  afterAll(async () => {
    // Restore shared seed state so other spec files aren't affected by the
    // translation rows this suite creates on shared fixtures.
    await prisma.listingTranslation.deleteMany({
      where: { listingId: TEST_LISTING_ID, locale: 'en' },
    });
    await prisma.scholarTranslation.deleteMany({
      where: { scholarId: TEST_SCHOLAR_ID, locale: 'en' },
    });
    await app.close();
  });

  describe('Listing translations', () => {
    it('POST /listings/:id/translations persists a secondary-locale translation under the correct locale', async () => {
      const auth = await authFactory.createAdminUser([
        Permission.TRANSLATIONS_CREATE,
        Permission.TRANSLATIONS_VIEW,
      ]);

      await request(app.getHttpServer())
        .post(`/listings/${TEST_LISTING_ID}/translations`)
        .set(auth.headers)
        .send({ locale: 'en', title: 'English Translation Title', description: 'English desc' })
        .expect(201);

      const translation = await prisma.listingTranslation.findUnique({
        where: { listingId_locale: { listingId: TEST_LISTING_ID, locale: 'en' } },
      });

      expect(translation).not.toBeNull();
      expect(translation?.title).toBe('English Translation Title');
      expect(translation?.description).toBe('English desc');

      // Must never write a row keyed by anything other than a real locale.
      const badRows = await prisma.listingTranslation.findMany({
        where: { listingId: TEST_LISTING_ID, locale: { notIn: ['en', 'ar'] } },
      });
      expect(badRows).toHaveLength(0);
    });

    it('PATCH /listings/:id/translations/:locale updates the existing translation in place', async () => {
      const auth = await authFactory.createAdminUser([
        Permission.TRANSLATIONS_EDIT,
        Permission.TRANSLATIONS_VIEW,
      ]);

      await request(app.getHttpServer())
        .patch(`/listings/${TEST_LISTING_ID}/translations/en`)
        .set(auth.headers)
        .send({ title: 'Updated English Title' })
        .expect(200);

      const translation = await prisma.listingTranslation.findUnique({
        where: { listingId_locale: { listingId: TEST_LISTING_ID, locale: 'en' } },
      });

      expect(translation?.title).toBe('Updated English Title');
    });

    it('PUT /admin/listings/:id/details does not accept an embedded translations array', async () => {
      const auth = await authFactory.createAdminUser([Permission.LISTINGS_EDIT]);

      const res = await request(app.getHttpServer())
        .put(`/admin/listings/${TEST_LISTING_ID}/details`)
        .set(auth.headers)
        .send({
          translations: [{ locale: 'ar', title: 'Should be ignored', description: null }],
        });

      // The field is stripped by DTO validation (unknown keys are not
      // accepted), so this must not create/alter an `ar` translation row.
      expect(res.status).toBeLessThan(500);
      const arTranslation = await prisma.listingTranslation.findUnique({
        where: { listingId_locale: { listingId: TEST_LISTING_ID, locale: 'ar' } },
      });
      expect(arTranslation?.title).not.toBe('Should be ignored');
    });
  });

  describe('Scholar translations', () => {
    it('POST /scholars/:id/translations persists a secondary-locale translation under the correct locale', async () => {
      const auth = await authFactory.createAdminUser([
        Permission.TRANSLATIONS_CREATE,
        Permission.TRANSLATIONS_VIEW,
      ]);

      await request(app.getHttpServer())
        .post(`/scholars/${TEST_SCHOLAR_ID}/translations`)
        .set(auth.headers)
        .send({ locale: 'en', name: 'English Scholar Name', bio: 'English bio' })
        .expect(201);

      const translation = await prisma.scholarTranslation.findUnique({
        where: { scholarId_locale: { scholarId: TEST_SCHOLAR_ID, locale: 'en' } },
      });

      expect(translation).not.toBeNull();
      expect(translation?.name).toBe('English Scholar Name');
      expect(translation?.bio).toBe('English bio');

      const badRows = await prisma.scholarTranslation.findMany({
        where: { scholarId: TEST_SCHOLAR_ID, locale: { notIn: ['en', 'ar'] } },
      });
      expect(badRows).toHaveLength(0);
    });

    it('PATCH /scholars/:id/translations/:locale updates the existing translation in place', async () => {
      const auth = await authFactory.createAdminUser([
        Permission.TRANSLATIONS_EDIT,
        Permission.TRANSLATIONS_VIEW,
      ]);

      await request(app.getHttpServer())
        .patch(`/scholars/${TEST_SCHOLAR_ID}/translations/en`)
        .set(auth.headers)
        .send({ name: 'Updated English Scholar Name' })
        .expect(200);

      const translation = await prisma.scholarTranslation.findUnique({
        where: { scholarId_locale: { scholarId: TEST_SCHOLAR_ID, locale: 'en' } },
      });

      expect(translation?.name).toBe('Updated English Scholar Name');
    });

    it('PATCH /admin/scholars/:id does not accept an embedded translations array', async () => {
      const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);

      const res = await request(app.getHttpServer())
        .patch(`/admin/scholars/${TEST_SCHOLAR_ID}`)
        .set(auth.headers)
        .send({
          translations: [{ locale: 'ar', name: 'Should be ignored', bio: null }],
        });

      expect(res.status).toBeLessThan(500);
      const arTranslation = await prisma.scholarTranslation.findUnique({
        where: { scholarId_locale: { scholarId: TEST_SCHOLAR_ID, locale: 'ar' } },
      });
      expect(arTranslation?.name).not.toBe('Should be ignored');
    });
  });
});
