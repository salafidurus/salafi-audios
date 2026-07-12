process.env.DISABLE_THROTTLER = 'true';

import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/shared/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { Permission } from '@sd/core-db';
import { TEST_SCHOLAR_ID, TEST_LISTING_ID } from './helpers/seed-test-data';

describe('Admin Permission Boundaries (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authFactory: TestAuthFactory;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrismaService);
    authFactory = new TestAuthFactory(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Content (Listings) Permissions', () => {
    it('1. POST /admin/listings without LISTINGS_CREATE -> 403', async () => {
      const auth = await authFactory.createAdminUser([]); // no permissions
      await request(app.getHttpServer())
        .post('/admin/listings')
        .set(auth.headers)
        .send({
          title: 'E2E Testing Create No Perm',
          format: 'single',
          scholarId: TEST_SCHOLAR_ID,
        })
        .expect(403);
    });

    it('2. POST /admin/listings with LISTINGS_CREATE -> 201 success', async () => {
      const auth = await authFactory.createAdminUser([Permission.LISTINGS_CREATE]);
      const uniqueSlug = `e2e-listing-${crypto.randomUUID()}`;
      const res = await request(app.getHttpServer())
        .post('/admin/listings')
        .set(auth.headers)
        .send({
          title: 'E2E Valid New Listing',
          slug: uniqueSlug,
          format: 'single',
          scholarId: TEST_SCHOLAR_ID,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'E2E Valid New Listing');
    });

    it('3. POST /admin/listings/:id/publish without LISTINGS_PUBLISH -> 403', async () => {
      const auth = await authFactory.createAdminUser([]);
      await request(app.getHttpServer())
        .post(`/admin/listings/${TEST_LISTING_ID}/publish`)
        .set(auth.headers)
        .expect(403);
    });
  });

  describe('Scholars Permissions', () => {
    it('4. POST /admin/scholars without SCHOLARS_CREATE -> 403', async () => {
      const auth = await authFactory.createAdminUser([]);
      await request(app.getHttpServer())
        .post('/admin/scholars')
        .set(auth.headers)
        .send({
          name: 'Forbidden Scholar',
          slug: 'forbidden-scholar-slug',
          country: 'Saudi Arabia',
          mainLanguage: 'ar',
        })
        .expect(403);
    });

    it('5. PATCH /admin/scholars/:id without SCHOLARS_EDIT -> 403', async () => {
      const auth = await authFactory.createAdminUser([]);
      await request(app.getHttpServer())
        .patch(`/admin/scholars/${TEST_SCHOLAR_ID}`)
        .set(auth.headers)
        .send({
          name: 'Updated Name Without Permission',
        })
        .expect(403);
    });
  });

  describe('Topics Permissions', () => {
    it('6. POST /admin/topics without TOPICS_CREATE -> 403', async () => {
      const auth = await authFactory.createAdminUser([]);
      await request(app.getHttpServer())
        .post('/admin/topics')
        .set(auth.headers)
        .send({
          slug: 'no-perm-topic',
          name: 'No Perm Topic',
        })
        .expect(403);
    });

    it('7. DELETE /admin/topics/:slug without TOPICS_DELETE -> 403', async () => {
      const auth = await authFactory.createAdminUser([]);
      await request(app.getHttpServer())
        .delete('/admin/topics/e2e-parent-topic')
        .set(auth.headers)
        .expect(403);
    });
  });

  describe('User Admin Permissions', () => {
    it('8. POST /admin/permissions/:userId/permissions without USERS_GRANT_PERMISSIONS -> 403', async () => {
      const auth = await authFactory.createAdminUser([]);
      const targetUser = await authFactory.createUser();

      await request(app.getHttpServer())
        .post(`/admin/permissions/${targetUser.user.id}/permissions`)
        .set(auth.headers)
        .send({
          permission: Permission.SCHOLARS_CREATE,
        })
        .expect(403);
    });

    it('9. POST /admin/permissions/:userId/permissions with USERS_GRANT_PERMISSIONS -> 201 success', async () => {
      const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_PERMISSIONS]);
      const targetUser = await authFactory.createUser();

      await request(app.getHttpServer())
        .post(`/admin/permissions/${targetUser.user.id}/permissions`)
        .set(auth.headers)
        .send({
          permission: Permission.SCHOLARS_CREATE,
        })
        .expect(201);

      // Verify permission was granted in DB
      const hasPermission = await prisma.userPermission.findUnique({
        where: {
          userId_permission: {
            userId: targetUser.user.id,
            permission: Permission.SCHOLARS_CREATE,
          },
        },
      });
      expect(hasPermission).toBeTruthy();
    });
  });

  describe('Cross-isolation Boundary Strictness', () => {
    it('10. User with SCHOLARS_EDIT but not LISTINGS_EDIT -> 403 on updating listing metadata (PUT /admin/listings/:id)', async () => {
      const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);
      await request(app.getHttpServer())
        .put(`/admin/listings/${TEST_LISTING_ID}`)
        .set(auth.headers)
        .send({
          title: 'Attempted Title Update',
        })
        .expect(403);
    });

    it('11. User with LISTINGS_CREATE but not SCHOLARS_CREATE -> 403 on creating scholar (POST /admin/scholars)', async () => {
      const auth = await authFactory.createAdminUser([Permission.LISTINGS_CREATE]);
      await request(app.getHttpServer())
        .post('/admin/scholars')
        .set(auth.headers)
        .send({
          name: 'Attempted Scholar',
          slug: 'attempted-scholar-slug',
          country: 'Saudi Arabia',
          mainLanguage: 'ar',
        })
        .expect(403);
    });

    it('12. User with TOPICS_CREATE but not USERS_GRANT_PERMISSIONS -> 403 on granting permission', async () => {
      const auth = await authFactory.createAdminUser([Permission.TOPICS_CREATE]);
      const targetUser = await authFactory.createUser();

      await request(app.getHttpServer())
        .post(`/admin/permissions/${targetUser.user.id}/permissions`)
        .set(auth.headers)
        .send({
          permission: Permission.SCHOLARS_CREATE,
        })
        .expect(403);
    });
  });
});
