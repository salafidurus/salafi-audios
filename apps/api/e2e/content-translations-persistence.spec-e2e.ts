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
    let topicSlug: string;

    afterAll(async () => {
      if (scholarId) await prisma.scholar.delete({ where: { id: scholarId } });
      if (listingId) await prisma.listing.delete({ where: { id: listingId } });
      if (topicSlug) await prisma.topic.delete({ where: { slug: topicSlug } });
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

    describe('Topic (Arabic is always the main language)', () => {
      it('POST /admin/topics mirrors the new topic into a matching Arabic TopicTranslation', async () => {
        const auth = await authFactory.createAdminUser([Permission.TOPICS_CREATE]);
        topicSlug = `e2e-sync-topic-${crypto.randomUUID()}`;
        await request(app.getHttpServer())
          .post('/admin/topics')
          .set(auth.headers)
          .send({ slug: topicSlug, name: { ar: 'موضوع أول' } })
          .expect(201);

        const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });
        expect(topic?.name).toBe('موضوع أول');

        const translation = await prisma.topicTranslation.findUnique({
          where: { topicId_locale: { topicId: topic!.id, locale: 'ar' } },
        });
        expect(translation?.name).toBe('موضوع أول');
      });

      it('PUT /admin/topics/:slug keeps the Arabic translation in sync when content changes', async () => {
        const auth = await authFactory.createAdminUser([Permission.TOPICS_EDIT]);
        await request(app.getHttpServer())
          .put(`/admin/topics/${topicSlug}`)
          .set(auth.headers)
          .send({ name: { ar: 'موضوع محدث' } })
          .expect(200);

        const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });
        expect(topic?.name).toBe('موضوع محدث');

        const translation = await prisma.topicTranslation.findUnique({
          where: { topicId_locale: { topicId: topic!.id, locale: 'ar' } },
        });
        expect(translation?.name).toBe('موضوع محدث');
      });
    });
  });

  /**
   * Admin list views must resolve display fields to the request locale (like
   * the public list already does) and must be searchable across translations,
   * not just base-language columns.
   */
  describe('Admin display-locale resolution', () => {
    let scholarId: string;
    let listingId: string;

    afterAll(async () => {
      if (scholarId) await prisma.scholar.delete({ where: { id: scholarId } });
      if (listingId) await prisma.listing.delete({ where: { id: listingId } });
    });

    it('GET /admin/scholars resolves name and bio to the request locale and searches across translations', async () => {
      const marker = crypto.randomUUID().slice(0, 8);
      const createAuth = await authFactory.createAdminUser([Permission.SCHOLARS_CREATE]);
      const createRes = await request(app.getHttpServer())
        .post('/admin/scholars')
        .set(createAuth.headers)
        .send({
          name: `اسم عربي ${marker}`,
          bio: `سيرة عربية ${marker}`,
          slug: `e2e-admin-locale-scholar-${marker}`,
          mainLanguage: 'ar',
          country: 'SA',
        })
        .expect(201);
      scholarId = createRes.body.id;

      const translateAuth = await authFactory.createAdminUser([
        Permission.TRANSLATIONS_CREATE,
        Permission.TRANSLATIONS_PUBLISH,
      ]);
      await request(app.getHttpServer())
        .post(`/scholars/${scholarId}/translations`)
        .set(translateAuth.headers)
        .send({ locale: 'en', name: `English Name ${marker}`, bio: `English Bio ${marker}` })
        .expect(201);
      await request(app.getHttpServer())
        .post(`/scholars/${scholarId}/translations/en/publish`)
        .set(translateAuth.headers)
        .expect(201);

      const viewAuth = await authFactory.createAdminUser([Permission.SCHOLARS_VIEW]);
      const listRes = await request(app.getHttpServer())
        .get('/admin/scholars?locale=en')
        .set(viewAuth.headers)
        .expect(200);
      const found = listRes.body.items.find((s: any) => s.id === scholarId);
      expect(found?.name).toBe(`English Name ${marker}`);
      expect(found?.bio).toBe(`English Bio ${marker}`);

      const searchRes = await request(app.getHttpServer())
        .get(`/admin/scholars?search=${encodeURIComponent(`English Name ${marker}`)}`)
        .set(viewAuth.headers)
        .expect(200);
      expect(searchRes.body.items.some((s: any) => s.id === scholarId)).toBe(true);
    });

    it('GET /admin/listings resolves title/scholarName to the request locale, case-insensitively, and searches across translations', async () => {
      const marker = crypto.randomUUID().slice(0, 8);
      const createAuth = await authFactory.createAdminUser([Permission.LISTINGS_CREATE]);
      const createRes = await request(app.getHttpServer())
        .post('/admin/listings')
        .set(createAuth.headers)
        .send({
          title: `عنوان عربي ${marker}`,
          slug: `e2e-admin-locale-listing-${marker}`,
          format: 'single',
          scholarId: TEST_SCHOLAR_ID,
          language: 'ar',
        })
        .expect(201);
      listingId = createRes.body.id;

      const translateAuth = await authFactory.createAdminUser([
        Permission.TRANSLATIONS_CREATE,
        Permission.TRANSLATIONS_PUBLISH,
      ]);
      await request(app.getHttpServer())
        .post(`/listings/${listingId}/translations`)
        .set(translateAuth.headers)
        .send({ locale: 'en', title: `English Title ${marker}` })
        .expect(201);
      await request(app.getHttpServer())
        .post(`/listings/${listingId}/translations/en/publish`)
        .set(translateAuth.headers)
        .expect(201);

      const viewAuth = await authFactory.createAdminUser([Permission.LISTINGS_VIEW]);
      const listRes = await request(app.getHttpServer())
        .get('/admin/listings?locale=en')
        .set(viewAuth.headers)
        .expect(200);
      const found = listRes.body.items.find((l: any) => l.id === listingId);
      expect(found?.title).toBe(`English Title ${marker}`);

      // Case-insensitive base-field search.
      const caseInsensitiveRes = await request(app.getHttpServer())
        .get(`/admin/listings?search=${encodeURIComponent(`عنوان عربي ${marker}`.toUpperCase())}`)
        .set(viewAuth.headers)
        .expect(200);
      expect(caseInsensitiveRes.body.items.some((l: any) => l.id === listingId)).toBe(true);

      // Translation search — the English title text doesn't appear anywhere
      // in the base (Arabic) columns.
      const searchRes = await request(app.getHttpServer())
        .get(`/admin/listings?search=${encodeURIComponent(`English Title ${marker}`)}`)
        .set(viewAuth.headers)
        .expect(200);
      expect(searchRes.body.items.some((l: any) => l.id === listingId)).toBe(true);
    });
  });
});
