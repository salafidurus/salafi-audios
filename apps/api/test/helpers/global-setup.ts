process.env.NODE_ENV = 'test';
import '../../src/shared/utils/env.bootstrap';
import { seedTestData } from './seed-test-data';

export async function setup() {
  console.log('--- Initializing E2E Test Suite Seed Data ---');
  await seedTestData();
  console.log('--- E2E Seed Data Initialized Successfully ---');
}
