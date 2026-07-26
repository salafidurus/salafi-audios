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
    await authFactory.cleanup();
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

  /**
   * Main-language content (title/name/bio) must always have a matching
   * `*Translation` row for whatever locale is currently the main language —
   * created on entity create, kept in sync on every content update, and
   * snapshotted into the *old* locale when the main language itself changes.
   * Uses dedicated scholar/listing fixtures (cleaned up in afterAll) rather
   * than the shared TEST_SCHOLAR_ID/TEST_LISTING_ID, since these tests
   * mutate mainLanguage/language.
   */
  describe('Main-language translation sync', () => {
    let scholarId: string;
    let listingId: string;

    afterAll(async () => {
      if (scholarId) await prisma.scholar.delete({ where: { id: scholarId } });
      if (listingId) await prisma.listing.delete({ where: { id: listingId } });
    });

    describe('Scholar', () => {
      it('POST /admin/scholars mirrors the new scholar into a matching ScholarTranslation', async () => {
        const auth = await authFactory.createAdminUser([Permission.SCHOLARS_CREATE]);
        const res = await request(app.getHttpServer())
          .post('/admin/scholars')
          .set(auth.headers)
          .send({
            name: 'محمد الأول',
            slug: `e2e-sync-scholar-${crypto.randomUUID()}`,
            bio: 'سيرة أولى',
            mainLanguage: 'ar',
            country: 'SA',
          })
          .expect(201);
        scholarId = res.body.id;

        const translation = await prisma.scholarTranslation.findUnique({
          where: { scholarId_locale: { scholarId, locale: 'ar' } },
        });
        expect(translation?.name).toBe('محمد الأول');
        expect(translation?.bio).toBe('سيرة أولى');
        expect(translation?.status).toBe('published');
      });

      it('PATCH /admin/scholars/:id overwrites the current-locale translation when content changes', async () => {
        const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);
        await request(app.getHttpServer())
          .patch(`/admin/scholars/${scholarId}`)
          .set(auth.headers)
          .send({ name: 'محمد الثاني' })
          .expect(200);

        const translation = await prisma.scholarTranslation.findUnique({
          where: { scholarId_locale: { scholarId, locale: 'ar' } },
        });
        expect(translation?.name).toBe('محمد الثاني');
        // bio was not part of this update, so it must be preserved.
        expect(translation?.bio).toBe('سيرة أولى');
      });

      it('PATCH /admin/scholars/:id snapshots the old locale then syncs the new locale on a mainLanguage change', async () => {
        const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);
        await request(app.getHttpServer())
          .patch(`/admin/scholars/${scholarId}`)
          .set(auth.headers)
          .send({ mainLanguage: 'en', name: 'Muhammad the Second' })
          .expect(200);

        const arTranslation = await prisma.scholarTranslation.findUnique({
          where: { scholarId_locale: { scholarId, locale: 'ar' } },
        });
        expect(arTranslation?.name).toBe('محمد الثاني');

        const enTranslation = await prisma.scholarTranslation.findUnique({
          where: { scholarId_locale: { scholarId, locale: 'en' } },
        });
        expect(enTranslation?.name).toBe('Muhammad the Second');
        expect(enTranslation?.status).toBe('published');
      });

      it('PATCH /admin/scholars/:id leaves translations untouched when no translatable field is sent', async () => {
        const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);
        await request(app.getHttpServer())
          .patch(`/admin/scholars/${scholarId}`)
          .set(auth.headers)
          .send({ isActive: false })
          .expect(200);

        const enTranslation = await prisma.scholarTranslation.findUnique({
          where: { scholarId_locale: { scholarId, locale: 'en' } },
        });
        expect(enTranslation?.name).toBe('Muhammad the Second');
      });
    });

    describe('Listing', () => {
      it('POST /admin/listings mirrors the new listing into a matching ListingTranslation', async () => {
        const auth = await authFactory.createAdminUser([Permission.LISTINGS_CREATE]);
        const res = await request(app.getHttpServer())
          .post('/admin/listings')
          .set(auth.headers)
          .send({
            title: 'عنوان أول',
            slug: `e2e-sync-listing-${crypto.randomUUID()}`,
            format: 'single',
            scholarId: TEST_SCHOLAR_ID,
            language: 'ar',
          })
          .expect(201);
        listingId = res.body.id;

        const translation = await prisma.listingTranslation.findUnique({
          where: { listingId_locale: { listingId, locale: 'ar' } },
        });
        expect(translation?.title).toBe('عنوان أول');
        expect(translation?.status).toBe('published');
      });

      it('PUT /admin/listings/:id/details overwrites the current-locale translation when content changes', async () => {
        const auth = await authFactory.createAdminUser([Permission.LISTINGS_EDIT]);
        await request(app.getHttpServer())
          .put(`/admin/listings/${listingId}/details`)
          .set(auth.headers)
          .send({ title: 'عنوان ثانٍ' })
          .expect(200);

        const translation = await prisma.listingTranslation.findUnique({
          where: { listingId_locale: { listingId, locale: 'ar' } },
        });
        expect(translation?.title).toBe('عنوان ثانٍ');
      });

      it('PUT /admin/listings/:id/details snapshots the old locale then syncs the new locale on a language change', async () => {
        const auth = await authFactory.createAdminUser([Permission.LISTINGS_EDIT]);
        await request(app.getHttpServer())
          .put(`/admin/listings/${listingId}/details`)
          .set(auth.headers)
          .send({ language: 'en', title: 'The Second Title' })
          .expect(200);

        const arTranslation = await prisma.listingTranslation.findUnique({
          where: { listingId_locale: { listingId, locale: 'ar' } },
        });
        expect(arTranslation?.title).toBe('عنوان ثانٍ');

        const enTranslation = await prisma.listingTranslation.findUnique({
          where: { listingId_locale: { listingId, locale: 'en' } },
        });
        expect(enTranslation?.title).toBe('The Second Title');
        expect(enTranslation?.status).toBe('published');
      });
    });
  });
});
