# `apps/api/e2e` guidance

E2E tests use the shared database seed. Add reusable seed data only under
`packages/core-db/scripts/seed/data/`; do not create parallel seeders here.

Seed data must be repeatable and use the canonical seeders. Test-only records
belong in `helpers/seed-test-data.ts`, which is the only source for their
exported IDs and slugs.

Keep E2E setup and cleanup deterministic. Preserve the distinction between
canonical product data and test-only records.
