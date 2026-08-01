# Database Seeder

Clean, modular database seeding system for development and testing.

## Environment Variables

The seeder respects the following environment variables:

- `DATABASE_URL` or `DIRECT_DB_URL` - Database connection string (required)
- No `MEDIA_CDN_BASE_URL` — audio URLs are hardcoded real CDN URLs in seed data.

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
  id: uuid(7),
  slug: "new-scholar",
  name: "New Scholar Name",
  bio: "Biography...",
  nameEn: "New Scholar Name (English)",
  country: "SA",
  mainLanguage: "ar",
  title: "sheikh",
  orderIndex: 100,
}
```

### Add a Single (Standalone Lecture)

Edit `data/singles.ts`:

```typescript
{
  id: 101,                  // Next available ID
  scholarIdx: 0,            // Index in SCHOLARS array
  slug: "unique-slug",
  title: "Lecture Title",
  desc: "Description...",
  topicIdx: 0,              // Index in TOPICS array
  durationMin: 50,
  audioUrl: "https://cdn.example.com/audio/file.mp3",
  language: "ar",
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

- Topics: 10-15
- Scholars: 1-6
- Singles: 100
- Series (parents): 200-209
- Series lessons: 210-320
- Collections: 1000-1001
- Modules: 1100-1110
- Module lessons: 1200-1337

## Best Practices

### Environment-Specific Configuration

- **Never hardcode production URLs** in seed data
- Use environment variables for URLs, API keys, and environment-specific config
- Seed data should work in development without production credentials

### Audio Assets

Audio URLs are hardcoded in the seed data using the production CDN:
`https://preview-cdn.salafidurus.com/audio/`.

Each audio entry includes:

- `audioUrl`: Full CDN URL
- `objectKey`: S3 object key (e.g., `audio/series-name/lesson-slug.mp3`)
- `audioFormat`: File format (e.g., `mp3`)
- `sizeBytes`: File size in bytes
- `audioSource`: Storage source (e.g., `r2`)
