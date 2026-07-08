/**
 * Seed listings (singles, series, collections with modules and lessons)
 */

import type { PrismaClient, ListingFormat, Status } from "../../../src/generated/prisma/client.js";
import { SCHOLARS, TOPICS, SINGLES, SERIES, COLLECTIONS } from "../data/index.js";
import { uuid, seedStatus, dur } from "../helpers.js";
import type { TopicPair } from "../types.js";

/**
 * Helper to create a listing record
 */
async function createListing(
  prisma: PrismaClient,
  id: string,
  slug: string,
  title: string,
  description: string,
  format: ListingFormat,
  scholarId: string,
  parentId: string | undefined,
  status: Status,
  orderIndex: number | undefined,
  durationSeconds: number | undefined,
) {
  return prisma.listing.create({
    data: {
      id,
      slug,
      title,
      description,
      format,
      scholarId,
      parentId,
      status,
      orderIndex,
      durationSeconds,
      publishedAt: status === "published" ? new Date() : undefined,
    },
  });
}

/**
 * Seed all listings: singles, series, and collections
 */
export async function seedListings(prisma: PrismaClient): Promise<{
  singleCount: number;
  seriesCount: number;
  seriesLessonCount: number;
  collectionCount: number;
  moduleCount: number;
  moduleLessonCount: number;
  topicPairs: TopicPair[];
}> {
  let currentGlobalIndex = 0;
  const topicPairs: TopicPair[] = [];

  // ── Singles ──
  let singleCount = 0;
  for (const single of SINGLES) {
    const listingId = uuid(single.id);
    const status = seedStatus(currentGlobalIndex++);
    await createListing(
      prisma,
      listingId,
      single.slug,
      single.title,
      single.desc,
      "single",
      SCHOLARS[single.scholarIdx].id,
      undefined,
      status,
      undefined,
      dur(single.durationMin),
    );
    topicPairs.push({ listingId, topicId: TOPICS[single.topicIdx].id });
    singleCount++;
  }
  console.log(`✓ Created ${singleCount} singles`);

  // ── Series ──
  let seriesCount = 0;
  let seriesLessonCount = 0;
  for (const series of SERIES) {
    const seriesId = uuid(series.id);
    const scholarId = SCHOLARS[series.scholarIdx].id;
    const status = seedStatus(currentGlobalIndex++);

    await createListing(
      prisma,
      seriesId,
      series.slug,
      series.title,
      series.desc,
      "series",
      scholarId,
      undefined,
      status,
      undefined,
      undefined,
    );
    topicPairs.push({ listingId: seriesId, topicId: TOPICS[series.topicIdx].id });
    seriesCount++;

    for (let i = 0; i < series.lessons.length; i++) {
      const lesson = series.lessons[i];
      const lessonId = uuid(lesson.id);
      const lessonStatus = seedStatus(currentGlobalIndex++);
      const lessonTitle = `al-Dars ${i + 1}: ${series.title}`;

      await createListing(
        prisma,
        lessonId,
        lesson.slug,
        lessonTitle,
        `al-Dars ${i + 1} min ${series.title}`,
        "single",
        scholarId,
        seriesId,
        lessonStatus,
        i + 1,
        dur(series.lessonDurationMin),
      );
      topicPairs.push({ listingId: lessonId, topicId: TOPICS[series.topicIdx].id });
      seriesLessonCount++;
    }
  }
  console.log(`✓ Created ${seriesCount} series with ${seriesLessonCount} lessons`);

  // ── Collections ──
  let collectionCount = 0;
  let moduleCount = 0;
  let moduleLessonCount = 0;

  for (const collection of COLLECTIONS) {
    const collectionId = uuid(collection.id);
    const scholarId = SCHOLARS[collection.scholarIdx].id;
    const collectionStatus = seedStatus(currentGlobalIndex++);

    await createListing(
      prisma,
      collectionId,
      collection.slug,
      collection.title,
      collection.desc,
      "collection",
      scholarId,
      undefined,
      collectionStatus,
      undefined,
      undefined,
    );
    topicPairs.push({ listingId: collectionId, topicId: TOPICS[collection.topicIdx].id });
    collectionCount++;

    for (const [modIdx, mod] of collection.modules.entries()) {
      const moduleId = uuid(mod.id);
      await createListing(
        prisma,
        moduleId,
        `${collection.slug}-mod-${mod.id}`,
        mod.title,
        mod.desc,
        "series",
        scholarId,
        collectionId,
        "published",
        modIdx + 1,
        undefined,
      );
      topicPairs.push({ listingId: moduleId, topicId: TOPICS[collection.topicIdx].id });
      moduleCount++;

      for (let i = 0; i < mod.lessonCount; i++) {
        const lessonIndex = moduleLessonCount;
        const lessonIdNum = 500 + lessonIndex;
        const slug = `${collection.slug}-mod-${mod.id}-lsn-${i + 1}`;
        const lessonId = uuid(lessonIdNum);
        const lessonStatus = seedStatus(currentGlobalIndex++);
        const lessonTitle = `al-Dars ${i + 1}: ${mod.title}`;

        await createListing(
          prisma,
          lessonId,
          slug,
          lessonTitle,
          `Lesson ${i + 1} of ${mod.title} - ${collection.title}`,
          "single",
          scholarId,
          moduleId,
          lessonStatus,
          i + 1,
          dur(collection.lessonDurationMin),
        );
        topicPairs.push({ listingId: lessonId, topicId: TOPICS[collection.topicIdx].id });
        moduleLessonCount++;
      }
    }
  }
  console.log(
    `✓ Created ${collectionCount} collections, ${moduleCount} modules, ${moduleLessonCount} lessons`,
  );

  return {
    singleCount,
    seriesCount,
    seriesLessonCount,
    collectionCount,
    moduleCount,
    moduleLessonCount,
    topicPairs,
  };
}
