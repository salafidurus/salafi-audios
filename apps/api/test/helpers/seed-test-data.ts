import { PrismaClient, Locale, Status, ListingFormat } from '@sd/core-db';
import { PrismaPg } from '@prisma/adapter-pg';

export const TEST_SCHOLAR_ID = 'e2e-scholar-1';
export const TEST_SCHOLAR_SLUG = 'e2e-scholar-slug';
export const TEST_PARENT_TOPIC_ID = 'e2e-parent-topic-1';
export const TEST_CHILD_TOPIC_ID = 'e2e-child-topic-1';
export const TEST_LISTING_ID = '789e4567-e89b-12d3-a456-426614174000'; // Needs to be UUID format for Listings
export const TEST_LISTING_SLUG = 'e2e-listing-slug';
export const TEST_LIVE_CHANNEL_ID = 'e2e-live-channel-1';
export const TEST_LIVE_CHANNEL_TELEGRAM_ID = '-10022334455';

export async function seedTestData() {
  const connectionString = process.env['DATABASE_URL'] || process.env['DIRECT_DB_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to seed test data');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    // 1. Create a scholar with translations
    await prisma.scholar.upsert({
      where: { id: TEST_SCHOLAR_ID },
      update: {},
      create: {
        id: TEST_SCHOLAR_ID,
        slug: TEST_SCHOLAR_SLUG,
        name: 'Scholar Name (English)',
        bio: 'English biography',
        country: 'Saudi Arabia',
        isActive: true,
        translations: {
          createMany: {
            data: [
              {
                locale: Locale.en,
                name: 'Scholar Name (English)',
                bio: 'English biography',
              },
              {
                locale: Locale.ar,
                name: 'اسم الشيخ (عربي)',
                bio: 'السيرة الذاتية باللغة العربية',
              },
            ],
          },
        },
      },
    });

    // 2. Create parent + child topics
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
        name: 'Child Topic',
        parentId: TEST_PARENT_TOPIC_ID,
      },
    });

    // 3. Create listing with audio asset linked to scholar and topic
    await prisma.listing.upsert({
      where: { id: TEST_LISTING_ID },
      update: {},
      create: {
        id: TEST_LISTING_ID,
        scholarId: TEST_SCHOLAR_ID,
        slug: TEST_LISTING_SLUG,
        title: 'E2E Test Listing',
        description: 'E2E Listing Description',
        format: ListingFormat.single,
        status: Status.published,
        publishedAt: new Date(),
        topics: {
          create: {
            topicId: TEST_CHILD_TOPIC_ID,
          },
        },
        audioAssets: {
          create: {
            url: 'https://example.com/audio.mp3',
            format: 'mp3',
            durationSeconds: 300,
            sizeBytes: 5000000n,
            isPrimary: true,
          },
        },
      },
    });

    // 4. Create live channel
    await prisma.livestreamChannel.upsert({
      where: { id: TEST_LIVE_CHANNEL_ID },
      update: {},
      create: {
        id: TEST_LIVE_CHANNEL_ID,
        scholarId: TEST_SCHOLAR_ID,
        telegramId: TEST_LIVE_CHANNEL_TELEGRAM_ID,
        telegramSlug: 'e2e_channel_slug',
        displayName: 'E2E Live Channel',
        isActive: true,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
