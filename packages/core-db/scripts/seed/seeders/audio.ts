/**
 * Seed audio assets
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { SINGLES, SERIES, COLLECTIONS } from "../data/index.js";
import { uuid, dur } from "../helpers.js";
import { MEDIA_CDN_BASE_URL } from "../database.js";

/**
 * Helper to create an audio asset for a listing
 */
async function createAudio(
  prisma: PrismaClient,
  listingId: string,
  slug: string,
  durationSeconds: number,
) {
  await prisma.audioAsset.create({
    data: {
      id: `audio_${slug}`,
      listingId,
      url: `${MEDIA_CDN_BASE_URL}/${slug}.mp3`,
      isPrimary: true,
      durationSeconds,
    },
  });
}

/**
 * Create audio assets for all singles, series lessons, and module lessons
 */
export async function seedAudio(prisma: PrismaClient): Promise<number> {
  let audioCount = 0;

  // Audio for singles
  for (const single of SINGLES) {
    const listingId = uuid(single.id);
    await createAudio(prisma, listingId, single.slug, dur(single.durationMin));
    audioCount++;
  }

  // Audio for series lessons
  for (const series of SERIES) {
    for (const lesson of series.lessons) {
      const lessonId = uuid(lesson.id);
      await createAudio(prisma, lessonId, lesson.slug, dur(series.lessonDurationMin));
      audioCount++;
    }
  }

  // Audio for collection module lessons
  let moduleLessonIndex = 0;
  for (const collection of COLLECTIONS) {
    for (const mod of collection.modules) {
      for (let i = 0; i < mod.lessonCount; i++) {
        const lessonIdNum = 500 + moduleLessonIndex;
        const slug = `${collection.slug}-mod-${mod.id}-lsn-${i + 1}`;
        const lessonId = uuid(lessonIdNum);
        await createAudio(prisma, lessonId, slug, dur(collection.lessonDurationMin));
        moduleLessonIndex++;
        audioCount++;
      }
    }
  }

  console.log(`✓ Created ${audioCount} audio assets`);
  return audioCount;
}
