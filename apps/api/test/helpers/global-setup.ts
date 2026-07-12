process.env.NODE_ENV = 'test';
import '../../src/shared/utils/env.bootstrap';

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}
if (process.env.DIRECT_DB_URL) {
  process.env.DIRECT_DB_URL = process.env.DIRECT_DB_URL.replace('localhost', '127.0.0.1');
}

import { seedTestData } from './seed-test-data';

export async function setup() {
  console.log('--- Initializing E2E Test Suite Seed Data ---');
  await seedTestData();
  console.log('--- E2E Seed Data Initialized Successfully ---');
}
