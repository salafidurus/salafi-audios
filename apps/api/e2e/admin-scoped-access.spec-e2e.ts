import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import {
  TEST_SCHOLAR_ID,
  TEST_SCHOLAR_SLUG,
  seedTestData,
  cleanupE2ETestData,
} from './helpers/seed-test-data';

process.env.DISABLE_THROTTLER = 'true';

/**
 * Proves the new resource-scoped ability rules actually restrict access,
 * now that scholar/translator scoped grants are reachable (Stage 3) and
 * routes check them via @CheckPolicy (Stage 4) — this scoping was entirely
 * dead code before this migration, so none of this was previously testable.
 */
describe('Resource-Scoped Access Boundaries (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authFactory: TestAuthFactory;
  let otherScholarId: string;
  let otherListingId: string;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrismaService);
    authFactory = new TestAuthFactory(prisma);
    await seedTestData(prisma);

    const otherScholar = await prisma.scholar.create({
      data: {
        slug: `e2e-other-scholar-${crypto.randomUUID()}`,
        name: 'Other Scholar',
        country: 'SA',
        mainLanguage: 'ar',
      },
    });
    otherScholarId = otherScholar.id;

    const otherListing = await prisma.listing.create({
      data: {
        scholarId: otherScholarId,
        slug: `e2e-other-listing-${crypto.randomUUID()}`,
        title: 'Other Scholar Listing',
        format: 'single',
        status: 'draft',
      },
    });
    otherListingId = otherListing.id;
  });

  afterAll(async () => {
    await prisma.listing.deleteMany({ where: { id: otherListingId } });
    await prisma.scholar.deleteMany({ where: { id: otherScholarId } });
    await cleanupE2ETestData(prisma);
    await authFactory.cleanup();
    await app.close();
  });

  describe('scholar-scoped editor (OWN_CONTENT on the seeded test scholar)', () => {
    it('can update their own scholar', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');
      await request(app.getHttpServer())
        .patch(`/admin/scholars/${TEST_SCHOLAR_ID}`)
        .set(auth.headers)
        .send({ name: 'Updated By Scoped Editor' })
        .expect(200);
    });

    it('cannot update a different scholar (cross-scholar denial)', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');
      await request(app.getHttpServer())
        .patch(`/admin/scholars/${otherScholarId}`)
        .set(auth.headers)
        .send({ name: 'Attempted Update' })
        .expect(403);
    });

    it('cannot update a listing belonging to a different scholar (cross-scholar denial)', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');
      await request(app.getHttpServer())
        .put(`/admin/listings/${otherListingId}/details`)
        .set(auth.headers)
        .send({ title: 'Attempted Title Update' })
        .expect(403);
    });

    it('GET /admin/scholars only returns their linked scholar, not every scholar', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');
      const res = await request(app.getHttpServer())
        .get('/admin/scholars')
        .set(auth.headers)
        .expect(200);

      const ids: string[] = res.body.items.map((s: { id: string }) => s.id);
      expect(ids).toContain(TEST_SCHOLAR_ID);
      expect(ids).not.toContain(otherScholarId);
    });

    it('GET /admin/listings only returns listings for their linked scholar', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');
      const res = await request(app.getHttpServer())
        .get('/admin/listings')
        .set(auth.headers)
        .expect(200);

      const scholarSlugs: string[] = res.body.items.map(
        (l: { scholarSlug: string }) => l.scholarSlug,
      );
      expect(scholarSlugs.length).toBeGreaterThan(0);
      expect(scholarSlugs.every((slug) => slug === TEST_SCHOLAR_SLUG)).toBe(true);
    });
  });

  describe('ASSIGNED_EDITOR scholar scope (edit-only, no publish/archive)', () => {
    it('can update but cannot publish a listing for their assigned scholar', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'ASSIGNED_EDITOR');
      const listing = await prisma.listing.create({
        data: {
          scholarId: TEST_SCHOLAR_ID,
          slug: `e2e-assigned-editor-listing-${crypto.randomUUID()}`,
          title: 'Assigned Editor Listing',
          format: 'single',
          status: 'draft',
        },
      });

      try {
        await request(app.getHttpServer())
          .put(`/admin/listings/${listing.id}/details`)
          .set(auth.headers)
          .send({ title: 'Edited By Assigned Editor' })
          .expect(200);

        await request(app.getHttpServer())
          .post(`/admin/listings/${listing.id}/publish`)
          .set(auth.headers)
          .expect(403);
      } finally {
        await prisma.listing.deleteMany({ where: { id: listing.id } });
      }
    });
  });

  describe('locale-scoped translator (all scholars, ar only)', () => {
    it('can publish an Arabic scholar translation but not an English one', async () => {
      const auth = await authFactory.createTranslatorScopedUser(['ar'], { canPublish: true });

      await prisma.scholarTranslation.upsert({
        where: { scholarId_locale: { scholarId: TEST_SCHOLAR_ID, locale: 'ar' } },
        create: { scholarId: TEST_SCHOLAR_ID, locale: 'ar', name: 'اسم عربي' },
        update: {},
      });
      await prisma.scholarTranslation.upsert({
        where: { scholarId_locale: { scholarId: TEST_SCHOLAR_ID, locale: 'en' } },
        create: { scholarId: TEST_SCHOLAR_ID, locale: 'en', name: 'English Name' },
        update: {},
      });

      await request(app.getHttpServer())
        .post(`/scholars/${TEST_SCHOLAR_ID}/translations/ar/publish`)
        .set(auth.headers)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/scholars/${TEST_SCHOLAR_ID}/translations/en/publish`)
        .set(auth.headers)
        .expect(403);
    });
  });

  describe('scholar-scoped translator (one scholar, ar only)', () => {
    it('can act on their scholar’s Arabic translation but not another scholar’s', async () => {
      const auth = await authFactory.createTranslatorScopedUser(['ar'], {
        scholarId: TEST_SCHOLAR_ID,
        canPublish: false,
      });

      await request(app.getHttpServer())
        .patch(`/scholars/${TEST_SCHOLAR_ID}/translations/ar`)
        .set(auth.headers)
        .send({ name: 'محدث' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/scholars/${otherScholarId}/translations/ar`)
        .set(auth.headers)
        .send({ name: 'Attempted' })
        .expect(403);
    });
  });

  describe('topic translations stay global-only regardless of scholar/translator scope', () => {
    it('a scholar-scoped editor cannot edit topic translations without a global TRANSLATIONS permission', async () => {
      const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');
      const topic = await prisma.topic.create({
        data: { slug: `e2e-scope-topic-${crypto.randomUUID()}`, name: 'Scope Test Topic' },
      });

      try {
        await request(app.getHttpServer())
          .post(`/topics/${topic.id}/translations`)
          .set(auth.headers)
          .send({ locale: 'ar', name: 'اسم الموضوع' })
          .expect(403);
      } finally {
        await prisma.topic.deleteMany({ where: { id: topic.id } });
      }
    });
  });
});
