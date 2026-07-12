import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { TEST_SCHOLAR_SLUG, TEST_LISTING_ID, TEST_LISTING_SLUG } from './helpers/seed-test-data';

describe('Public API (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    ({ app } = await createE2eApp());
  });

  afterAll(async () => {
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

  describe('Explore', () => {
    it('GET /explore returns FeedPageDto with items', async () => {
      const res = await request(app.getHttpServer()).get('/explore').expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('GET /explore?limit=5 returns <= 5 items', async () => {
      const res = await request(app.getHttpServer())
        .get('/explore')
        .query({ limit: 5 })
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      const contentItems = res.body.items.filter((item: any) => item.kind === 'single');
      expect(contentItems.length).toBeLessThanOrEqual(5);
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
      expect(res.body).toHaveProperty('name', 'Parent Topic');
    });
  });

  describe('Listings', () => {
    it('GET /listings/{valid-id} returns full listing', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listings/${TEST_LISTING_ID}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', TEST_LISTING_ID);
      expect(res.body).toHaveProperty('slug', TEST_LISTING_SLUG);
      expect(res.body).toHaveProperty('title', 'E2E Test Listing');
      expect(res.body).toHaveProperty('description', 'E2E Listing Description');
    });

    it('GET /listings/invalid-id returns 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/listings/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('message');
    });
  });
});
