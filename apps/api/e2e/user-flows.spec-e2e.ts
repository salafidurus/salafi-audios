import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrimaryDbService } from '../src/core/db/primary-db.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import {
  TEST_LISTING_ID,
  TEST_LISTING_SLUG,
  seedTestData,
  cleanupE2ETestData,
} from './helpers/seed-test-data';

describe('Core User Flows (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrimaryDbService;
  let authFactory: TestAuthFactory;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrimaryDbService);
    authFactory = new TestAuthFactory(prisma);
    await seedTestData(prisma);
  });

  afterAll(async () => {
    await cleanupE2ETestData(prisma);
    await authFactory.cleanup();
    await app.close();
  });

  describe('MyLibrary Operations', () => {
    it('POST /me/my-library/save/:listingId -> 201 (idempotent)', async () => {
      const auth = await authFactory.createUser();
      // First save
      await request(app.getHttpServer())
        .post(`/v1/me/my-library/save/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .expect(201);

      // Second save (should be idempotent, i.e., return 201/200 and not error)
      await request(app.getHttpServer())
        .post(`/v1/me/my-library/save/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .expect(201);
    });

    it('GET /me/my-library/saved -> listing appears', async () => {
      const auth = await authFactory.createUser();

      // Save it first
      await request(app.getHttpServer())
        .post(`/v1/me/my-library/save/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .expect(201);

      // Fetch saved
      const res = await request(app.getHttpServer())
        .get('/v1/me/my-library/saved')
        .set(auth.headers)
        .expect(200);

      expect(res.body.items).toBeDefined();
      const listingIds = res.body.items.map((item: any) => item.listingId);
      expect(listingIds).toContain(TEST_LISTING_ID);
    });

    it('DELETE /me/my-library/save/:listingId -> 200, listing removed', async () => {
      const auth = await authFactory.createUser();

      // Save it first
      await request(app.getHttpServer())
        .post(`/v1/me/my-library/save/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .expect(201);

      // Unsave it
      await request(app.getHttpServer())
        .delete(`/v1/me/my-library/save/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .expect(200);

      // Fetch saved again, should not contain it
      const res = await request(app.getHttpServer())
        .get('/v1/me/my-library/saved')
        .set(auth.headers)
        .expect(200);

      const listingIds = res.body.items.map((item: any) => item.listingId);
      expect(listingIds).not.toContain(TEST_LISTING_ID);
    });
  });

  describe('Progress Operations', () => {
    it('PUT /audio/progress/:listingId -> upserts', async () => {
      const auth = await authFactory.createUser();

      // Send progress update
      await request(app.getHttpServer())
        .put(`/v1/audio/progress/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .send({
          positionSeconds: 120,
          durationSeconds: 300,
        })
        .expect(200);

      // Verify in DB directly
      const progress = await prisma.userListingProgress.findFirst({
        where: {
          userId: auth.user.id,
          listingId: TEST_LISTING_ID,
        },
      });
      expect(progress).toBeDefined();
      expect(progress?.positionSeconds).toBe(120);
    });

    it('GET /audio/progress -> returns delta', async () => {
      const auth = await authFactory.createUser();

      // Create a progress record
      await request(app.getHttpServer())
        .put(`/v1/audio/progress/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .send({
          positionSeconds: 50,
          durationSeconds: 300,
        })
        .expect(200);

      // Get progress
      const res = await request(app.getHttpServer())
        .get('/v1/audio/progress')
        .set(auth.headers)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      const matched = res.body.find((p: any) => p.listingSlug === TEST_LISTING_SLUG);
      expect(matched).toBeDefined();
      expect(matched.positionSeconds).toBe(50);

      // Get progress with since set to the future
      const futureTime = new Date(Date.now() + 60000).toISOString();
      const resFuture = await request(app.getHttpServer())
        .get(`/v1/audio/progress?since=${futureTime}`)
        .set(auth.headers)
        .expect(200);
      expect(resFuture.body).toBeInstanceOf(Array);
      expect(resFuture.body.find((p: any) => p.listingSlug === TEST_LISTING_SLUG)).toBeUndefined();
    });

    it('PUT /audio/progress/:listingId with isCompleted: true -> marks done', async () => {
      const auth = await authFactory.createUser();

      await request(app.getHttpServer())
        .put(`/v1/audio/progress/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .send({
          positionSeconds: 300,
          durationSeconds: 300,
          isCompleted: true,
        })
        .expect(200);

      const progress = await prisma.userListingProgress.findFirst({
        where: {
          userId: auth.user.id,
          listingId: TEST_LISTING_ID,
        },
      });
      expect(progress?.isCompleted).toBe(true);
    });

    it('GET /me/my-library/completed -> completed listing appears', async () => {
      const auth = await authFactory.createUser();

      // Mark completed
      await request(app.getHttpServer())
        .put(`/v1/audio/progress/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .send({
          positionSeconds: 300,
          durationSeconds: 300,
          isCompleted: true,
        })
        .expect(200);

      // Get completed listings
      const res = await request(app.getHttpServer())
        .get('/v1/me/my-library/completed')
        .set(auth.headers)
        .expect(200);

      expect(res.body.items).toBeDefined();
      const listingIds = res.body.items.map((item: any) => item.listingId);
      expect(listingIds).toContain(TEST_LISTING_ID);
    });

    it('GET /me/my-library/progress -> in-progress listing appears', async () => {
      const auth = await authFactory.createUser();

      // Update progress, but not completed
      await request(app.getHttpServer())
        .put(`/v1/audio/progress/${TEST_LISTING_SLUG}`)
        .set(auth.headers)
        .send({
          positionSeconds: 150,
          durationSeconds: 300,
          isCompleted: false,
        })
        .expect(200);

      // Get progress library list
      const res = await request(app.getHttpServer())
        .get('/v1/me/my-library/progress')
        .set(auth.headers)
        .expect(200);

      expect(res.body.items).toBeDefined();
      const listingIds = res.body.items.map((item: any) => item.listingId);
      expect(listingIds).toContain(TEST_LISTING_ID);
    });
  });
});
