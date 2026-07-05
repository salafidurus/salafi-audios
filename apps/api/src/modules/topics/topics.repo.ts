import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import {
  TopicDetailDto,
  TopicViewDto,
  TopicLectureViewDto,
  TranslationViewDto,
  type Locale,
} from '@sd/core-contracts';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';
import { isLegacyTopicSchemaFailure } from './topics-error.utils';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

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

    const locale = getRequestLocale();
    const records = await this.prisma.listing.findMany({
      where: {
        format: 'single' as const,
        deletedAt: null,
        status: Status.published,
        scholar: {
          isActive: true,
        },
        OR: [
          { parentId: null },
          {
            parent: {
              deletedAt: null,
              status: Status.published,
              OR: [
                { parentId: null },
                {
                  parent: {
                    deletedAt: null,
                    status: Status.published,
                  },
                },
              ],
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
        parentId: true,
        slug: true,
        title: true,
        description: true,
        language: true,
        status: true,
        publishedAt: true,
        durationSeconds: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true, description: true },
          take: 1,
        },
      },
    });

    return records.map((r) => {
      const resolved = resolveContentTranslation({
        base: { title: r.title, description: r.description ?? null },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      return {
        id: r.id,
        scholarId: r.scholarId,
        seriesId: r.parentId ?? undefined,
        slug: r.slug,
        title: resolved.fields.title,
        description: resolved.fields.description ?? undefined,
        language: r.language ?? undefined,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original
          ? {
              title: resolved.original.title,
              description: resolved.original.description ?? undefined,
            }
          : undefined,
        status: r.status,
        publishedAt: r.publishedAt?.toISOString(),
        durationSeconds: r.durationSeconds ?? undefined,
      };
    });
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

  async deleteBySlug(slug: string): Promise<void> {
    await this.prisma.topic.delete({
      where: { slug },
    });
  }

  // ─── Topic translations ───────────────────────────────────────────────────

  private mapTopicTranslation(t: {
    locale: string;
    status: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale as Locale,
      status: t.status === 'published' ? 'published' : 'draft',
      fields: { name: t.name },
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async listTopicTranslations(topicId: string): Promise<TranslationViewDto[]> {
    const records = await this.prisma.topicTranslation.findMany({
      where: { topicId },
      orderBy: { locale: 'asc' },
    });
    return records.map((r) => this.mapTopicTranslation(r));
  }

  async upsertTopicTranslation(
    topicId: string,
    dto: SaveTopicTranslationDto,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.topicTranslation.upsert({
      where: { topicId_locale: { topicId, locale: dto.locale } },
      create: { topicId, locale: dto.locale, name: dto.name, status: 'draft' },
      update: { name: dto.name },
    });
    return this.mapTopicTranslation(record);
  }

  async updateTopicTranslation(
    topicId: string,
    locale: string,
    fields: Partial<{ name: string }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.topicTranslation.update({
      where: { topicId_locale: { topicId, locale: locale as Locale } },
      data: { ...fields },
    });
    return this.mapTopicTranslation(record);
  }

  async publishTopicTranslation(topicId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.topicTranslation.update({
      where: { topicId_locale: { topicId, locale: locale as Locale } },
      data: { status: 'published' },
    });
    return this.mapTopicTranslation(record);
  }

  async unpublishTopicTranslation(topicId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.topicTranslation.update({
      where: { topicId_locale: { topicId, locale: locale as Locale } },
      data: { status: 'draft' },
    });
    return this.mapTopicTranslation(record);
  }

  private async resolveOptionalParentId(parentSlug?: string): Promise<string | null> {
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
    const parentExpr = columns.has('parentId') ? '"parentId"' : 'NULL::text AS "parentId"';
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
