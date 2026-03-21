import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import {
  TopicDetailDto,
  TopicViewDto,
  TopicLectureViewDto,
} from '@sd/core-contracts';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { isLegacyTopicSchemaFailure } from './topics-error.utils';

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

type LegacyTopicRow = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  createdAt: Date | string;
};

@Injectable()
export class TopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<TopicDetailDto[]> {
    const records = await this.findManyTopics();

    return records.map((r) => this.toViewDto(r));
  }

  async listChildrenBySlug(slug: string): Promise<TopicViewDto[] | null> {
    const parent = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!parent) return null;

    const records = await this.findManyTopics({ parentId: parent.id });

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
    const [record] = await this.findManyTopics({ slug }, 1);

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

  private async findManyTopics(
    where?: { slug?: string; parentId?: string },
    take?: number,
  ): Promise<Array<TopicViewRecord | LegacyTopicRow>> {
    try {
      return await this.prisma.topic.findMany({
        where,
        orderBy: [{ name: 'asc' }],
        select: topicViewSelect,
        take,
      });
    } catch (error) {
      if (!isLegacyTopicSchemaFailure(error)) {
        throw error;
      }

      return this.findManyTopicsLegacy(where, take);
    }
  }

  private async findManyTopicsLegacy(
    where?: { slug?: string; parentId?: string },
    take?: number,
  ): Promise<LegacyTopicRow[]> {
    const columns = await this.getTopicColumnSet();
    const parentExpr = columns.has('parentId')
      ? '"parentId"'
      : 'NULL::text AS "parentId"';
    const createdAtExpr = columns.has('createdAt')
      ? '"createdAt"'
      : 'CURRENT_TIMESTAMP AS "createdAt"';
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (where?.slug) {
      params.push(where.slug);
      conditions.push(`"slug" = $${params.length}`);
    }

    if (where?.parentId) {
      if (!columns.has('parentId')) {
        return [];
      }
      params.push(where.parentId);
      conditions.push(`"parentId" = $${params.length}`);
    }

    let query = `SELECT "id", "slug", "name", ${parentExpr}, ${createdAtExpr} FROM "Topic"`;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY "name" ASC';

    if (typeof take === 'number') {
      params.push(take);
      query += ` LIMIT $${params.length}`;
    }

    return this.prisma.$queryRawUnsafe<LegacyTopicRow[]>(query, ...params);
  }

  private async getTopicColumnSet(): Promise<Set<string>> {
    const rows = await this.prisma.$queryRaw<
      Array<{ column_name: string }>
    >`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Topic'`;

    return new Set(rows.map((row) => row.column_name));
  }

  private toViewDto(record: TopicViewRecord | LegacyTopicRow): TopicDetailDto {
    const createdAt =
      record.createdAt instanceof Date
        ? record.createdAt.toISOString()
        : new Date(record.createdAt).toISOString();

    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      parentId: record.parentId ?? undefined,
      createdAt,
    };
  }
}
