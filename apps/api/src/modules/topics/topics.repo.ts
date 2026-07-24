import { PrismaService } from '../../core/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type {
  TopicDetailDto,
  TopicLectureViewDto,
  TranslationViewDto,
  Locale,
} from '@sd/core-contracts';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

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

@Injectable()
export class TopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

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
   * Upsert Topic by slug.
   */
  async upsertBySlug(input: {
    slug: string;
    name: string;
    orderIndex?: number;
  }): Promise<TopicDetailDto> {
    const record = await this.prisma.topic.upsert({
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
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale as Locale,
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
    locale: string,
    fields: Partial<{ name: string }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.topicTranslation.update({
      where: { topicId_locale: { topicId, locale: locale as Locale } },
      data: { ...fields },
    });
    return this.mapTopicTranslation(record);
  }

  async deleteTopicTranslation(topicId: string, locale: string): Promise<void> {
    try {
      await this.prisma.topicTranslation.delete({
        where: { topicId_locale: { topicId, locale: locale as Locale } },
      });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return;
      }
      throw e;
    }
  }

  private async findManyTopics(
    where?: { slug?: string },
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

    const arTranslation = record.translations.find((t) => t.locale === 'ar')?.name;

    return {
      id: record.id,
      slug: record.slug,
      name: {
        en: record.name,
        ar: arTranslation,
      },
      orderIndex: record.orderIndex,
      createdAt,
    };
  }
}
