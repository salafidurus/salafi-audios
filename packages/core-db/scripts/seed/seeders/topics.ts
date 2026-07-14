/**
 * Seed topics
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { TOPICS } from "../data/index.js";

export async function seedTopics(prisma: PrismaClient): Promise<void> {
  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: {
        slug: topic.slug,
        name: topic.name,
      },
      create: {
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
      },
    });
  }

  console.log(`✓ Seeded ${TOPICS.length} topics`);
}
