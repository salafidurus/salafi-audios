import { PrismaService } from '@/shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/db/client';
import { TopicDetailDto } from './dto/topic-detail.dto';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { TopicLectureViewDto } from './dto/topic-lecture-view.dto';
import { TopicViewDto } from '../lecture-topics/dto/topic-view.dto';

const topicViewSelect = {
  id: true,
  slug: true,
  name: true,
  parentId: true,
  createdAt: true,
} satisfies Prisma.TopicSelect;

type TopicViewRecord = Prisma.TopicGetPayload<{
  select: typeof topicViewSelect;
}>;

@Injectable()
export class TopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<TopicDetailDto[]> {
    const records = await this.prisma.topic.findMany({
      orderBy: [{ name: 'asc' }],
      select: topicViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  async listChildrenBySlug(slug: string): Promise<TopicViewDto[] | null> {
    const parent = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!parent) return null;

    const records = await this.prisma.topic.findMany({
      where: { parentId: parent.id },
      orderBy: [{ name: 'asc' }],
      select: topicViewSelect,
    });

    return records.map((t) => this.toViewDto(t));
  }

  async listPublishedLecturesByTopicSlug(
    slug: string,
    limit?: number,
  ): Promise<TopicLectureViewDto[] | null> {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!topic) return null;

    const records = await this.prisma.lecture.findMany({
      where: {
        deletedAt: null,
        status: Status.published,
        scholar: {
          isActive: true,
        },
        OR: [
          { seriesId: null },
          {
            series: {
              is: {
                deletedAt: null,
                status: Status.published,
                OR: [
                  { collectionId: null },
                  {
                    collection: {
                      is: {
                        deletedAt: null,
                        status: Status.published,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        topics: { some: { topicId: topic.id } },
      },
      orderBy: [{ publishedAt: 'desc' }, { title: 'asc' }],
      take:
        typeof limit === 'number' && Number.isFinite(limit)
          ? Math.max(1, Math.min(100, limit))
          : 50,
      select: {
        id: true,
        scholarId: true,
        seriesId: true,
        slug: true,
        title: true,
        description: true,
        language: true,
        status: true,
        publishedAt: true,
        durationSeconds: true,
      } satisfies Prisma.LectureSelect,
    });

    return records.map((r) => ({
      id: r.id,
      scholarId: r.scholarId,
      seriesId: r.seriesId ?? undefined,
      slug: r.slug,
      title: r.title,
      description: r.description ?? undefined,
      language: r.language ?? undefined,
      status: r.status,
      publishedAt: r.publishedAt?.toISOString(),
      durationSeconds: r.durationSeconds ?? undefined,
    }));
  }

  async findBySlug(slug: string): Promise<TopicDetailDto | null> {
    const record = await this.prisma.topic.findUnique({
      where: { slug },
      select: topicViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  /**
   * Upsert Topic by slug, optionally setting parent by parentSlug.
   *
   * Returns null if parentSlug is provided but parent does not exist.
   */
  async upsertBySlug(input: UpsertTopicDto): Promise<TopicDetailDto | null> {
    const parentId = await this.resolveOptionalParentId(input.parentSlug);
    if (input.parentSlug && !parentId) return null;

    const record = await this.prisma.topic.upsert({
      where: { slug: input.slug },
      select: topicViewSelect,
      create: {
        slug: input.slug,
        name: input.name,
        parentId,
      },
      update: {
        name: input.name,
        parentId,
      },
    });

    return this.toViewDto(record);
  }

  private async resolveOptionalParentId(
    parentSlug?: string,
  ): Promise<string | null> {
    if (!parentSlug) return null;

    const parent = await this.prisma.topic.findUnique({
      where: { slug: parentSlug },
      select: { id: true },
    });

    return parent?.id ?? null;
  }

  private toViewDto(record: TopicViewRecord): TopicDetailDto {
    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      parentId: record.parentId ?? undefined,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
