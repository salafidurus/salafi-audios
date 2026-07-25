process.env.DISABLE_THROTTLER = 'true';

import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { Permission } from '@sd/core-db';
import { TEST_SCHOLAR_ID, TEST_LISTING_ID, seedTestData } from './helpers/seed-test-data';

/**
 * Regression coverage for a bug where the translations array sent from the
 * frontend (CreateListingDto/UpdateListingDetailsDto/CreateScholarDto/
 * UpdateScholarDto all define `translations` as an array of
 * { locale, title|name, description|bio }) was iterated in the repo layer
 * with `Object.entries(dto.translations)`, which only makes sense for a
 * keyed Record. On an array this produces index keys ("0", "1", ...) instead
 * of real locale codes, so every upsert tried to write an invalid `locale`
 * value into a Prisma enum column — throwing and rolling back the whole
 * transaction (create or update) whenever a secondary-locale translation was
 * included.
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
    it('PUT /admin/listings/:id/details with a secondary-locale translation persists it under the correct locale', async () => {
      const auth = await authFactory.createAdminUser([Permission.LISTINGS_EDIT]);

      // Only sending `translations` — title/other fields are left untouched
      // since TEST_LISTING_ID is shared seed data other specs depend on.
      await request(app.getHttpServer())
        .put(`/admin/listings/${TEST_LISTING_ID}/details`)
        .set(auth.headers)
        .send({
          translations: [
            { locale: 'en', title: 'English Translation Title', description: 'English desc' },
          ],
        })
        .expect(200);

      const translation = await prisma.listingTranslation.findUnique({
        where: { listingId_locale: { listingId: TEST_LISTING_ID, locale: 'en' } },
      });

      expect(translation).not.toBeNull();
      expect(translation?.title).toBe('English Translation Title');
      expect(translation?.description).toBe('English desc');

      // Must never have written a row keyed by the array index instead of the locale.
      const badRows = await prisma.listingTranslation.findMany({
        where: { listingId: TEST_LISTING_ID, locale: { notIn: ['en', 'ar'] } },
      });
      expect(badRows).toHaveLength(0);
    });
  });

  describe('Scholar translations', () => {
    it('PATCH /admin/scholars/:id with a secondary-locale translation persists it under the correct locale', async () => {
      const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);

      await request(app.getHttpServer())
        .patch(`/admin/scholars/${TEST_SCHOLAR_ID}`)
        .set(auth.headers)
        .send({
          translations: [{ locale: 'en', name: 'English Scholar Name', bio: 'English bio' }],
        })
        .expect(200);

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
  });
});
