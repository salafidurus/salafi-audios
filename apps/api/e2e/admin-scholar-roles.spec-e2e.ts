import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { Permission } from '@sd/core-db';
import {
  TEST_SCHOLAR_ID,
  TEST_SCHOLAR_SLUG,
  seedTestData,
  cleanupE2ETestData,
} from './helpers/seed-test-data';

process.env.DISABLE_THROTTLER = 'true';

describe('Admin Scholar-Role Grants (e2e)', () => {
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
    await cleanupE2ETestData(prisma);
    await authFactory.cleanup();
    await app.close();
  });

  afterEach(async () => {
    await prisma.userScholarRole.deleteMany({ where: { scholarId: TEST_SCHOLAR_ID } });
  });

  it('POST scholar-roles without USERS_GRANT_ROLES -> 403', async () => {
    const auth = await authFactory.createAdminUser([]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .post(`/admin/permissions/${target.user.id}/scholar-roles`)
      .set(auth.headers)
      .send({ scholarSlug: TEST_SCHOLAR_SLUG, permissionType: 'OWN_CONTENT' })
      .expect(403);
  });

  it('POST scholar-roles with USERS_GRANT_ROLES -> 201 and creates a UserScholarRole row resolved from slug', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .post(`/admin/permissions/${target.user.id}/scholar-roles`)
      .set(auth.headers)
      .send({ scholarSlug: TEST_SCHOLAR_SLUG, permissionType: 'OWN_CONTENT' })
      .expect(201);

    const link = await prisma.userScholarRole.findFirst({
      where: { userId: target.user.id, scholarId: TEST_SCHOLAR_ID, permissionType: 'OWN_CONTENT' },
    });
    expect(link).toBeTruthy();
  });

  it('POST scholar-roles does NOT materialize any global UserPermission rows (D3 regression guard)', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .post(`/admin/permissions/${target.user.id}/scholar-roles`)
      .set(auth.headers)
      .send({ scholarSlug: TEST_SCHOLAR_SLUG, permissionType: 'OWN_CONTENT' })
      .expect(201);

    const permissions = await prisma.userPermission.findMany({ where: { userId: target.user.id } });
    expect(permissions).toHaveLength(0);
  });

  it('POST scholar-roles with an unknown scholarSlug -> 400', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .post(`/admin/permissions/${target.user.id}/scholar-roles`)
      .set(auth.headers)
      .send({ scholarSlug: 'no-such-scholar-slug', permissionType: 'OWN_CONTENT' })
      .expect(400);
  });

  it('DELETE scholar-roles/:scholarSlug/:permissionType removes the link', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await prisma.userScholarRole.create({
      data: {
        userId: target.user.id,
        scholarId: TEST_SCHOLAR_ID,
        permissionType: 'OWN_CONTENT',
        createdBy: auth.user.id,
      },
    });

    await request(app.getHttpServer())
      .delete(`/admin/permissions/${target.user.id}/scholar-roles/${TEST_SCHOLAR_SLUG}/OWN_CONTENT`)
      .set(auth.headers)
      .expect(200);

    const link = await prisma.userScholarRole.findFirst({
      where: { userId: target.user.id, scholarId: TEST_SCHOLAR_ID },
    });
    expect(link).toBeNull();
  });

  it('GET scholar-roles lists grants with scholarSlug/scholarName resolved for display', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await prisma.userScholarRole.create({
      data: {
        userId: target.user.id,
        scholarId: TEST_SCHOLAR_ID,
        permissionType: 'ASSIGNED_EDITOR',
        createdBy: auth.user.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/admin/permissions/${target.user.id}/scholar-roles`)
      .set(auth.headers)
      .expect(200);

    expect(res.body.scholarRoles).toHaveLength(1);
    expect(res.body.scholarRoles[0]).toMatchObject({
      scholarId: TEST_SCHOLAR_ID,
      scholarSlug: TEST_SCHOLAR_SLUG,
      permissionType: 'ASSIGNED_EDITOR',
    });
  });
});
