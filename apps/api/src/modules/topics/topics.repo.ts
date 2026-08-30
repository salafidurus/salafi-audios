import { PrismaService } from '../../core/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type {
  TopicDetailDto,
  TopicLectureViewDto,
  TranslationViewDto,
  Locale,
  SaveTopicTranslationDto,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { syncMainLanguageTranslation } from '../../shared/i18n/sync-main-language-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

/** topics application module responsible for topics.repo behavior at the backend boundary. */
const topicViewSelect = {
  id: true,
  slug: true,
  name: true,
  orderIndex: true,
  createdAt: true,
  translations: {
    select: {
      locale: true,
      name: true,
    },
  },
} satisfies Prisma.TopicSelect;

type TopicViewRecord = Prisma.TopicGetPayload<{
  select: typeof topicViewSelect;
}>;

function optionalValue<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

function mapOriginalLecture(
  original:
    | {
        title: string;
        description: string | null;
      }
    | null
    | undefined,
) {
  if (!original) return undefined;
  return {
    title: original.title,
    description: optionalValue(original.description),
  };
}

@Injectable()
/** NestJS topics repository service or controller coordinating the API boundary for this responsibility. */
export class TopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeLectureLimit(limit?: number): number {
    return limit != null && Number.isFinite(limit) ? Math.max(1, Math.min(100, limit)) : 50;
  }

  async list(): Promise<TopicDetailDto[]> {
    const records = await this.findManyTopics();

    return records.map((r) => this.toViewDto(r));
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
      take: this.normalizeLectureLimit(limit),
      select: {
        id: true,
        scholarId: true,
        scholar: { select: { slug: true } },
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
        scholarSlug: r.scholar.slug,
        seriesId: optionalValue(r.parentId),
        slug: r.slug,
        title: resolved.fields.title,
        description: optionalValue(resolved.fields.description),
        language: optionalValue(r.language),
        originalLanguage: resolved.originalLanguage,
        original: mapOriginalLecture(resolved.original),
        status: r.status,
        publishedAt: r.publishedAt?.toISOString(),
        durationSeconds: optionalValue(r.durationSeconds),
      };
    });
  }

  async findBySlug(slug: string): Promise<TopicDetailDto | null> {
    const [record] = await this.findManyTopics({ slug }, 1);

    return record ? this.toViewDto(record) : null;
  }

  /**
   * Upsert Topic by slug.
   */
  async upsertBySlug(input: {
    /** Documents the slug field's API projection semantics and lifecycle meaning. */ slug: string;
    name: string;
    orderIndex?: number;
  }): Promise<TopicDetailDto> {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.topic.upsert({
        where: { slug: input.slug },
        select: topicViewSelect,
        create: {
          slug: input.slug,
          name: input.name,
          orderIndex: input.orderIndex ?? 99,
        },
        update: {
          name: input.name,
          orderIndex: input.orderIndex,
        },
      });

      // Arabic is always the main language for topics — mirror the main
      // content into a matching TopicTranslation so it's always in sync.
      await syncMainLanguageTranslation({
        upsert: (locale, fields) =>
          tx.topicTranslation.upsert({
            where: { topicId_locale: { topicId: record.id, locale } },
            create: { topicId: record.id, locale, name: fields.name },
            update: { name: fields.name },
          }),
        newLocale: 'ar',
        newFields: { name: input.name },
      });

      return this.toViewDto(record);
    });
  }

  async deleteBySlug(slug: string): Promise<void> {
    await this.prisma.topic.delete({
      where: { slug },
    });
  }

  // ─── Topic translations ───────────────────────────────────────────────────

  private mapTopicTranslation(t: {
    locale: Locale;
    name: string;
    /** Documents the createdAt field's API projection semantics and lifecycle meaning. */ createdAt: Date;
    /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */ updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale,
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
      create: { topicId, locale: dto.locale, name: dto.name },
      update: { name: dto.name },
    });
    return this.mapTopicTranslation(record);
  }

  async updateTopicTranslation(
    topicId: string,
    locale: Locale,
    fields: Partial<{ name: string }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.topicTranslation.update({
      where: { topicId_locale: { topicId, locale } },
      data: { ...fields },
    });
    return this.mapTopicTranslation(record);
  }

  private async findManyTopics(
    where?: {
      /** Optional slug identity used to constrain the topic lookup. */
      slug?: string;
    },
    take?: number,
  ): Promise<TopicViewRecord[]> {
    return this.prisma.topic.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }],
      select: topicViewSelect,
      take,
    });
  }

  private toViewDto(record: TopicViewRecord): TopicDetailDto {
    const createdAt = record.createdAt.toISOString();

    // Arabic is the main language for topics — record.name already holds
    // the Arabic content; English (if present) comes from the translation.
    const enTranslation = record.translations.find((t) => t.locale === 'en')?.name;

    return {
      id: record.id,
      slug: record.slug,
      name: {
        ar: record.name,
        en: enTranslation,
      },
      orderIndex: record.orderIndex,
      createdAt,
    };
  }
}
