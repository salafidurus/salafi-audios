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
  // Seed regular scholars from seed data
  const SCHOLARS = [
    {
      id: uuid(1),
      slug: 'uthaymin',
      name: 'Muhammad ibn Salih al-Uthaymin',
      bio: 'Foremost scholar of Ahl al-Sunnah in the 20th century.',
      country: 'SA',
      mainLanguage: 'ar' as const,
      title: 'allamah' as const,
      orderIndex: 1,
    },
    {
      id: uuid(2),
      slug: 'fawzan',
      name: 'Salih ibn Fawzan al-Fawzan',
      bio: 'The Grand Mufti of the Kingdom of Saudi Arabia.',
      country: 'SA',
      mainLanguage: 'ar' as const,
      title: 'allamah' as const,
      orderIndex: 0,
    },
    {
      id: uuid(3),
      slug: 'arafat',
      name: 'Arafat bn Hasan Al-Muhammadi',
      bio: 'Contemporary Salafi scholar based in Saudi Arabia.',
      country: 'YE',
      mainLanguage: 'ar' as const,
      title: 'sheikh' as const,
      orderIndex: 0,
    },
    {
      id: uuid(4),
      slug: 'mustafa-bn-mabram',
      name: 'Mustafa bn Mabram',
      bio: 'Specialist in Arabic grammar.',
      country: 'YE',
      mainLanguage: 'ar' as const,
      title: 'ustadh' as const,
      orderIndex: 0,
    },
    {
      id: uuid(5),
      slug: 'abdullah-al-bukhari',
      name: 'Abdullah al-Bukhari',
      bio: 'Contemporary muhaddith specializing in hadith sciences.',
      country: 'SA',
      mainLanguage: 'ar' as const,
      title: 'akh' as const,
      orderIndex: 0,
    },
  ];

  for (const scholar of SCHOLARS) {
    await prisma.scholar.upsert({
      where: { id: scholar.id },
      update: {
        slug: scholar.slug,
        name: scholar.name,
        title: scholar.title,
        orderIndex: scholar.orderIndex,
      },
      create: {
        ...scholar,
        isActive: true,
      },
    });
  }

  // Seed regular topics from seed data
  const TOPICS = [
    { id: uuid(10), slug: 'aqeedah', name: 'Aqeedah', orderIndex: 1 },
    { id: uuid(11), slug: 'nahw', name: 'Nahw', orderIndex: 4 },
    { id: uuid(12), slug: 'hadith', name: 'Hadith', orderIndex: 2 },
    { id: uuid(13), slug: 'fiqh', name: 'Fiqh', orderIndex: 0 },
    { id: uuid(14), slug: 'tafsir', name: 'Tafsir', orderIndex: 3 },
  ];

  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: {
        slug: topic.slug,
        name: topic.name,
        orderIndex: topic.orderIndex,
      },
      create: {
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
        orderIndex: topic.orderIndex,
      },
    });
  }

  // Create test scholar (for other e2e tests)
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
