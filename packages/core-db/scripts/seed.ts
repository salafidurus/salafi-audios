/**
 * Database seeder for Listings-unified schema
 *
 * Inserts deterministic mock data for development and testing.
 * Idempotent: deletes existing seed data first, then creates fresh.
 * Safe to run multiple times.
 *
 * Run via:
 *   bun run prisma:seed   (from packages/core-db/)
 *   bun run --filter @sd/core-db prisma:seed  (from monorepo root)
 */

import { prisma } from "./seed/database.js";
import { SCHOLARS, TOPICS } from "./seed/data/index.js";
import {
  clearData,
  seedScholars,
  seedTopics,
  seedListings,
  seedAudio,
  seedTopicLinks,
} from "./seed/seeders/index.js";

async function main() {
  console.log("Seeding database with unified Listings ...\n");

  // Clear existing data
  await clearData(prisma);

  // Seed base entities
  await seedTopics(prisma);
  await seedScholars(prisma);
  console.log();

  // Seed listings (singles, series, collections)
  const {
    singleCount,
    seriesCount,
    seriesLessonCount,
    collectionCount,
    moduleCount,
    moduleLessonCount,
    topicPairs,
  } = await seedListings(prisma);

  // Seed audio assets
  const audioCount = await seedAudio(prisma);

  // Link listings to topics
  await seedTopicLinks(prisma, topicPairs);

  // Summary
  const totalListings =
    singleCount +
    seriesCount +
    seriesLessonCount +
    collectionCount +
    moduleCount +
    moduleLessonCount;
  console.log(`\n✓ Seeding complete.`);
  console.log(`  Topics:         ${TOPICS.length}`);
  console.log(`  Scholars:       ${SCHOLARS.length}`);
  console.log(`  Singles:        ${singleCount}`);
  console.log(`  Series:         ${seriesCount}`);
  console.log(`  Series lessons: ${seriesLessonCount}`);
  console.log(`  Collections:    ${collectionCount}`);
  console.log(`  Modules:        ${moduleCount}`);
  console.log(`  Module lessons: ${moduleLessonCount}`);
  console.log(`  Total listings: ${totalListings}`);
  console.log(`  Total audio:    ${audioCount}`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
