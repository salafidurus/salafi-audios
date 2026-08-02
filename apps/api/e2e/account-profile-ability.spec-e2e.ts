import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { subject, createMongoAbility } from '@casl/ability';
import { unpackRules } from '@casl/ability/extra';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { Permission } from '@sd/core-db';
import { defineAbilityFor } from '../src/core/auth/ability/ability.factory';
import type { AppAbility } from '../src/core/auth/ability/ability.types';
import { TEST_SCHOLAR_ID, seedTestData, cleanupE2ETestData } from './helpers/seed-test-data';

process.env.DISABLE_THROTTLER = 'true';

/**
 * Proves the packed-rules design's core trust boundary: unpacking
 * /account/profile's `rules` field into a client-side ability produces
 * decisions identical to the server's own ability for the same user, across
 * global, scholar-scoped, and locale-scoped grants.
 */
describe('Account profile packed-rules equivalence (e2e)', () => {
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

  it('unpacked client ability matches the server ability for a global-permission user', async () => {
    const auth = await authFactory.createAdminUser([Permission.SCHOLARS_EDIT]);

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    const serverAbility = defineAbilityFor({
      roles: res.body.roles,
      permissions: res.body.permissions,
      scholarLinks: res.body.scholarLinks,
      translatorRoles: res.body.translatorRoles,
    });
    const clientAbility = createMongoAbility(unpackRules(res.body.rules)) as AppAbility;

    expect(clientAbility.can('update', 'Scholar')).toBe(serverAbility.can('update', 'Scholar'));
    expect(clientAbility.can('update', 'Scholar')).toBe(true);
    expect(clientAbility.can('delete', 'Scholar')).toBe(serverAbility.can('delete', 'Scholar'));
    expect(clientAbility.can('delete', 'Scholar')).toBe(false);
  });

  it('unpacked client ability matches the server ability for a scholar-scoped editor', async () => {
    const auth = await authFactory.createScholarScopedUser(TEST_SCHOLAR_ID, 'OWN_CONTENT');

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    const serverAbility = defineAbilityFor({
      roles: res.body.roles,
      permissions: res.body.permissions,
      scholarLinks: res.body.scholarLinks,
      translatorRoles: res.body.translatorRoles,
    });
    const clientAbility = createMongoAbility(unpackRules(res.body.rules)) as AppAbility;

    const ownListing = subject('Listing', { scholarId: TEST_SCHOLAR_ID });
    const otherListing = subject('Listing', { scholarId: 'some-other-scholar-id' });

    expect(clientAbility.can('update', ownListing)).toBe(serverAbility.can('update', ownListing));
    expect(clientAbility.can('update', ownListing)).toBe(true);
    expect(clientAbility.can('update', otherListing)).toBe(
      serverAbility.can('update', otherListing),
    );
    expect(clientAbility.can('update', otherListing)).toBe(false);
  });

  it('unpacked client ability matches the server ability for a locale-scoped translator', async () => {
    const auth = await authFactory.createTranslatorScopedUser(['ar'], { canPublish: true });

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    const serverAbility = defineAbilityFor({
      roles: res.body.roles,
      permissions: res.body.permissions,
      scholarLinks: res.body.scholarLinks,
      translatorRoles: res.body.translatorRoles,
    });
    const clientAbility = createMongoAbility(unpackRules(res.body.rules)) as AppAbility;

    const arTranslation = subject('Translation', { locale: 'ar' });
    const enTranslation = subject('Translation', { locale: 'en' });

    expect(clientAbility.can('publish', arTranslation)).toBe(
      serverAbility.can('publish', arTranslation),
    );
    expect(clientAbility.can('publish', arTranslation)).toBe(true);
    expect(clientAbility.can('publish', enTranslation)).toBe(
      serverAbility.can('publish', enTranslation),
    );
    expect(clientAbility.can('publish', enTranslation)).toBe(false);
  });

  it('a plain listener with no grants unpacks to an ability that can do nothing', async () => {
    const auth = await authFactory.createUser();

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    expect(res.body.rules).toEqual([]);
    const clientAbility = createMongoAbility(unpackRules(res.body.rules)) as AppAbility;
    expect(clientAbility.can('read', 'Scholar')).toBe(false);
    expect(clientAbility.can('manage', 'all')).toBe(false);
  });
});
