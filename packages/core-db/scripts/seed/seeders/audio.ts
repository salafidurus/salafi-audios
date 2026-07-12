/**
 * Seed audio assets
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { SINGLES, SERIES, COLLECTIONS } from "../data/index.js";
import { uuid, dur } from "../helpers.js";

/**
 * Helper to upsert an audio asset for a listing
 */
async function upsertAudio(
  prisma: PrismaClient,
  listingId: string,
  audioUrl: string,
  slug: string,
  durationSeconds: number,
) {
  const id = `audio_${slug}`;
  await prisma.audioAsset.upsert({
    where: { id },
    update: {
      listingId,
      url: audioUrl,
      durationSeconds,
    },
    create: {
      id,
      listingId,
      url: audioUrl,
      isPrimary: true,
      durationSeconds,
    },
  });
}

/**
 * Create or update audio assets for all singles, series lessons, and module lessons
 */
export async function seedAudio(prisma: PrismaClient): Promise<number> {
  let audioCount = 0;

  // Audio for singles
  for (const single of SINGLES) {
    const listingId = uuid(single.id);
    await upsertAudio(prisma, listingId, single.audioUrl, single.slug, dur(single.durationMin));
    audioCount++;
  }

  // Audio for series lessons
  for (const series of SERIES) {
    for (const lesson of series.lessons) {
      const lessonId = uuid(lesson.id);
      await upsertAudio(
        prisma,
        lessonId,
        lesson.audioUrl,
        lesson.slug,
        dur(series.lessonDurationMin),
      );
      audioCount++;
    }
  }

  // Audio for collection module lessons
  for (const collection of COLLECTIONS) {
    for (const mod of collection.modules) {
      for (const lesson of mod.lessons) {
        const lessonId = uuid(lesson.id);
        await upsertAudio(
          prisma,
          lessonId,
          lesson.audioUrl,
          lesson.slug,
          dur(collection.lessonDurationMin),
        );
        audioCount++;
      }
    }
  }

  console.log(`✓ Seeded ${audioCount} audio assets`);
  return audioCount;
}
