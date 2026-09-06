/**
 * Seed listings (singles, series, collections with modules and lessons)
 */

import type {
  PrismaClient,
  ListingFormat,
  Locale,
  Status,
} from "../../../src/generated/primary/client.js";
import type { TopicPair } from "../types.js";

import { SCHOLARS, TOPICS, SINGLES, SERIES, COLLECTIONS } from "../data/index.js";
import { uuid, seedStatus, dur } from "../helpers.js";

/**
 * Helper to upsert a listing record
 */
async function upsertListing(
  prisma: PrismaClient,
  id: string,
  slug: string,
  title: string,
  description: string | undefined,
  format: ListingFormat,
  scholarId: string,
  parentId: string | undefined,
  status: Status,
  orderIndex: number | undefined,
  durationSeconds: number | undefined,
  language?: Locale,
) {
  return prisma.listing.upsert({
    where: { id },
    update: {
      slug,
      title,
      description: description || undefined,
      format,
      scholarId,
      parentId,
      status,
      orderIndex,
      durationSeconds,
      language,
    },
    create: {
      id,
      slug,
      title,
      description: description || undefined,
      format,
      scholarId,
      parentId: parentId ?? undefined,
      status,
      orderIndex,
      durationSeconds,
      language,
      publishedAt: status === "published" ? new Date() : undefined,
    },
  });
}

/**
 * Upsert Arabic and English translations for a listing
 */
async function upsertTranslations(
  prisma: PrismaClient,
  listingId: string,
  title: string,
  description: string | undefined,
  titleEn?: string,
  descEn?: string,
) {
  await prisma.listingTranslation.upsert({
    where: { listingId_locale: { listingId, locale: "ar" } },
    update: { title, description: description ?? null, status: "published" },
    create: {
      listingId,
      locale: "ar",
      title,
      description: description ?? null,
      status: "published",
    },
  });
  if (titleEn) {
    await prisma.listingTranslation.upsert({
      where: { listingId_locale: { listingId, locale: "en" } },
      update: { title: titleEn, description: descEn ?? null, status: "published" },
      create: {
        listingId,
        locale: "en",
        title: titleEn,
        description: descEn ?? null,
        status: "published",
      },
    });
  }
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

  const logError = (e: any, ctx: string) => {
    if (e.code === "P2003") {
      throw new Error(`FK violation at ${ctx}: ${JSON.stringify(e.meta)}`);
    }
    throw e;
  };

  // ── Singles ──
  let singleCount = 0;
  for (const single of SINGLES) {
    const listingId = uuid(single.id);
    const status = single.id === 100 ? "published" : seedStatus(currentGlobalIndex++);
    try {
      await upsertListing(
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
        single.language,
      );
      await upsertTranslations(
        prisma,
        listingId,
        single.title,
        single.desc,
        single.titleEn,
        single.descEn,
      );
    } catch (e) {
      logError(e, `single ${single.id} (${single.slug})`);
    }
    topicPairs.push({ listingId, topicId: TOPICS[single.topicIdx].id });
    singleCount++;
  }
  console.log(`✓ Seeded ${singleCount} singles`);

  // ── Series ──
  let seriesCount = 0;
  let seriesLessonCount = 0;
  for (const series of SERIES) {
    const seriesId = uuid(series.id);
    const scholarId = SCHOLARS[series.scholarIdx].id;
    const status = seedStatus(currentGlobalIndex++);

    await upsertListing(
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
      series.language,
    );
    await upsertTranslations(
      prisma,
      seriesId,
      series.title,
      series.desc,
      series.titleEn,
      series.descEn,
    );
    topicPairs.push({ listingId: seriesId, topicId: TOPICS[series.topicIdx].id });
    seriesCount++;

    for (let i = 0; i < series.lessons.length; i++) {
      const lesson = series.lessons[i];
      const lessonId = uuid(lesson.id);
      const lessonStatus = seedStatus(currentGlobalIndex++);
      const lessonTitle = lesson.title || `al-Dars ${i + 1}`;

      await upsertListing(
        prisma,
        lessonId,
        lesson.slug,
        lessonTitle,
        undefined,
        "single",
        scholarId,
        seriesId,
        lessonStatus,
        i + 1,
        dur(series.lessonDurationMin),
        lesson.language,
      );
      await upsertTranslations(prisma, lessonId, lessonTitle, undefined, lesson.titleEn);
      topicPairs.push({ listingId: lessonId, topicId: TOPICS[series.topicIdx].id });
      seriesLessonCount++;
    }
  }
  console.log(`✓ Seeded ${seriesCount} series with ${seriesLessonCount} lessons`);

  // ── Collections ──
  let collectionCount = 0;
  let moduleCount = 0;
  let moduleLessonCount = 0;

  for (const collection of COLLECTIONS) {
    const collectionId = uuid(collection.id);
    const scholarId = SCHOLARS[collection.scholarIdx].id;
    const collectionStatus = seedStatus(currentGlobalIndex++);

    try {
      await upsertListing(
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
        collection.language,
      );
      await upsertTranslations(
        prisma,
        collectionId,
        collection.title,
        collection.desc,
        collection.titleEn,
        collection.descEn,
      );
    } catch (e) {
      logError(e, `collection ${collection.id} (${collection.slug})`);
    }
    topicPairs.push({ listingId: collectionId, topicId: TOPICS[collection.topicIdx].id });
    collectionCount++;

    for (const [modIdx, mod] of collection.modules.entries()) {
      const moduleId = uuid(mod.id);
      try {
        await upsertListing(
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
          mod.language,
        );
        await upsertTranslations(prisma, moduleId, mod.title, mod.desc, mod.titleEn, mod.descEn);
      } catch (e) {
        logError(e, `module ${mod.id} in collection ${collection.id}`);
      }
      topicPairs.push({ listingId: moduleId, topicId: TOPICS[collection.topicIdx].id });
      moduleCount++;

      for (let i = 0; i < mod.lessons.length; i++) {
        const lesson = mod.lessons[i];
        const lessonId = uuid(lesson.id);
        const lessonStatus = seedStatus(currentGlobalIndex++);
        const lessonTitle = lesson.title || `al-Dars ${i + 1}: ${mod.title}`;

        try {
          await upsertListing(
            prisma,
            lessonId,
            lesson.slug,
            lessonTitle,
            undefined,
            "single",
            scholarId,
            moduleId,
            lessonStatus,
            i + 1,
            dur(collection.lessonDurationMin),
            lesson.language,
          );
          await upsertTranslations(prisma, lessonId, lessonTitle, undefined, lesson.titleEn);
        } catch (e) {
          logError(e, `lesson ${lesson.id} in module ${mod.id} (${lesson.slug})`);
        }
        topicPairs.push({ listingId: lessonId, topicId: TOPICS[collection.topicIdx].id });
        moduleLessonCount++;
      }
    }
  }
  console.log(
    `✓ Seeded ${collectionCount} collections, ${moduleCount} modules, ${moduleLessonCount} lessons`,
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
