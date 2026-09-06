import { resolve } from 'node:path';
import { PrimaryDbService } from '../../src/core/db/primary-db.service';

function uuid(index: number): string {
  return `a0000000-0000-0000-0000-${String(index).padStart(12, '0')}`;
}

export const TEST_SCHOLAR_ID = uuid(999); // index 999 scholar (e2e-scholar-slug)
export const TEST_SCHOLAR_SLUG = 'e2e-scholar-slug';
export const TEST_PARENT_TOPIC_ID = uuid(997); // index 997 parent topic (e2e-parent-topic)
export const TEST_CHILD_TOPIC_ID = uuid(996); // index 996 child topic (e2e-child-topic)
export const TEST_LISTING_ID = uuid(110); // index 110 single (e2e-listing-slug)
export const TEST_LISTING_SLUG = 'e2e-listing-slug';
export const TEST_RECOMMENDED_LISTING_ID = uuid(111);
export const TEST_RECOMMENDED_LISTING_SLUG = 'e2e-recommended-listing-slug';
export const TEST_LIVE_CHANNEL_ID = 'e2e-live-channel-1';
export const TEST_LIVE_CHANNEL_TELEGRAM_ID = '-10022334455';

export async function seedTestData(prisma: PrimaryDbService): Promise<void> {
  // Seed regular scholars/topics from the canonical seed data — imported
  // directly (not duplicated here) so this fixture can never drift from
  // packages/core-db/scripts/seed/data, per apps/api/e2e/AGENT.md.
  const seedersDir = resolve(__dirname, '../../../../packages/core-db/scripts/seed/seeders');
  const { seedScholars, seedTopics } = await import(resolve(seedersDir, 'index.js'));
  await seedScholars(prisma);
  await seedTopics(prisma);

  // Create test scholar (for other e2e tests). `update` restores the same
  // baseline fields as `create` — other suites (or manual DB edits) can
  // mutate this shared fixture (e.g. toggle isActive), and an empty `update`
  // would let that mutation silently persist across runs, breaking whichever
  // suite runs next.
  await prisma.scholar.upsert({
    where: { id: TEST_SCHOLAR_ID },
    update: {
      slug: TEST_SCHOLAR_SLUG,
      name: 'E2E Test Scholar',
      bio: 'E2E Scholar Biography',
      country: 'SA',
      mainLanguage: 'ar',
      isActive: true,
    },
    create: {
      id: TEST_SCHOLAR_ID,
      slug: TEST_SCHOLAR_SLUG,
      name: 'E2E Test Scholar',
      bio: 'E2E Scholar Biography',
      country: 'SA',
      mainLanguage: 'ar',
      isActive: true,
    },
  });

  // Create test topics
  await prisma.topic.upsert({
    where: { id: TEST_PARENT_TOPIC_ID },
    update: {},
    create: {
      id: TEST_PARENT_TOPIC_ID,
      slug: 'e2e-parent-topic',
      name: 'Parent Topic',
    },
  });

  await prisma.topic.upsert({
    where: { id: TEST_CHILD_TOPIC_ID },
    update: {},
    create: {
      id: TEST_CHILD_TOPIC_ID,
      slug: 'e2e-child-topic',
      name: 'E2E Child Topic',
    },
  });

  // Create test listing. Same reasoning as the scholar fixture above:
  // `update` restores the baseline title/language/status so a mutation left
  // behind by another suite can't silently persist across runs.
  await prisma.listing.upsert({
    where: { id: TEST_LISTING_ID },
    update: {
      slug: TEST_LISTING_SLUG,
      title: 'E2E Test Listing',
      description: 'E2E Listing Description',
      format: 'single',
      language: 'ar',
      status: 'published',
      scholarId: TEST_SCHOLAR_ID,
      publishedAt: new Date(),
      durationSeconds: 300,
    },
    create: {
      id: TEST_LISTING_ID,
      slug: TEST_LISTING_SLUG,
      title: 'E2E Test Listing',
      description: 'E2E Listing Description',
      format: 'single',
      language: 'ar',
      status: 'published',
      scholarId: TEST_SCHOLAR_ID,
      publishedAt: new Date(),
      durationSeconds: 300,
    },
  });

  const allamahScholar = await prisma.scholar.findUnique({
    where: { slug: 'fawzan' },
    select: { id: true },
  });
  if (!allamahScholar) {
    throw new Error('Canonical Allamah scholar fawzan is required for scholar page-feed E2E data');
  }

  await prisma.listing.upsert({
    where: { id: TEST_RECOMMENDED_LISTING_ID },
    update: {
      slug: TEST_RECOMMENDED_LISTING_SLUG,
      title: 'E2E Recommended Listing',
      description: 'E2E Recommended Listing Description',
      format: 'single',
      language: 'ar',
      status: 'published',
      scholarId: allamahScholar.id,
      parentId: null,
      deletedAt: null,
      publishedAt: new Date(),
      durationSeconds: 300,
    },
    create: {
      id: TEST_RECOMMENDED_LISTING_ID,
      slug: TEST_RECOMMENDED_LISTING_SLUG,
      title: 'E2E Recommended Listing',
      description: 'E2E Recommended Listing Description',
      format: 'single',
      language: 'ar',
      status: 'published',
      scholarId: allamahScholar.id,
      publishedAt: new Date(),
      durationSeconds: 300,
    },
  });

  await prisma.listingTopic.upsert({
    where: {
      listingId_topicId: {
        listingId: TEST_LISTING_ID,
        topicId: TEST_PARENT_TOPIC_ID,
      },
    },
    update: {},
    create: {
      listingId: TEST_LISTING_ID,
      topicId: TEST_PARENT_TOPIC_ID,
    },
  });
}

/**
 * Delete the E2E test fixtures created by seedTestData.
 * Deletion order respects FK constraints (leaf tables first).
 */
export async function cleanupE2ETestData(prisma: PrimaryDbService): Promise<void> {
  for (const id of [
    TEST_LISTING_ID,
    TEST_RECOMMENDED_LISTING_ID,
    TEST_SCHOLAR_ID,
    TEST_PARENT_TOPIC_ID,
    TEST_CHILD_TOPIC_ID,
  ]) {
    await prisma.listingTranslation.deleteMany({ where: { listingId: id } });
    await prisma.audioAsset.deleteMany({ where: { listingId: id } });
    await prisma.listingTopic.deleteMany({ where: { listingId: id } });
  }
  await prisma.listing.deleteMany({
    where: { id: { in: [TEST_LISTING_ID, TEST_RECOMMENDED_LISTING_ID] } },
  });
  await prisma.scholar.deleteMany({ where: { id: TEST_SCHOLAR_ID } });
  await prisma.topic.deleteMany({
    where: { id: { in: [TEST_PARENT_TOPIC_ID, TEST_CHILD_TOPIC_ID] } },
  });
}
