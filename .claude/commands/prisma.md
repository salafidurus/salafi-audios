# Prisma Development Guide

Use context7 to query Prisma documentation: `/prisma/docs` or `/prisma/skills`

## MCP Server

Local Prisma MCP provides database workflow tools:

- Migration status
- Schema introspection
- Query assistance

## Project Structure (This Project)

Database package: `packages/db/`

```
packages/db/
├── prisma/
│   ├── schema.prisma      # Schema definition
│   └── migrations/        # Migration files
├── src/
│   ├── index.ts           # Exports
│   └── generated/         # Prisma Client (gitignored)
└── dist/
    └── generated/         # Built Prisma Client (cached)
```

## Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lecture {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  status      Status   @default(DRAFT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  scholar     Scholar  @relation(fields: [scholarId], references: [id])
  scholarId   String
  topics      LectureTopic[]
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## Commands (scoped to @sd/db)

```bash
# Generate Prisma Client
pnpm --filter @sd/db prisma:generate

# Validate schema
pnpm --filter @sd/db prisma:validate

# Format schema
pnpm --filter @sd/db prisma:format

# Create migration (without applying)
pnpm --filter @sd/db migrate:create-only

# Apply migrations
pnpm --filter @sd/db migrate:deploy

# Open Prisma Studio
pnpm --filter @sd/db prisma studio
```

## Common Queries

### Find

```typescript
// Find many
const lectures = await prisma.lecture.findMany({
  where: { status: "PUBLISHED" },
  include: { scholar: true, topics: true },
  orderBy: { createdAt: "desc" },
});

// Find unique
const lecture = await prisma.lecture.findUnique({
  where: { slug: "lecture-slug" },
});

// Find first
const lecture = await prisma.lecture.findFirst({
  where: { scholarId: "..." },
});
```

### Create

```typescript
const lecture = await prisma.lecture.create({
  data: {
    title: "New Lecture",
    slug: "new-lecture",
    scholarId: "...",
  },
});
```

### Update

```typescript
const lecture = await prisma.lecture.update({
  where: { id: "..." },
  data: { status: "PUBLISHED" },
});
```

### Delete

```typescript
await prisma.lecture.delete({
  where: { id: "..." },
});
```

### Transactions

```typescript
const [lecture, event] = await prisma.$transaction([
  prisma.lecture.update({ ... }),
  prisma.event.create({ ... }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const lecture = await tx.lecture.findUnique({ ... });
  if (!lecture) throw new Error('Not found');
  await tx.lecture.update({ ... });
});
```

## Rules (This Project)

- Primary DB stores authoritative relational state ONLY
- Media = references/metadata, NEVER blobs in DB
- Analytics/events OUT of authoritative core tables
- Migrations are first-class and reviewable
- `packages/db/src/generated/` is derived (gitignored)
- `packages/db/dist/generated/` is cached for CI

## CI Notes

If `Cannot find module '@sd/db/client'`:

```bash
pnpm --filter @sd/db build
```

This runs `prisma generate` and copies output to `dist/generated/`.

## Documentation Lookup

When you need Prisma docs, use context7:

```
Query context7 with library ID: /prisma/docs
```

Topics: schema, models, relations, types, enums, attributes, indexes, constraints, migrations, seeding, Prisma Client, CRUD, filtering, sorting, pagination, aggregation, grouping, transactions, raw queries, connection management, logging, error handling, middleware, extensions, Prisma Studio, introspection, PostgreSQL, MySQL, SQLite, MongoDB, SQL Server, CockroachDB
