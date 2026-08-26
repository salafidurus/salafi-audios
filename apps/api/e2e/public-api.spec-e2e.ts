import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';
import {
  TEST_SCHOLAR_ID,
  TEST_SCHOLAR_SLUG,
  TEST_LISTING_ID,
  TEST_LISTING_SLUG,
  seedTestData,
  cleanupE2ETestData,
} from './helpers/seed-test-data';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { PrismaService } from '../src/core/db/prisma.service';

describe('Public API (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authFactory: TestAuthFactory;

  beforeAll(async () => {
    ({ app } = await createE2eApp());
    prisma = app.get(PrismaService);
    authFactory = new TestAuthFactory(prisma);
    await seedTestData(prisma);
  });

  afterAll(async () => {
    await cleanupE2ETestData(prisma);
    await authFactory.cleanup();
    await app.close();
  });

  describe('Search', () => {
    it('GET /search?q={valid} returns results', async () => {
      const res = await request(app.getHttpServer()).get('/search').query({ q: 'E2E' }).expect(200);

      expect(res.body).toHaveProperty('collections');
      expect(res.body).toHaveProperty('series');
      expect(res.body).toHaveProperty('singles');
      expect(Array.isArray(res.body.collections)).toBe(true);
      expect(Array.isArray(res.body.series)).toBe(true);
      expect(Array.isArray(res.body.singles)).toBe(true);
      expect(res.body.singles.length).toBeGreaterThanOrEqual(1);
      expect(res.body.singles[0].title).toContain('E2E');
    });

    it('GET /search?q=nonexistent returns empty lists', async () => {
      const res = await request(app.getHttpServer())
        .get('/search')
        .query({ q: 'nonexistentquerythatshouldnotmatchanything' })
        .expect(200);

      expect(res.body).toHaveProperty('collections');
      expect(res.body).toHaveProperty('series');
      expect(res.body).toHaveProperty('singles');
      expect(res.body.collections).toEqual([]);
      expect(res.body.series).toEqual([]);
      expect(res.body.singles).toEqual([]);
    });
  });

  describe('Listings - Recent Feed', () => {
    it('GET /listings/recent returns FeedPageDto with items', async () => {
      const res = await request(app.getHttpServer()).get('/listings/recent').expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      // Should return mixed format items (single, series, collection)
      const kinds = res.body.items.map((item: any) => item.kind);
      expect(kinds.some((k: string) => k === 'single')).toBe(true);
    });

    it('GET /listings/recent?limit=5 returns <= 5 items', async () => {
      const res = await request(app.getHttpServer())
        .get('/listings/recent')
        .query({ limit: 5 })
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Scholars', () => {
    it('GET /scholars returns list wrapped in an object', async () => {
      const res = await request(app.getHttpServer()).get('/scholars').expect(200);

      expect(res.body).toHaveProperty('scholars');
      expect(Array.isArray(res.body.scholars)).toBe(true);
      const testScholar = res.body.scholars.find((s: any) => s.slug === TEST_SCHOLAR_SLUG);
      expect(testScholar).toBeDefined();
    });

    it('GET /scholars/{valid-slug} returns detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/scholars/${TEST_SCHOLAR_SLUG}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('slug', TEST_SCHOLAR_SLUG);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('bio');
      expect(res.body).toHaveProperty('country');
      expect(res.body).toHaveProperty('isActive');
      expect(res.body).toHaveProperty('lectureCount');
      expect(res.body).toHaveProperty('seriesCount');
    });
  });

  describe('Topics', () => {
    it('GET /topics returns array', async () => {
      const res = await request(app.getHttpServer()).get('/topics').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const testTopic = res.body.find((t: any) => t.slug === 'e2e-parent-topic');
      expect(testTopic).toBeDefined();
    });

    it('GET /topics/{valid-slug} returns detail', async () => {
      const res = await request(app.getHttpServer()).get('/topics/e2e-parent-topic').expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('slug', 'e2e-parent-topic');
      // Arabic is the main language for topics; this fixture has no Arabic
      // translation, so its (English-authored) base content surfaces as `ar`.
      expect(res.body.name).toEqual({ ar: 'Parent Topic' });
    });
  });

  describe('Listings', () => {
    it('GET /listings/{valid-slug} returns full listing', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listings/${TEST_LISTING_SLUG}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', TEST_LISTING_ID);
      expect(res.body).toHaveProperty('slug', TEST_LISTING_SLUG);
      expect(res.body).toHaveProperty('title', 'E2E Test Listing');
      expect(res.body).toHaveProperty('description', 'E2E Listing Description');
    });

    it('projects scholar, topics, ancestry, and playable content in one payload', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listings/${TEST_LISTING_SLUG}`)
        .expect(200);

      expect(res.body.scholar).toMatchObject({
        id: TEST_SCHOLAR_ID,
        slug: TEST_SCHOLAR_SLUG,
        name: 'E2E Test Scholar',
      });
      expect(Array.isArray(res.body.topics)).toBe(true);
      // Top-level single: no series context and no root listing ancestor.
      expect(res.body.seriesContext).toBeNull();
      expect(res.body.rootListing).toBeNull();
      expect(res.body.primaryAudioAsset).toBeNull();
    });

    it('GET /listings/invalid-id returns 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/listings/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Listings — slug-only catalog identity', () => {
    const DRAFT_SLUG = 'e2e-draft-listing';
    const ARCHIVED_SLUG = 'e2e-archived-listing';

    beforeAll(async () => {
      await prisma.listing.createMany({
        data: [
          {
            id: crypto.randomUUID(),
            slug: DRAFT_SLUG,
            title: 'E2E Draft Listing',
            format: 'single',
            language: 'ar',
            status: 'draft',
            scholarId: TEST_SCHOLAR_ID,
          },
          {
            id: crypto.randomUUID(),
            slug: ARCHIVED_SLUG,
            title: 'E2E Archived Listing',
            format: 'single',
            language: 'ar',
            status: 'archived',
            scholarId: TEST_SCHOLAR_ID,
          },
        ],
      });
    });

    afterAll(async () => {
      await prisma.listing.deleteMany({
        where: { slug: { in: [DRAFT_SLUG, ARCHIVED_SLUG] } },
      });
    });

    it('returns 404 for unknown slugs on every public read route', async () => {
      const server = app.getHttpServer();

      await request(server).get('/listings/no-such-listing').expect(404);
      await request(server).get('/listings/no-such-listing/contents').expect(404);
      // Related resolves as an empty surface rather than leaking existence.
      const related = await request(server).get('/listings/no-such-listing/related').expect(200);
      expect(related.body).toEqual([]);
    });

    it('resolves ID-shaped route values as not found with no internal-ID fallback', async () => {
      const auth = await authFactory.createUser();
      const server = app.getHttpServer();

      // TEST_LISTING_ID exists as an internal id — it must still not resolve.
      await request(server).get(`/listings/${TEST_LISTING_ID}`).expect(404);
      await request(server).get(`/listings/${TEST_LISTING_ID}/contents`).expect(404);
      await request(server).get(`/audio/listings/${TEST_LISTING_ID}/stream`).expect(404);
      await request(server)
        .post(`/me/my-library/save/${TEST_LISTING_ID}`)
        .set(auth.headers)
        .expect(404);
      await request(server)
        .put(`/audio/progress/${TEST_LISTING_ID}`)
        .set(auth.headers)
        .send({ positionSeconds: 30 })
        .expect(404);

      // Protected reads resolve as not found without exposing existence.
      const lastPlayed = await request(server)
        .get(`/listings/${TEST_LISTING_ID}/last-played`)
        .set(auth.headers)
        .expect(200);
      expect(lastPlayed.text).toBe('null');

      const summary = await request(server)
        .get(`/listings/${TEST_LISTING_ID}/progress-summary`)
        .set(auth.headers)
        .expect(200);
      expect(summary.text).toBe('null');
    });

    it('excludes unpublished and archived listings from public discovery', async () => {
      const server = app.getHttpServer();

      await request(server).get(`/listings/${DRAFT_SLUG}`).expect(404);
      await request(server).get(`/listings/${ARCHIVED_SLUG}`).expect(404);
      await request(server).get(`/listings/${DRAFT_SLUG}/contents`).expect(404);
      await request(server).get(`/listings/${ARCHIVED_SLUG}/contents`).expect(404);
      // Stream resolution is public discovery too.
      await request(server).get(`/audio/listings/${DRAFT_SLUG}/stream`).expect(404);
      await request(server).get(`/audio/listings/${ARCHIVED_SLUG}/stream`).expect(404);

      const feed = await request(server).get('/listings/recent').expect(200);
      const feedSlugs = feed.body.items.map((item: { slug: string }) => item.slug);
      expect(feedSlugs).not.toContain(DRAFT_SLUG);
      expect(feedSlugs).not.toContain(ARCHIVED_SLUG);
    });
  });

  describe('Listings — approved Locale presentation', () => {
    afterAll(async () => {
      // Remove the translation this suite created (cleanupE2ETestData also
      // clears listing translations, but ordering makes that unreliable here).
      await prisma.listingTranslation.deleteMany({ where: { listingId: TEST_LISTING_ID } });
      const cache = app.get<Cache>(CACHE_MANAGER);
      for (const locale of SUPPORTED_LOCALES) {
        await cache.del(`/listings/${TEST_LISTING_SLUG}:${locale}`);
      }
    });

    it('serves base fields when the locale has no published translation', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listings/${TEST_LISTING_SLUG}`)
        .set({ 'Accept-Language': 'en' })
        .expect(200);

      expect(res.body.title).toBe('E2E Test Listing');
      expect(res.body.originalLanguage).toBe('ar');
      expect(res.body.original).toBeUndefined();
    });

    it('applies an approved translation and exposes the original block', async () => {
      // The previous assertion cached this URL+locale pair before any
      // translation existed — drop it so the approved translation is read.
      const cache = app.get<Cache>(CACHE_MANAGER);
      await cache.del(`/listings/${TEST_LISTING_SLUG}:en`);

      await prisma.listingTranslation.upsert({
        where: { listingId_locale: { listingId: TEST_LISTING_ID, locale: 'en' } },
        update: { title: 'E2E Translated Listing', status: 'published' },
        create: {
          listingId: TEST_LISTING_ID,
          locale: 'en',
          title: 'E2E Translated Listing',
          status: 'published',
        },
      });

      try {
        const res = await request(app.getHttpServer())
          .get(`/listings/${TEST_LISTING_SLUG}`)
          .set({ 'Accept-Language': 'en' })
          .expect(200);

        expect(res.body.title).toBe('E2E Translated Listing');
        // Fields the translation omits fall back to base content.
        expect(res.body.description).toBe('E2E Listing Description');
        expect(res.body.originalLanguage).toBe('ar');
        expect(res.body.original?.title).toBe('E2E Test Listing');
      } finally {
        await prisma.listingTranslation.deleteMany({ where: { listingId: TEST_LISTING_ID } });
        const cache = app.get<Cache>(CACHE_MANAGER);
        for (const locale of SUPPORTED_LOCALES) {
          await cache.del(`/listings/${TEST_LISTING_SLUG}:${locale}`);
        }
      }
    });
  });
});
