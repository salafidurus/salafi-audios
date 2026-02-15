import { PrismaClient } from "@sd/db";
import { createR2Client, deleteKeys, listKeysByPrefix, parseR2Config } from "../storage/r2";

export type RemovalOptions = {
  tag: string;
  environment: string;
  dryRun: boolean;
  skipR2: boolean;
};

export type RemovalCounters = {
  scholars: number;
  collections: number;
  series: number;
  lectures: number;
  audioAssets: number;
  topics: number;
  r2Keys: number;
};

function isStorageKey(value: string): boolean {
  return !/^[a-z]+:\/\//i.test(value);
}

export async function runRemoval(
  prisma: PrismaClient,
  options: RemovalOptions,
): Promise<RemovalCounters> {
  const batch = await prisma.ingestionBatch.findUnique({
    where: {
      tag_environment: {
        tag: options.tag,
        environment: options.environment,
      },
    },
    select: { id: true },
  });

  if (!batch) {
    throw new Error(
      `Ingestion batch not found for tag=${options.tag} environment=${options.environment}`,
    );
  }

  const [scholars, collections, series, lectures, audioAssets, batchAudioAssets] =
    await Promise.all([
      prisma.scholar.count({ where: { ingestionBatchId: batch.id } }),
      prisma.collection.count({ where: { ingestionBatchId: batch.id } }),
      prisma.series.count({ where: { ingestionBatchId: batch.id } }),
      prisma.lecture.count({ where: { ingestionBatchId: batch.id } }),
      prisma.audioAsset.count({ where: { ingestionBatchId: batch.id } }),
      prisma.audioAsset.findMany({
        where: { ingestionBatchId: batch.id },
        select: { url: true },
      }),
    ]);

  const counters: RemovalCounters = {
    scholars,
    collections,
    series,
    lectures,
    audioAssets,
    topics: 0,
    r2Keys: 0,
  };

  const [lectureIds, seriesIds, collectionIds] = await Promise.all([
    prisma.lecture.findMany({ where: { ingestionBatchId: batch.id }, select: { id: true } }),
    prisma.series.findMany({ where: { ingestionBatchId: batch.id }, select: { id: true } }),
    prisma.collection.findMany({ where: { ingestionBatchId: batch.id }, select: { id: true } }),
  ]);

  const lectureIdValues = lectureIds.map((item) => item.id);
  const seriesIdValues = seriesIds.map((item) => item.id);
  const collectionIdValues = collectionIds.map((item) => item.id);

  const [lectureTopicLinks, seriesTopicLinks, collectionTopicLinks] = await Promise.all([
    prisma.lectureTopic.findMany({
      where: { lectureId: { in: lectureIdValues } },
      select: { topicId: true },
    }),
    prisma.seriesTopic.findMany({
      where: { seriesId: { in: seriesIdValues } },
      select: { topicId: true },
    }),
    prisma.collectionTopic.findMany({
      where: { collectionId: { in: collectionIdValues } },
      select: { topicId: true },
    }),
  ]);

  const candidateTopicIds = new Set<string>([
    ...lectureTopicLinks.map((item) => item.topicId),
    ...seriesTopicLinks.map((item) => item.topicId),
    ...collectionTopicLinks.map((item) => item.topicId),
  ]);

  const dbKeys = batchAudioAssets.map((item) => item.url).filter(isStorageKey);
  const prefix = `ingestion/${options.environment}/${options.tag}/`;

  if (!options.skipR2) {
    const r2Config = parseR2Config();
    if (!r2Config) {
      throw new Error(
        "R2 config is required for removal. Set --skip-r2 to remove only DB records.",
      );
    }

    const r2Client = createR2Client(r2Config);
    const listedKeys = await listKeysByPrefix(r2Client, r2Config, prefix);
    const keySet = new Set<string>([...dbKeys, ...listedKeys]);
    counters.r2Keys = keySet.size;

    if (!options.dryRun && keySet.size > 0) {
      await deleteKeys(r2Client, r2Config, Array.from(keySet));
    }
  }

  if (!options.dryRun) {
    await prisma.$transaction(async (tx) => {
      await tx.audioAsset.deleteMany({ where: { ingestionBatchId: batch.id } });
      await tx.lecture.deleteMany({ where: { ingestionBatchId: batch.id } });
      await tx.series.deleteMany({ where: { ingestionBatchId: batch.id } });
      await tx.collection.deleteMany({ where: { ingestionBatchId: batch.id } });
      await tx.scholar.deleteMany({ where: { ingestionBatchId: batch.id } });

      if (candidateTopicIds.size > 0) {
        const removableTopicIds: string[] = [];

        for (const topicId of Array.from(candidateTopicIds)) {
          const [lectureRefs, seriesRefs, collectionRefs] = await Promise.all([
            tx.lectureTopic.count({ where: { topicId } }),
            tx.seriesTopic.count({ where: { topicId } }),
            tx.collectionTopic.count({ where: { topicId } }),
          ]);

          if (lectureRefs === 0 && seriesRefs === 0 && collectionRefs === 0) {
            removableTopicIds.push(topicId);
          }
        }

        if (removableTopicIds.length > 0) {
          const deletedTopics = await tx.topic.deleteMany({
            where: { id: { in: removableTopicIds } },
          });
          counters.topics = deletedTopics.count;
        }
      }

      await tx.ingestionBatch.delete({ where: { id: batch.id } });
    });
  }

  return counters;
}
