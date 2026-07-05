/**
 * packages/core-db/prisma/seed.ts
 *
 * Database seeder for Listings-unified schema.
 * Inserts deterministic mock data into the new schema (Listing, Scholar, AudioAsset).
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
  console.log("🌱  Seeding database with unified Listings …");

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

  // ── Collection Listing ─────────────────────────────────────────────────────
  const collectionId = "a0000000-0000-0000-0000-000000000001";
  const collection = await prisma.listing.upsert({
    where: { slug: "seed-collection-fatawa" },
    create: {
      id: collectionId,
      slug: "seed-collection-fatawa",
      title: "Seed Collection — Fatawa",
      description: "Collection of various fatwas on Islamic issues",
      format: "collection",
      scholarId: scholar.id,
      status: "draft",
    },
    update: {
      title: "Seed Collection — Fatawa",
    },
  });
  console.log(`  ✓ Collection Listing: ${collection.slug}`);

  // ── Module Listing (Nested Series) ─────────────────────────────────────────
  const moduleId = "a0000000-0000-0000-0000-000000000002";
  const moduleSeries = await prisma.listing.upsert({
    where: { slug: "seed-series-aqeedah" },
    create: {
      id: moduleId,
      slug: "seed-series-aqeedah",
      title: "Seed Series — Aqeedah",
      description: "Series explaining aqeedah fundamentals",
      format: "series",
      scholarId: scholar.id,
      parentId: collection.id,
      status: "draft",
    },
    update: {
      title: "Seed Series — Aqeedah",
      parentId: collection.id,
    },
  });
  console.log(`  ✓ Module Series Listing: ${moduleSeries.slug}`);

  // ── Lessons (Nested Singles) ───────────────────────────────────────────────
  const lessonData = [
    {
      id: "a0000000-0000-0000-0000-000000000003",
      slug: "seed-lecture-tawheed",
      title: "Seed Lecture 1 — Tawheed",
      orderIndex: 1,
      audioUrl: "https://example.com/audio1.mp3",
    },
    {
      id: "a0000000-0000-0000-0000-000000000004",
      slug: "seed-lecture-shirk",
      title: "Seed Lecture 2 — Shirk",
      orderIndex: 2,
      audioUrl: "https://example.com/audio2.mp3",
    },
  ];

  for (const lesson of lessonData) {
    const created = await prisma.listing.upsert({
      where: { slug: lesson.slug },
      create: {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        format: "single",
        scholarId: scholar.id,
        parentId: moduleSeries.id,
        status: "draft",
        orderIndex: lesson.orderIndex,
      },
      update: {
        title: lesson.title,
        parentId: moduleSeries.id,
        orderIndex: lesson.orderIndex,
      },
    });

    // Create or update AudioAsset for the lesson
    await prisma.audioAsset.upsert({
      where: { id: `audio_${lesson.slug}` },
      create: {
        id: `audio_${lesson.slug}`,
        listingId: created.id,
        url: lesson.audioUrl,
        isPrimary: true,
        durationSeconds: 120,
      },
      update: {
        url: lesson.audioUrl,
        listingId: created.id,
      },
    });

    console.log(`  ✓ Lesson Listing + Audio: ${created.slug}`);
  }

  // ── Standalone Single Listing ──────────────────────────────────────────────
  const standaloneSingleId = "a0000000-0000-0000-0000-000000000005";
  const standaloneSingle = await prisma.listing.upsert({
    where: { slug: "seed-single-hadith" },
    create: {
      id: standaloneSingleId,
      slug: "seed-single-hadith",
      title: "Seed Standalone Single — Hadith",
      description: "Explanation of Hadith Al-Arba'een",
      format: "single",
      scholarId: scholar.id,
      status: "draft",
    },
    update: {
      title: "Seed Standalone Single — Hadith",
    },
  });

  await prisma.audioAsset.upsert({
    where: { id: "audio_seed-single-hadith" },
    create: {
      id: "audio_seed-single-hadith",
      listingId: standaloneSingle.id,
      url: "https://example.com/audio3.mp3",
      isPrimary: true,
      durationSeconds: 300,
    },
    update: {
      url: "https://example.com/audio3.mp3",
      listingId: standaloneSingle.id,
    },
  });
  console.log(`  ✓ Standalone Single Listing + Audio: ${standaloneSingle.slug}`);

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
