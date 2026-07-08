# Database Seeder

Clean, modular database seeding system for development and testing.

## Environment Variables

The seeder respects the following environment variables:

- `DATABASE_URL` or `DIRECT_DB_URL` - Database connection string (required)
- `MEDIA_CDN_BASE_URL` - Base URL for audio assets (optional)
  - **Development**: Defaults to `https://placeholder.dev/audio`
  - **Production**: Set to your CDN URL (e.g., `https://cdn.salafidurus.com/audio`)

Example `.env`:

```bash
DATABASE_URL=postgresql://sd_dev:password@localhost:5432/salafi_dev
MEDIA_CDN_BASE_URL=https://placeholder.dev/audio  # Optional, this is the default
```

## Structure

```text
scripts/seed/
├── seed.ts                  # Main orchestrator (entry point)
├── database.ts              # Prisma client setup
├── helpers.ts               # Utility functions (uuid, seedStatus, dur)
├── types.ts                 # TypeScript type definitions
├── data/                    # Seed data (read-only)
│   ├── scholars.ts
│   ├── topics.ts
│   ├── singles.ts
│   ├── series.ts
│   ├── collections.ts
│   └── index.ts
└── seeders/                 # Seeding functions
    ├── clear-data.ts        # Clear existing data
    ├── scholars.ts          # Seed scholars
    ├── topics.ts            # Seed topics
    ├── listings.ts          # Seed listings (singles, series, collections)
    ├── audio.ts             # Seed audio assets
    ├── topic-links.ts       # Link listings to topics
    └── index.ts
```

## Usage

From packages/core-db:

```bash
bun run prisma:seed
```

From monorepo root:

```bash
bun run --filter @sd/core-db prisma:seed
```

## Key Features

- **Modular**: Each concern is isolated in its own file
- **Maintainable**: Easy to find and update specific data
- **Type-safe**: Uses Prisma's generated types
- **Idempotent**: Safe to run multiple times (clears then rebuilds)
- **Deterministic**: UUID generation ensures consistent IDs

## Adding New Data

### Add a Scholar

Edit `data/scholars.ts`:

```typescript
{
  id: uuid(6),
  slug: "new-scholar",
  name: "New Scholar Name",
  bio: "Biography...",
  isKibar: false,
}
```

### Add a Single (Standalone Lecture)

Edit `data/singles.ts`:

```typescript
{
  id: 110,                  // Next available ID
  scholarIdx: 0,            // Index in SCHOLARS array
  slug: "unique-slug",
  title: "Lecture Title",
  desc: "Description...",
  topicIdx: 0,              // Index in TOPICS array
  durationMin: 50,
}
```

### Add a Series

Edit `data/series.ts` following the existing pattern.

### Add a Collection

Edit `data/collections.ts` following the existing pattern.

## Maintenance

When modifying seeder logic:

1. Update the appropriate seeder in `seeders/`
2. Test with `bun run prisma:seed`
3. Verify database state

## UUID Ranges

- Topics: 10-14
- Scholars: 1-5
- Singles: 100-109
- Series (parents): 200-209
- Series (lessons): 210-281
- Collections: 300-309
- Modules: 400-466
- Module lessons: 500-638

## Best Practices

### Environment-Specific Configuration

- **Never hardcode production URLs** in seed data
- Use environment variables for URLs, API keys, and environment-specific config
- Seed data should work in development without production credentials

### Audio Assets

Audio URLs are generated as: `${MEDIA_CDN_BASE_URL}/${slug}.mp3`

- Development uses placeholder URLs by default
- Production should set `MEDIA_CDN_BASE_URL` to the actual CDN
- URLs are stored in the database, not computed at runtime
