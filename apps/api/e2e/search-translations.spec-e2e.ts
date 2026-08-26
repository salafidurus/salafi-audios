import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';

/**
 * Public search must match and rank against translations, not just
 * base-language columns — a query typed in a locale that only exists in a
 * translation (not the original text) must still surface the result, and a
 * scholar's name in search results must resolve to the request locale.
 */
describe('Search across translations (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let scholarId: string;
  let listingId: string;
  // The random marker is only used for slugs (uniqueness/cleanup) — it must
  // never appear inside the Arabic/English display text itself, since a
  // shared substring between the two would let a query match the *base*
  // field's trigram similarity directly, defeating the point of these tests
  // (which is to prove a match can only come from the translation).
  const marker = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const arabicScholarName = 'عالم متخصص في اختبار الترجمة';
  const englishScholarName = 'ZqxvwtrmplkjSearchScholar';
  const arabicTitle = 'عنوان درس اختبار البحث عبر الترجمة';
  const englishTitle = 'FghqbzxvwtSearchListingTitle';

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrismaService);

    const scholar = await prisma.scholar.create({
      data: {
        slug: `e2e-search-trans-scholar-${marker}`,
        name: arabicScholarName,
        mainLanguage: 'ar',
        country: 'SA',
        isActive: true,
      },
    });
    scholarId = scholar.id;

    await prisma.scholarTranslation.create({
      data: { scholarId, locale: 'en', name: englishScholarName, status: 'published' },
    });

    const listing = await prisma.listing.create({
      data: {
        slug: `e2e-search-trans-listing-${marker}`,
        title: arabicTitle,
        format: 'single',
        language: 'ar',
        status: 'published',
        scholarId,
        publishedAt: new Date(),
        durationSeconds: 300,
      },
    });
    listingId = listing.id;

    await prisma.listingTranslation.create({
      data: { listingId, locale: 'en', title: englishTitle, status: 'published' },
    });
  });

  afterAll(async () => {
    await prisma.listing.delete({ where: { id: listingId } });
    await prisma.scholar.delete({ where: { id: scholarId } });
    await app.close();
  });

  it('GET /search/extended finds a listing by its English translation title even though the base title is Arabic', async () => {
    const res = await request(app.getHttpServer())
      .get('/search/extended')
      .query({ q: englishTitle, locale: 'en' })
      .expect(200);

    expect(res.body.singles.some((item: any) => item.id === listingId)).toBe(true);
  });

  it('GET /search/extended finds a listing by its scholar English translation name', async () => {
    const res = await request(app.getHttpServer())
      .get('/search/extended')
      .query({ q: englishScholarName, locale: 'en' })
      .expect(200);

    expect(res.body.singles.some((item: any) => item.id === listingId)).toBe(true);
  });

  it('GET /search/extended resolves scholarName to the request locale', async () => {
    const res = await request(app.getHttpServer())
      .get('/search/extended')
      .query({ q: englishTitle, locale: 'en' })
      .expect(200);

    const found = res.body.singles.find((item: any) => item.id === listingId);
    expect(found?.scholarName).toBe(englishScholarName);
  });

  it('GET /search/extended still resolves scholarName to Arabic (the original) when locale is ar', async () => {
    const res = await request(app.getHttpServer())
      .get('/search/extended')
      .query({ q: arabicTitle, locale: 'ar' })
      .expect(200);

    const found = res.body.singles.find((item: any) => item.id === listingId);
    expect(found?.scholarName).toBe(arabicScholarName);
  });
});
