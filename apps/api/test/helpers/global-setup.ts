process.env.NODE_ENV = 'test';
import '../../src/shared/utils/env.bootstrap';

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}
if (process.env.DIRECT_DB_URL) {
  process.env.DIRECT_DB_URL = process.env.DIRECT_DB_URL.replace('localhost', '127.0.0.1');
}

export async function setup() {
  // Dynamic import ensures DATABASE_URL has already been rewritten to
  // 127.0.0.1 before the Prisma adapter captures the connection string.
  const { seedTestData } = await import('./seed-test-data');
  console.log('--- Initializing E2E Test Suite Seed Data ---');
  await seedTestData();
  console.log('--- E2E Seed Data Initialized Successfully ---');
}
