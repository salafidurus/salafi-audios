import { Prisma } from "@sd/db";
import { TopicDef } from "../schema/content-schema";

export async function upsertTopics(
  tx: Prisma.TransactionClient,
  topics: TopicDef[],
): Promise<Map<string, string>> {
  const topicBySlug = new Map<string, TopicDef>();
  for (const topic of topics) {
    topicBySlug.set(topic.slug, topic);
  }

  const topicIdBySlug = new Map<string, string>();

  for (const topic of topics.filter((entry) => !entry.parentSlug)) {
    const record = await tx.topic.upsert({
      where: { slug: topic.slug },
      create: { slug: topic.slug, name: topic.name },
      update: { name: topic.name },
      select: { id: true, slug: true },
    });
    topicIdBySlug.set(record.slug, record.id);
  }

  const pending = topics.filter((entry) => Boolean(entry.parentSlug));
  const unresolved = new Set(pending.map((entry) => entry.slug));

  while (unresolved.size > 0) {
    let progressed = false;

    for (const slug of Array.from(unresolved)) {
      const topic = topicBySlug.get(slug);
      if (!topic?.parentSlug) continue;

      const parentId = topicIdBySlug.get(topic.parentSlug);
      if (!parentId) continue;

      const record = await tx.topic.upsert({
        where: { slug: topic.slug },
        create: { slug: topic.slug, name: topic.name, parentId },
        update: { name: topic.name, parentId },
        select: { id: true, slug: true },
      });

      topicIdBySlug.set(record.slug, record.id);
      unresolved.delete(slug);
      progressed = true;
    }

    if (!progressed) {
      throw new Error("Unable to resolve topic parent relationships.");
    }
  }

  return topicIdBySlug;
}

function resolveTopicIds(
  topicSlugs: string[],
  topicIdBySlug: Map<string, string>,
  owner: string,
): string[] {
  return topicSlugs.map((slug) => {
    const id = topicIdBySlug.get(slug);
    if (!id) {
      throw new Error(`Unknown topic slug referenced by ${owner}: ${slug}`);
    }
    return id;
  });
}

export async function syncCollectionTopics(
  tx: Prisma.TransactionClient,
  collectionId: string,
  topicSlugs: string[],
  topicIdBySlug: Map<string, string>,
): Promise<void> {
  const topicIds = resolveTopicIds(topicSlugs, topicIdBySlug, "collection");

  await tx.collectionTopic.deleteMany({
    where: {
      collectionId,
      ...(topicIds.length > 0 ? { topicId: { notIn: topicIds } } : {}),
    },
  });

  if (topicIds.length === 0) return;

  await tx.collectionTopic.createMany({
    data: topicIds.map((topicId) => ({ collectionId, topicId })),
    skipDuplicates: true,
  });
}

export async function syncSeriesTopics(
  tx: Prisma.TransactionClient,
  seriesId: string,
  topicSlugs: string[],
  topicIdBySlug: Map<string, string>,
): Promise<void> {
  const topicIds = resolveTopicIds(topicSlugs, topicIdBySlug, "series");

  await tx.seriesTopic.deleteMany({
    where: {
      seriesId,
      ...(topicIds.length > 0 ? { topicId: { notIn: topicIds } } : {}),
    },
  });

  if (topicIds.length === 0) return;

  await tx.seriesTopic.createMany({
    data: topicIds.map((topicId) => ({ seriesId, topicId })),
    skipDuplicates: true,
  });
}

export async function syncLectureTopics(
  tx: Prisma.TransactionClient,
  lectureId: string,
  topicSlugs: string[],
  topicIdBySlug: Map<string, string>,
): Promise<void> {
  const topicIds = resolveTopicIds(topicSlugs, topicIdBySlug, "lecture");

  await tx.lectureTopic.deleteMany({
    where: {
      lectureId,
      ...(topicIds.length > 0 ? { topicId: { notIn: topicIds } } : {}),
    },
  });

  if (topicIds.length === 0) return;

  await tx.lectureTopic.createMany({
    data: topicIds.map((topicId) => ({ lectureId, topicId })),
    skipDuplicates: true,
  });
}
