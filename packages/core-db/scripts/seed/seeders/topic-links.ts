/**
 * Seed topic-listing links
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import type { TopicPair } from "../types.js";

/**
 * Create listing-topic links, deduplicating any duplicates
 */
export async function seedTopicLinks(prisma: PrismaClient, topicPairs: TopicPair[]): Promise<void> {
  // Deduplicate topic pairs
  const seen = new Set<string>();
  const uniquePairs = topicPairs.filter((p) => {
    const key = `${p.listingId}:${p.topicId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await prisma.listingTopic.createMany({
    data: uniquePairs,
    skipDuplicates: true,
  });

  console.log(`✓ Linked ${uniquePairs.length} listing-topic pairs`);
}
