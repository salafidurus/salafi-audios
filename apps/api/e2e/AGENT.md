# apps/api/test — Agent Guide

## Seeding Overview

E2E tests rely on a shared database seed. The seed runs once before the suite via
`global-setup.ts` → `run-seed.ts` → canonical seeders in
`packages/core-db/scripts/seed/`.

**Do not add seeding logic here.** All seed data lives in the canonical location:
`packages/core-db/scripts/seed/data/`.

## Adding New Seed Data

### Step 1 — Add data to the canonical data files

| What you need                      | Edit this file                                        |
| ---------------------------------- | ----------------------------------------------------- |
| New scholar                        | `packages/core-db/scripts/seed/data/scholars.ts`      |
| New topic                          | `packages/core-db/scripts/seed/data/topics.ts`        |
| New single (standalone lecture)    | `packages/core-db/scripts/seed/data/singles.ts`       |
| New series + lessons               | `packages/core-db/scripts/seed/data/series.ts`        |
| New collection + modules + lessons | `packages/core-db/scripts/seed/data/collections.ts`   |
| New live channel                   | `packages/core-db/scripts/seed/data/live-channels.ts` |

### Step 2 — Assign an ID in the correct range

All IDs go through `uuid(n)` → `a0000000-0000-0000-0000-{n padded to 12 digits}`.

| Entity           | ID range  | Next available |
| ---------------- | --------- | -------------- |
| Scholars         | 1–6       | 7              |
| Topics           | 10–15     | 16             |
| Singles          | 100       | 101            |
| Series (parents) | 200–210   | 211            |
| Series lessons   | 211–320   | 321            |
| Collections      | 1000–1001 | 1002           |
| Modules          | 1100–1110 | 1111           |
| Module lessons   | 1200–1337 | 1338           |

### Step 3 — Export a constant for test assertions

If your test needs to reference a seeded record by ID or slug, export a named
constant from `helpers/seed-test-data.ts`:

```typescript
export const TEST_MY_THING_ID = uuid(111); // matches id in singles.ts
```

This file is the **only** place constants are defined. Import from it in specs:

```typescript
import { TEST_MY_THING_ID } from './helpers/seed-test-data';
```

### Step 4 — No seeder changes needed for new data

The seeders loop over the data arrays automatically. You only need to touch a seeder
if the _shape_ of the data changes (new DB column, new relation, etc.).

## Key Invariants

- Every seeder uses `upsert` — the seed is safe to run multiple times.
- `run-seed.ts` runs the canonical seed in upsert mode natively.
- Audio URLs use real CDN URLs from `https://preview-cdn.salafidurus.com/audio/`.
- The E2E-specific entries (scholar `e2e-scholar-slug`, topics `e2e-parent-topic`
  / `e2e-child-topic`, listing `e2e-listing-slug`, live channel `e2e-live-channel-1`)
  are NOT in the seed data files — they are created by `seedTestData()` in
  `helpers/seed-test-data.ts`.

## Stale E2E User Cleanup

Run the cleanup script to purge leftover users:

```bash
bun run --filter @sd/core-db prisma:seed:clean
```

## Test Setup Flow

```text
Jest globalSetup
  └── global-setup.ts
        └── run-seed.ts  (spawned as child process)
              └── canonical seeders in packages/core-db/scripts/seed/seeders/
                    ├── seedTopics
                    ├── seedScholars
                    ├── seedListings
                    ├── seedAudio
                    ├── seedTopicLinks
                    └── seedLiveChannels
```
