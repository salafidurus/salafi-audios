/**
 * Seed topics
 */

import type { PrismaClient } from "../../../src/generated/primary/client.js";

import { TOPICS } from "../data/index.js";

export async function seedTopics(prisma: PrismaClient): Promise<void> {
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

    // Arabic is the main language (topic.name above) — mirror the English
    // name into a TopicTranslation, matching the sync behavior admin edits
    // get via syncMainLanguageTranslation.
    await prisma.topicTranslation.upsert({
      where: { topicId_locale: { topicId: topic.id, locale: "en" } },
      update: { name: topic.nameEn },
      create: { topicId: topic.id, locale: "en", name: topic.nameEn },
    });
  }

  console.log(`✓ Seeded ${TOPICS.length} topics`);
}
