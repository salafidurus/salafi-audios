process.env.DISABLE_THROTTLER = 'true';

import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';

describe('Authentication (e2e)', () => {
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

  describe('Unauthenticated Request Handling', () => {
    it('No auth header on protected route should return 401', async () => {
      await request(app.getHttpServer()).get('/account/profile').expect(401);
    });

    it('Invalid token on protected route should return 401', async () => {
      await request(app.getHttpServer())
        .get('/account/profile')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);
    });
  });

  describe('Public Route Accessibility', () => {
    it('GET /scholars does not require authentication and returns 200', async () => {
      await request(app.getHttpServer()).get('/scholars').expect(200);
    });

    it('GET /health does not require authentication and returns 200', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);
    });
  });

  describe('Authenticated Operations', () => {
    it('GET /account/profile with valid token returns 200 and profile info', async () => {
      const auth = await authFactory.createUser();
      const res = await request(app.getHttpServer())
        .get('/account/profile')
        .set(auth.headers)
        .expect(200);

      expect(res.body).toHaveProperty('id', auth.user.id);
      expect(res.body).toHaveProperty('email', auth.user.email);
    });

    it('PATCH /account/profile with valid token updates displayName and returns 200', async () => {
      const auth = await authFactory.createUser();
      const updatedName = 'Updated Test User Name';
      const res = await request(app.getHttpServer())
        .patch('/account/profile')
        .set(auth.headers)
        .send({ displayName: updatedName })
        .expect(200);

      expect(res.body).toHaveProperty('displayName', updatedName);

      // Verify DB change
      const dbUser = await prisma.user.findUnique({
        where: { id: auth.user.id },
      });
      expect(dbUser?.name).toBe(updatedName);
    });
  });

  describe('Banned Users Gating', () => {
    it('Banned user should receive 403 Forbidden on protected routes', async () => {
      const auth = await authFactory.createUser();

      // Directly update user to be banned
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { banned: true, banExpires: null },
      });

      await request(app.getHttpServer()).get('/account/profile').set(auth.headers).expect(403);
    });
  });

  describe('User Account Deletion & Subsequent Auth', () => {
    it('DELETE /account should delete user account, and subsequent calls should return 401', async () => {
      const auth = await authFactory.createUser();

      // Delete the account
      await request(app.getHttpServer()).delete('/account').set(auth.headers).expect(200);

      // Verify subsequent request with the same token fails with 401
      await request(app.getHttpServer()).get('/account/profile').set(auth.headers).expect(401);
    });
  });
});
