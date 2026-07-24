import { PrismaService } from '../../src/core/db/prisma.service';

function uuid(index: number): string {
  return `a0000000-0000-0000-0000-${String(index).padStart(12, '0')}`;
}

export const TEST_SCHOLAR_ID = uuid(6); // index 6 scholar (e2e-scholar-slug)
export const TEST_SCHOLAR_SLUG = 'e2e-scholar-slug';
export const TEST_PARENT_TOPIC_ID = uuid(15); // index 15 parent topic (e2e-parent-topic)
export const TEST_CHILD_TOPIC_ID = uuid(16); // index 16 child topic (e2e-child-topic)
export const TEST_LISTING_ID = uuid(110); // index 110 single (e2e-listing-slug)
export const TEST_LISTING_SLUG = 'e2e-listing-slug';
export const TEST_LIVE_CHANNEL_ID = 'e2e-live-channel-1';
export const TEST_LIVE_CHANNEL_TELEGRAM_ID = '-10022334455';

export async function seedTestData(prisma: PrismaService): Promise<void> {
  // Create test scholar
  await prisma.scholar.upsert({
    where: { id: TEST_SCHOLAR_ID },
    update: {},
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

  // Create test listing
  await prisma.listing.upsert({
    where: { id: TEST_LISTING_ID },
    update: {},
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
}
