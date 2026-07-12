import '../../src/shared/utils/env.bootstrap';
import { PrismaClient } from '@sd/core-db';
import { PrismaPg } from '@prisma/adapter-pg';
import { resolve } from 'node:path';

// Patch localhost → 127.0.0.1 for Bun (resolves IPv6/IPv4 ambiguity)
for (const key of ['DATABASE_URL', 'DIRECT_DB_URL'] as const) {
  if (process.env[key]) {
    process.env[key] = process.env[key]!.replace('localhost', '127.0.0.1');
  }
}

const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DIRECT_DB_URL or DATABASE_URL is required');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const seedDir = resolve(__dirname, '../../../../packages/core-db/scripts/seed');

  // Load canonical seeders
  const { seedScholars, seedTopics, seedListings, seedAudio, seedTopicLinks, seedLiveChannels } =
    await import(resolve(seedDir, 'seeders/index.js'));

  // Run in upsert mode (no clearData so existing data is preserved)
  await seedTopics(prisma);
  await seedScholars(prisma);
  const { topicPairs } = await seedListings(prisma);
  await seedAudio(prisma);
  await seedTopicLinks(prisma, topicPairs);
  await seedLiveChannels(prisma);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
