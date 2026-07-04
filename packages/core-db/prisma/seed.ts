/**
 * packages/core-db/prisma/seed.ts
 *
 * Temporary database seeder for Stage 1 schema verification.
 * Inserts deterministic mock data into the CURRENT schema
 * (Collection, Series, Lecture, Scholar).
 *
 * Idempotent: uses upsert with hardcoded slugs so it is safe to run multiple
 * times without creating duplicate records.
 *
 * Run via:
 *   bun run prisma:seed   (from packages/core-db/)
 *   bun run prisma:seed --filter @sd/core-db  (from monorepo root)
 *
 * Prisma 7 requires a driver adapter (PrismaPg) since the Query Compiler
 * replaced the binary engine. This mirrors the pattern used in
 * apps/api/src/shared/db/prisma.service.ts.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDbEnvFiles } from "../scripts/load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files from packages/core-db/ (parent of prisma/)
loadDbEnvFiles(path.resolve(__dirname, ".."));

const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or DIRECT_DB_URL must be set. Ensure .env is present in packages/core-db/.",
  );
}

// Import Prisma client and adapter AFTER env is loaded
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding database …");

  // ── Scholar ────────────────────────────────────────────────────────────────
  const scholar = await prisma.scholar.upsert({
    where: { slug: "seed-scholar-ibn-baz" },
    create: {
      id: "seed_scholar_001",
      slug: "seed-scholar-ibn-baz",
      name: "Shaykh Ibn Baz (Seed)",
      bio: "Seed record — for schema verification only.",
      isActive: true,
      isKibar: true,
      isFeatured: false,
    },
    update: {
      name: "Shaykh Ibn Baz (Seed)",
    },
  });
  console.log(`  ✓ Scholar: ${scholar.slug}`);

  // ── Collection ─────────────────────────────────────────────────────────────
  const collection = await prisma.collection.upsert({
    where: {
      // unique index is (scholarId, slug)
      scholarId_slug: {
        scholarId: scholar.id,
        slug: "seed-collection-fatawa",
      },
    },
    create: {
      id: "seed_collection_001",
      slug: "seed-collection-fatawa",
      title: "Seed Collection — Fatawa",
      scholarId: scholar.id,
      status: "draft",
    },
    update: {
      title: "Seed Collection — Fatawa",
    },
  });
  console.log(`  ✓ Collection: ${collection.slug}`);

  // ── Series ─────────────────────────────────────────────────────────────────
  const series = await prisma.series.upsert({
    where: {
      scholarId_slug: {
        scholarId: scholar.id,
        slug: "seed-series-aqeedah",
      },
    },
    create: {
      id: "seed_series_001",
      slug: "seed-series-aqeedah",
      title: "Seed Series — Aqeedah",
      scholarId: scholar.id,
      collectionId: collection.id,
      status: "draft",
    },
    update: {
      title: "Seed Series — Aqeedah",
      collectionId: collection.id,
    },
  });
  console.log(`  ✓ Series: ${series.slug}`);

  // ── Lectures (2 required) ──────────────────────────────────────────────────
  const lectureData = [
    {
      id: "seed_lecture_001",
      slug: "seed-lecture-tawheed",
      title: "Seed Lecture 1 — Tawheed",
      orderIndex: 1,
    },
    {
      id: "seed_lecture_002",
      slug: "seed-lecture-shirk",
      title: "Seed Lecture 2 — Shirk",
      orderIndex: 2,
    },
  ];

  for (const lecture of lectureData) {
    const created = await prisma.lecture.upsert({
      where: {
        scholarId_slug: {
          scholarId: scholar.id,
          slug: lecture.slug,
        },
      },
      create: {
        ...lecture,
        scholarId: scholar.id,
        seriesId: series.id,
        status: "draft",
      },
      update: {
        title: lecture.title,
        seriesId: series.id,
      },
    });
    console.log(`  ✓ Lecture: ${created.slug}`);
  }

  console.log("\n✅  Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌  Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
