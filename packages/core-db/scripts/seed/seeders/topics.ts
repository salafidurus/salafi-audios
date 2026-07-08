/**
 * Seed topics
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { TOPICS } from "../data/index.js";

export async function seedTopics(prisma: PrismaClient): Promise<void> {
  for (const topic of TOPICS) {
    await prisma.topic.create({ data: topic });
  }

  console.log(`✓ Created ${TOPICS.length} topics`);
}
