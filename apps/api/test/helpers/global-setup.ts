import { seedTestData } from './seed-test-data';
import '../../src/shared/utils/env.bootstrap';

export async function setup() {
  console.log('--- Initializing E2E Test Suite Seed Data ---');
  await seedTestData();
  console.log('--- E2E Seed Data Initialized Successfully ---');
}
