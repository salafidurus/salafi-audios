import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma, Status } from '@sd/db';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';

const topicSelect = {
  id: true,
  slug: true,
  name: true,
} satisfies Prisma.TopicSelect;

const collectionTopicSelect = {
  createdAt: true,
  topic: { select: topicSelect },
} satisfies Prisma.CollectionTopicSelect;

type CollectionTopicRecord = Prisma.CollectionTopicGetPayload<{
  select: typeof collectionTopicSelect;
}>;

@Injectable()
export class CollectionTopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByScholarAndCollectionSlug(
    scholarSlug: string,
    collectionSlug: string,
  ): Promise<LectureTopicViewDto[] | null> {
    const collection = await this.findCollectionIdBySlugs(
      scholarSlug,
      collectionSlug,
    );
    if (!collection) return null;

    const rows = await this.prisma.collectionTopic.findMany({
      where: { collectionId: collection.id },
      orderBy: { createdAt: 'asc' },
      select: collectionTopicSelect,
    });

    return rows.map((r) => this.toViewDto(r));
  }

  async attach(
    scholarSlug: string,
    collectionSlug: string,
    topicSlug: string,
  ): Promise<LectureTopicViewDto | null> {
    const collection = await this.findCollectionIdBySlugs(
      scholarSlug,
      collectionSlug,
    );
    if (!collection) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) return null;

    const row = await this.prisma.collectionTopic.upsert({
      where: {
        collectionId_topicId: {
          collectionId: collection.id,
          topicId: topic.id,
        },
      },
      create: {
        collectionId: collection.id,
        topicId: topic.id,
      },
      update: {},
      select: collectionTopicSelect,
    });

    return this.toViewDto(row);
  }

  async detach(
    scholarSlug: string,
    collectionSlug: string,
    topicSlug: string,
  ): Promise<boolean | null> {
    const collection = await this.findCollectionIdBySlugs(
      scholarSlug,
      collectionSlug,
    );
    if (!collection) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) return null;

    await this.prisma.collectionTopic.deleteMany({
      where: { collectionId: collection.id, topicId: topic.id },
    });

    return true;
  }

  private async findCollectionIdBySlugs(
    scholarSlug: string,
    collectionSlug: string,
  ): Promise<{ id: string } | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return null;

    const collection = await this.prisma.collection.findFirst({
      where: {
        scholarId: scholar.id,
        slug: collectionSlug,
        deletedAt: null,
        status: Status.published,
      },
      select: { id: true },
    });

    return collection ?? null;
  }

  private toViewDto(r: CollectionTopicRecord): LectureTopicViewDto {
    return {
      topic: {
        id: r.topic.id,
        slug: r.topic.slug,
        name: r.topic.name,
      },
      attachedAt: r.createdAt.toISOString(),
    };
  }
}
