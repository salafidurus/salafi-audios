import '../../src/shared/utils/env.bootstrap';
import { PrismaClient } from '@sd/core-db';
import { PrismaPg } from '@prisma/adapter-pg';

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

const { seedTestData } = await import('./seed-test-data');
await seedTestData(prisma);
await prisma.$disconnect();
