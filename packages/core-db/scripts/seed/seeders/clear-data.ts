/**
 * Clear existing seed data from database
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";

/**
 * Delete all existing seed data in reverse foreign key order
 */
export async function clearData(prisma: PrismaClient): Promise<void> {
  await prisma.listingTopic.deleteMany();
  await prisma.audioAsset.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.scholar.deleteMany();

  console.log("✓ Cleared existing data\n");
}
