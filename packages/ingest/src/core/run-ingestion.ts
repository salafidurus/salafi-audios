import { PrismaClient, Prisma, Status } from "@sd/db";
import { S3Client } from "@aws-sdk/client-s3";
import { ContentDefinition, LectureDef } from "../schema/content-schema";
import { syncLectureAudioAssets } from "./audio-assets";
import { DryRunRollbackError } from "./errors";
import { createR2Client, parseR2Config, R2Config } from "../storage/r2";
import {
  syncCollectionTopics,
  syncLectureTopics,
  syncSeriesTopics,
  upsertTopics,
} from "./topic-sync";

export type IngestionOptions = {
  tag: string;
  environment: string;
  dryRun: boolean;
  strictAudioUpload: boolean;
  audioBaseDir?: string;
};

export type IngestionCounters = {
  scholars: number;
  collections: number;
  series: number;
  lectures: number;
};

function parseDate(input?: string): Date | null {
  if (!input) return null;
  return new Date(input);
}

function computePublishedAt(status: Status, publishedAt?: string): Date | null {
  if (publishedAt) return new Date(publishedAt);
  if (status === Status.published) return new Date();
  return null;
}

function isTruthyDate(input?: string): boolean {
  return Boolean(input && input.trim().length > 0);
}

function computePublishedLectureAggregates(lectures: LectureDef[]): {
  publishedLectureCount: number;
  publishedDurationSeconds: number | null;
} {
  const published = lectures.filter(
    (l) => l.status === Status.published && !isTruthyDate(l.deletedAt),
  );

  const publishedLectureCount = published.length;
  if (publishedLectureCount === 0) {
    return { publishedLectureCount: 0, publishedDurationSeconds: 0 };
  }

  const durations = published.map((l) => l.durationSeconds);
  const hasAllDurations = durations.every((d) => typeof d === "number" && Number.isFinite(d));
  if (!hasAllDurations) {
    return { publishedLectureCount, publishedDurationSeconds: null };
  }

  const publishedDurationSeconds = durations.reduce<number>((sum, d) => sum + (d as number), 0);
  return { publishedLectureCount, publishedDurationSeconds };
}

async function upsertLecture(
  tx: Prisma.TransactionClient,
  input: {
    scholarId: string;
    scholarSlug: string;
    lecture: LectureDef;
    seriesId: string | null;
    topicIdBySlug: Map<string, string>;
    ingestionBatchId: string;
    options: IngestionOptions;
    counters: IngestionCounters;
    r2Client: S3Client | null;
    r2Config: R2Config | null;
  },
): Promise<void> {
  const lectureRecord = await tx.lecture.upsert({
    where: {
      scholarId_slug: {
        scholarId: input.scholarId,
        slug: input.lecture.slug,
      },
    },
    create: {
      scholarId: input.scholarId,
      seriesId: input.seriesId,
      slug: input.lecture.slug,
      title: input.lecture.title,
      description: input.lecture.description,
      language: input.lecture.language,
      status: input.lecture.status,
      publishedAt: computePublishedAt(input.lecture.status, input.lecture.publishedAt),
      orderIndex: input.lecture.orderIndex,
      durationSeconds: input.lecture.durationSeconds,
      deletedAt: parseDate(input.lecture.deletedAt),
      deleteAfterAt: parseDate(input.lecture.deleteAfterAt),
      ingestionBatchId: input.ingestionBatchId,
    },
    update: {
      seriesId: input.seriesId,
      title: input.lecture.title,
      description: input.lecture.description,
      language: input.lecture.language,
      status: input.lecture.status,
      publishedAt: computePublishedAt(input.lecture.status, input.lecture.publishedAt),
      orderIndex: input.lecture.orderIndex,
      durationSeconds: input.lecture.durationSeconds,
      deletedAt: parseDate(input.lecture.deletedAt),
      deleteAfterAt: parseDate(input.lecture.deleteAfterAt),
      ingestionBatchId: input.ingestionBatchId,
    },
    select: { id: true },
  });

  await syncLectureTopics(tx, lectureRecord.id, input.lecture.topicSlugs, input.topicIdBySlug);

  await syncLectureAudioAssets(tx, {
    lectureId: lectureRecord.id,
    scholarSlug: input.scholarSlug,
    lectureSlug: input.lecture.slug,
    audioAssets: input.lecture.audioAssets,
    ingestionBatchId: input.ingestionBatchId,
    environment: input.options.environment,
    batchTag: input.options.tag,
    strictAudioUpload: input.options.strictAudioUpload,
    r2Client: input.r2Client,
    r2Config: input.r2Config,
    audioBaseDir: input.options.audioBaseDir,
  });

  input.counters.lectures += 1;
}

