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

describe('Admin Translator-Role Grants (e2e)', () => {
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
    await prisma.userTranslatorRole.deleteMany({});
  });

  it('PUT translator-roles without USERS_GRANT_ROLES -> 403', async () => {
    const auth = await authFactory.createAdminUser([]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .put(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .send({ scholarSlug: null, locales: ['ar'], canPublish: false })
      .expect(403);
  });

  it('PUT translator-roles grants a multi-locale set (all scholars) in one call', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .put(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .send({ scholarSlug: null, locales: ['en', 'ar'], canPublish: true })
      .expect(200);

    const rows = await prisma.userTranslatorRole.findMany({ where: { userId: target.user.id } });
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.scholarId === null)).toBe(true);
    expect(rows.every((r) => r.canPublish === true)).toBe(true);
    expect(new Set(rows.map((r) => r.locale))).toEqual(new Set(['en', 'ar']));
  });

  it('PUT translator-roles does NOT materialize any global TRANSLATIONS_* UserPermission rows (D3 regression guard)', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .put(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .send({ scholarSlug: null, locales: ['ar'], canPublish: true })
      .expect(200);

    const permissions = await prisma.userPermission.findMany({ where: { userId: target.user.id } });
    expect(permissions).toHaveLength(0);
  });

  it('PUT translator-roles re-syncing a smaller locale set removes the dropped locale', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .put(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .send({ scholarSlug: null, locales: ['en', 'ar'], canPublish: false })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .send({ scholarSlug: null, locales: ['ar'], canPublish: false })
      .expect(200);

    const rows = await prisma.userTranslatorRole.findMany({ where: { userId: target.user.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.locale).toBe('ar');
  });

  it('PUT translator-roles scoped to a scholarSlug resolves to that scholar only', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await request(app.getHttpServer())
      .put(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .send({ scholarSlug: TEST_SCHOLAR_SLUG, locales: ['ar'], canPublish: false })
      .expect(200);

    const row = await prisma.userTranslatorRole.findFirst({ where: { userId: target.user.id } });
    expect(row?.scholarId).toBe(TEST_SCHOLAR_ID);
  });

  it('PATCH translator-roles/:locale toggles the publish flag for an existing grant', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await prisma.userTranslatorRole.create({
      data: { userId: target.user.id, scholarId: null, locale: 'ar', canPublish: false },
    });

    await request(app.getHttpServer())
      .patch(`/admin/permissions/${target.user.id}/translator-roles/ar`)
      .set(auth.headers)
      .send({ canPublish: true })
      .expect(200);

    const row = await prisma.userTranslatorRole.findFirst({
      where: { userId: target.user.id, locale: 'ar' },
    });
    expect(row?.canPublish).toBe(true);
  });

  it('GET translator-roles lists grants with scholarSlug resolved for scoped rows and null for all-scholars rows', async () => {
    const auth = await authFactory.createAdminUser([Permission.USERS_GRANT_ROLES]);
    const target = await authFactory.createUser();

    await prisma.userTranslatorRole.createMany({
      data: [
        { userId: target.user.id, scholarId: null, locale: 'en', canPublish: false },
        { userId: target.user.id, scholarId: TEST_SCHOLAR_ID, locale: 'ar', canPublish: true },
      ],
    });

    const res = await request(app.getHttpServer())
      .get(`/admin/permissions/${target.user.id}/translator-roles`)
      .set(auth.headers)
      .expect(200);

    const roles: Array<{ locale: string; scholarSlug: string | null }> = res.body.translatorRoles;
    expect(roles).toHaveLength(2);
    const enRow = roles.find((r) => r.locale === 'en');
    const arRow = roles.find((r) => r.locale === 'ar');
    expect(enRow?.scholarSlug).toBeNull();
    expect(arRow?.scholarSlug).toBe(TEST_SCHOLAR_SLUG);
  });
});
