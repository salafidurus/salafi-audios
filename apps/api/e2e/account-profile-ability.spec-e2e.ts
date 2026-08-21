import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { subject, createMongoAbility } from '@casl/ability';
import { unpackRules } from '@casl/ability/extra';
import type { UserProfileDto } from '@sd/core-contracts';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory, accessGrant } from './helpers/test-auth.factory';
import { AccessCapability, AccessTarget } from '@sd/core-db';
import { defineAbilityFor } from '../src/core/auth/ability/ability.factory';
import type { AppAbility } from '../src/core/auth/ability/ability.types';
import { TEST_SCHOLAR_SLUG, seedTestData, cleanupE2ETestData } from './helpers/seed-test-data';

process.env.DISABLE_THROTTLER = 'true';

function unpackClientAbility(rules: UserProfileDto['rules']): AppAbility {
  const ability = createMongoAbility(unpackRules(rules));
  // SAFETY: `/account/profile` returns packed CASL rules produced by the same
  // shared ability vocabulary, and `unpackRules` reconstructs that client-side shape.
  return ability as AppAbility;
}

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

  it('unpacked client ability matches the server ability for a global-access user', async () => {
    const auth = await authFactory.createUser();
    const accessGrants = [accessGrant(AccessTarget.scholar, AccessCapability.write)];
    await prisma.userAccessGrant.createMany({
      data: accessGrants.map((grant) => ({
        target: grant.target,
        capability: grant.capability,
        scholarId: null,
        locale: grant.locale,
        userId: auth.user.id,
      })),
    });

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    const serverAbility = defineAbilityFor({
      roles: ['listener'],
      accessGrants,
    });
    const clientAbility = unpackClientAbility(res.body.rules);

    expect(clientAbility.can('update', 'Scholar')).toBe(serverAbility.can('update', 'Scholar'));
    expect(clientAbility.can('update', 'Scholar')).toBe(true);
    expect(clientAbility.can('delete', 'Scholar')).toBe(serverAbility.can('delete', 'Scholar'));
    expect(clientAbility.can('delete', 'Scholar')).toBe(false);
  });

  it('unpacked client ability matches the server ability for a scholar-scoped editor', async () => {
    const auth = await authFactory.createUser();
    const accessGrants = [
      accessGrant(AccessTarget.listing, AccessCapability.write, {
        scholarSlug: TEST_SCHOLAR_SLUG,
      }),
    ];
    const scholar = await prisma.scholar.findUniqueOrThrow({
      where: { slug: TEST_SCHOLAR_SLUG },
      select: { id: true },
    });
    await prisma.userAccessGrant.createMany({
      data: accessGrants.map((grant) => ({
        target: grant.target,
        capability: grant.capability,
        scholarId: scholar.id,
        locale: grant.locale,
        userId: auth.user.id,
      })),
    });

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    const serverAbility = defineAbilityFor({
      roles: ['listener'],
      accessGrants,
    });
    const clientAbility = unpackClientAbility(res.body.rules);

    const ownListing = subject('Listing', { scholarSlug: TEST_SCHOLAR_SLUG });
    const otherListing = subject('Listing', { scholarSlug: 'some-other-scholar' });

    expect(clientAbility.can('update', ownListing)).toBe(serverAbility.can('update', ownListing));
    expect(clientAbility.can('update', ownListing)).toBe(true);
    expect(clientAbility.can('update', otherListing)).toBe(
      serverAbility.can('update', otherListing),
    );
    expect(clientAbility.can('update', otherListing)).toBe(false);
  });

  it('unpacked client ability matches the server ability for a locale-scoped translator', async () => {
    const auth = await authFactory.createUser();
    const accessGrants = [
      {
        target: AccessTarget.translation,
        capability: AccessCapability.publish,
        scholarId: null,
        locale: 'ar' as const,
      },
    ];
    await prisma.userAccessGrant.createMany({
      data: accessGrants.map((grant) => ({ ...grant, userId: auth.user.id })),
    });

    const res = await request(app.getHttpServer())
      .get('/account/profile')
      .set(auth.headers)
      .expect(200);

    const serverAbility = defineAbilityFor({
      roles: ['listener'],
      accessGrants,
    });
    const clientAbility = unpackClientAbility(res.body.rules);

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
    const clientAbility = unpackClientAbility(res.body.rules);
    expect(clientAbility.can('read', 'Scholar')).toBe(false);
    expect(clientAbility.can('manage', 'all')).toBe(false);
  });
});