export async function runIngestion(
  prisma: PrismaClient,
  definition: ContentDefinition,
  options: IngestionOptions,
): Promise<IngestionCounters> {
  const r2Config = parseR2Config();
  const r2Client = r2Config ? createR2Client(r2Config) : null;

  const counters: IngestionCounters = {
    scholars: 0,
    collections: 0,
    series: 0,
    lectures: 0,
  };

  await prisma.$transaction(async (tx) => {
    const batch = await tx.ingestionBatch.upsert({
      where: {
        tag_environment: {
          tag: options.tag,
          environment: options.environment,
        },
      },
      create: {
        tag: options.tag,
        environment: options.environment,
      },
      update: {},
      select: { id: true },
    });

    const topicIdBySlug = await upsertTopics(tx, definition.topics);

    for (const scholar of definition.scholars) {
      const scholarRecord = await tx.scholar.upsert({
        where: { slug: scholar.slug },
        create: {
          slug: scholar.slug,
          name: scholar.name,
          bio: scholar.bio,
          country: scholar.country,
          mainLanguage: scholar.mainLanguage,
          imageUrl: scholar.imageUrl,
          isActive: scholar.isActive,
          ingestionBatchId: batch.id,
        },
        update: {
          name: scholar.name,
          bio: scholar.bio,
          country: scholar.country,
          mainLanguage: scholar.mainLanguage,
          imageUrl: scholar.imageUrl,
          isActive: scholar.isActive,
          ingestionBatchId: batch.id,
        },
        select: { id: true },
      });
      counters.scholars += 1;

      for (const collection of scholar.collections) {
        const collectionLectureAgg = computePublishedLectureAggregates(
          collection.series.flatMap((s) => s.lectures),
        );

        const collectionRecord = await tx.collection.upsert({
          where: {
            scholarId_slug: {
              scholarId: scholarRecord.id,
              slug: collection.slug,
            },
          },
          create: {
            scholarId: scholarRecord.id,
            slug: collection.slug,
            title: collection.title,
            description: collection.description,
            coverImageUrl: collection.coverImageUrl,
            language: collection.language,
            status: collection.status,
            orderIndex: collection.orderIndex,
            publishedLectureCount: collectionLectureAgg.publishedLectureCount,
            publishedDurationSeconds: collectionLectureAgg.publishedDurationSeconds,
            deletedAt: parseDate(collection.deletedAt),
            deleteAfterAt: parseDate(collection.deleteAfterAt),
            ingestionBatchId: batch.id,
          },
          update: {
            title: collection.title,
            description: collection.description,
            coverImageUrl: collection.coverImageUrl,
            language: collection.language,
            status: collection.status,
            orderIndex: collection.orderIndex,
            publishedLectureCount: collectionLectureAgg.publishedLectureCount,
            publishedDurationSeconds: collectionLectureAgg.publishedDurationSeconds,
            deletedAt: parseDate(collection.deletedAt),
            deleteAfterAt: parseDate(collection.deleteAfterAt),
            ingestionBatchId: batch.id,
          },
          select: { id: true },
        });
        counters.collections += 1;

        await syncCollectionTopics(tx, collectionRecord.id, collection.topicSlugs, topicIdBySlug);

        for (const series of collection.series) {
          const seriesLectureAgg = computePublishedLectureAggregates(series.lectures);
          const seriesRecord = await tx.series.upsert({
            where: {
              scholarId_slug: {
                scholarId: scholarRecord.id,
                slug: series.slug,
              },
            },
            create: {
              scholarId: scholarRecord.id,
              collectionId: collectionRecord.id,
              slug: series.slug,
              title: series.title,
              description: series.description,
              coverImageUrl: series.coverImageUrl,
              language: series.language,
              status: series.status,
              orderIndex: series.orderIndex,
              publishedLectureCount: seriesLectureAgg.publishedLectureCount,
              publishedDurationSeconds: seriesLectureAgg.publishedDurationSeconds,
              deletedAt: parseDate(series.deletedAt),
              deleteAfterAt: parseDate(series.deleteAfterAt),
              ingestionBatchId: batch.id,
            },
            update: {
              collectionId: collectionRecord.id,
              title: series.title,
              description: series.description,
              coverImageUrl: series.coverImageUrl,
              language: series.language,
              status: series.status,
              orderIndex: series.orderIndex,
              publishedLectureCount: seriesLectureAgg.publishedLectureCount,
              publishedDurationSeconds: seriesLectureAgg.publishedDurationSeconds,
              deletedAt: parseDate(series.deletedAt),
              deleteAfterAt: parseDate(series.deleteAfterAt),
              ingestionBatchId: batch.id,
            },
            select: { id: true },
          });
          counters.series += 1;

          await syncSeriesTopics(tx, seriesRecord.id, series.topicSlugs, topicIdBySlug);

          for (const lecture of series.lectures) {
            await upsertLecture(tx, {
              scholarId: scholarRecord.id,
              scholarSlug: scholar.slug,
              lecture,
              seriesId: seriesRecord.id,
              topicIdBySlug,
              ingestionBatchId: batch.id,
              options,
              counters,
              r2Client,
              r2Config,
            });
          }
        }
      }

      for (const series of scholar.series) {
        const seriesLectureAgg = computePublishedLectureAggregates(series.lectures);
        const seriesRecord = await tx.series.upsert({
          where: {
            scholarId_slug: {
              scholarId: scholarRecord.id,
              slug: series.slug,
            },
          },
          create: {
            scholarId: scholarRecord.id,
            collectionId: null,
            slug: series.slug,
            title: series.title,
            description: series.description,
            coverImageUrl: series.coverImageUrl,
            language: series.language,
            status: series.status,
            orderIndex: series.orderIndex,
            publishedLectureCount: seriesLectureAgg.publishedLectureCount,
            publishedDurationSeconds: seriesLectureAgg.publishedDurationSeconds,
            deletedAt: parseDate(series.deletedAt),
            deleteAfterAt: parseDate(series.deleteAfterAt),
            ingestionBatchId: batch.id,
          },
          update: {
            collectionId: null,
            title: series.title,
            description: series.description,
            coverImageUrl: series.coverImageUrl,
            language: series.language,
            status: series.status,
            orderIndex: series.orderIndex,
            publishedLectureCount: seriesLectureAgg.publishedLectureCount,
            publishedDurationSeconds: seriesLectureAgg.publishedDurationSeconds,
            deletedAt: parseDate(series.deletedAt),
            deleteAfterAt: parseDate(series.deleteAfterAt),
            ingestionBatchId: batch.id,
          },
          select: { id: true },
        });
        counters.series += 1;

        await syncSeriesTopics(tx, seriesRecord.id, series.topicSlugs, topicIdBySlug);

        for (const lecture of series.lectures) {
          await upsertLecture(tx, {
            scholarId: scholarRecord.id,
            scholarSlug: scholar.slug,
            lecture,
            seriesId: seriesRecord.id,
            topicIdBySlug,
            ingestionBatchId: batch.id,
            options,
            counters,
            r2Client,
            r2Config,
          });
        }
      }

      for (const lecture of scholar.lectures) {
        await upsertLecture(tx, {
          scholarId: scholarRecord.id,
          scholarSlug: scholar.slug,
          lecture,
          seriesId: null,
          topicIdBySlug,
          ingestionBatchId: batch.id,
          options,
          counters,
          r2Client,
          r2Config,
        });
      }
    }

    if (options.dryRun) {
      throw new DryRunRollbackError("Dry-run rollback");
    }
  });

  return counters;
}
