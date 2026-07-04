import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type {
  LectureDetailDto,
  RelatedLectureDto,
  AdminLectureUpdateDto,
  AdminLectureListDto,
  AdminLectureDetailDto,
  BulkActionResultDto,
  TranslationViewDto,
  Locale,
} from '@sd/core-contracts';
import type { StatusValue } from '../../shared/enums/status-values';
import type { CreateLectureDto } from './dto/create-lecture.dto';
import type { SaveLectureTranslationDto } from './dto/save-lecture-translation.dto';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

@Injectable()
export class LecturesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDetailById(id: string): Promise<LectureDetailDto | null> {
    const locale = getRequestLocale();
    const lecture = await this.prisma.lecture.findFirst({
      where: {
        id,
        deletedAt: null,
        status: Status.published,
        scholar: { isActive: true },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        language: true,
        durationSeconds: true,
        publishedAt: true,
        seriesId: true,
        orderIndex: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true, description: true },
          take: 1,
        },
        scholar: {
          select: {
            id: true,
            slug: true,
            name: true,
            mainLanguage: true,
            imageUrl: true,
            translations: {
              where: { locale, status: 'published' },
              select: { name: true },
              take: 1,
            },
          },
        },
        topics: {
          select: {
            topic: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
        audioAssets: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            url: true,
            format: true,
            bitrateKbps: true,
            durationSeconds: true,
          },
        },
      },
    });

    if (!lecture) return null;

    const seriesContext = await this.resolveSeriesContext(lecture.seriesId, lecture.id, locale);

    const primaryAudio = lecture.audioAssets[0] ?? null;

    const resolved = resolveContentTranslation({
      base: { title: lecture.title, description: lecture.description ?? null },
      originalLanguage: lecture.language,
      targetLocale: locale,
      publishedTranslation: lecture.translations[0] ?? null,
    });

    const scholarName = resolveContentTranslation({
      base: { name: lecture.scholar.name },
      originalLanguage: lecture.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: lecture.scholar.translations[0] ?? null,
    }).fields.name;

    return {
      id: lecture.id,
      slug: lecture.slug,
      title: resolved.fields.title,
      description: resolved.fields.description ?? undefined,
      language: lecture.language ?? undefined,
      originalLanguage: resolved.originalLanguage,
      original: resolved.original
        ? {
            title: resolved.original.title,
            description: resolved.original.description ?? undefined,
          }
        : undefined,
      durationSeconds: lecture.durationSeconds ?? undefined,
      publishedAt: lecture.publishedAt?.toISOString(),
      scholar: {
        id: lecture.scholar.id,
        slug: lecture.scholar.slug,
        name: scholarName,
        imageUrl: lecture.scholar.imageUrl ?? undefined,
      },
      topics: lecture.topics.map((lt) => ({
        id: lt.topic.id,
        slug: lt.topic.slug,
        name: lt.topic.name,
      })),
      primaryAudioAsset: primaryAudio
        ? {
            id: primaryAudio.id,
            url: primaryAudio.url,
            format: primaryAudio.format ?? undefined,
            bitrateKbps: primaryAudio.bitrateKbps ?? undefined,
            durationSeconds: primaryAudio.durationSeconds ?? undefined,
          }
        : null,
      seriesContext,
    };
  }

  private async resolveSeriesContext(
    seriesId: string | null,
    lectureId: string,
    locale: Locale,
  ): Promise<LectureDetailDto['seriesContext']> {
    if (!seriesId) return null;

    const series = await this.prisma.series.findFirst({
      where: {
        id: seriesId,
        deletedAt: null,
        status: Status.published,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
      },
    });

    if (!series) return null;

    const siblings = await this.prisma.lecture.findMany({
      where: {
        seriesId,
        deletedAt: null,
        status: Status.published,
        scholar: { isActive: true },
      },
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        orderIndex: true,
        language: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
      },
    });

    const currentIndex = siblings.findIndex((s) => s.id === lectureId);
    const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const next =
      currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    const titleOf = (item: {
      title: string;
      language: Locale | null;
      translations: { title: string }[];
    }): string =>
      resolveContentTranslation({
        base: { title: item.title },
        originalLanguage: item.language,
        targetLocale: locale,
        publishedTranslation: item.translations[0] ?? null,
      }).fields.title;

    return {
      seriesId: series.id,
      seriesTitle: titleOf(series),
      seriesSlug: series.slug,
      prevLecture: prev ? { id: prev.id, slug: prev.slug, title: titleOf(prev) } : null,
      nextLecture: next ? { id: next.id, slug: next.slug, title: titleOf(next) } : null,
    };
  }

  async findRelated(lectureId: string, limit: number = 6): Promise<RelatedLectureDto[]> {
    const locale = getRequestLocale();
    const lecture = await this.prisma.lecture.findFirst({
      where: { id: lectureId, deletedAt: null },
      select: {
        scholarId: true,
        seriesId: true,
        topics: {
          select: { topicId: true },
        },
      },
    });

    if (!lecture) return [];

    const topicIds = lecture.topics.map((topic) => topic.topicId);

    const related = await this.prisma.lecture.findMany({
      where: {
        AND: [
          { id: { not: lectureId } },
          { deletedAt: null },
          { status: Status.published },
          { scholar: { isActive: true } },
          {
            OR: [
              { scholarId: lecture.scholarId },
              { topics: { some: { topicId: { in: topicIds } } } },
              ...(lecture.seriesId ? [{ seriesId: lecture.seriesId }] : []),
            ],
          },
        ],
      },
      take: Math.max(limit * 3, limit),
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
        durationSeconds: true,
        scholarId: true,
        seriesId: true,
        publishedAt: true,
        createdAt: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
        topics: {
          select: {
            topicId: true,
          },
        },
        scholar: {
          select: {
            id: true,
            slug: true,
            name: true,
            mainLanguage: true,
            imageUrl: true,
            translations: {
              where: { locale, status: 'published' },
              select: { name: true },
              take: 1,
            },
          },
        },
        audioAssets: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            url: true,
            format: true,
            bitrateKbps: true,
            durationSeconds: true,
          },
        },
      },
    });

    const rankedRelated = related
      .map((item) => {
        const sharedTopicCount = item.topics.reduce(
          (count, topic) => count + (topicIds.includes(topic.topicId) ? 1 : 0),
          0,
        );
        const relevanceScore =
          (item.scholarId === lecture.scholarId ? 100 : 0) +
          (lecture.seriesId && item.seriesId === lecture.seriesId ? 40 : 0) +
          sharedTopicCount * 10;

        return {
          item,
          relevanceScore,
          sortDate: item.publishedAt ?? item.createdAt,
        };
      })
      .sort((left, right) => {
        if (right.relevanceScore !== left.relevanceScore) {
          return right.relevanceScore - left.relevanceScore;
        }

        return right.sortDate.getTime() - left.sortDate.getTime();
      })
      .slice(0, limit)
      .map(({ item }) => item);

    return rankedRelated.map((r) => {
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      const scholarName = resolveContentTranslation({
        base: { name: r.scholar.name },
        originalLanguage: r.scholar.mainLanguage,
        targetLocale: locale,
        publishedTranslation: r.scholar.translations[0] ?? null,
      }).fields.name;

      return {
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
        durationSeconds: r.durationSeconds ?? undefined,
        scholar: {
          id: r.scholar.id,
          slug: r.scholar.slug,
          name: scholarName,
          imageUrl: r.scholar.imageUrl ?? undefined,
        },
        primaryAudioAsset: r.audioAssets[0]
          ? {
              id: r.audioAssets[0].id,
              url: r.audioAssets[0].url,
              format: r.audioAssets[0].format ?? undefined,
              bitrateKbps: r.audioAssets[0].bitrateKbps ?? undefined,
              durationSeconds: r.audioAssets[0].durationSeconds ?? undefined,
            }
          : null,
      };
    });
  }

  async updateLecture(id: string, updateDto: AdminLectureUpdateDto): Promise<boolean> {
    try {
      await this.prisma.lecture.update({
        where: { id },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateLectureStatus(id: string, status: Status): Promise<boolean> {
    try {
      const updateData: Prisma.LectureUpdateInput = {
        status,
        updatedAt: new Date(),
      };

      // Set publishedAt when publishing
      if (status === Status.published) {
        updateData.publishedAt = new Date();
      }

      await this.prisma.lecture.update({
        where: { id },
        data: updateData,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Lecture translations ─────────────────────────────────────────────────

  private mapLectureTranslation(t: {
    locale: string;
    status: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale as Locale,
      status: t.status === 'published' ? 'published' : 'draft',
      fields: { title: t.title, description: t.description },
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async listLectureTranslations(lectureId: string): Promise<TranslationViewDto[]> {
    const records = await this.prisma.lectureTranslation.findMany({
      where: { lectureId },
      orderBy: { locale: 'asc' },
    });
    return records.map((r) => this.mapLectureTranslation(r));
  }

  async upsertLectureTranslation(
    lectureId: string,
    dto: SaveLectureTranslationDto,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.lectureTranslation.upsert({
      where: { lectureId_locale: { lectureId, locale: dto.locale } },
      create: {
        lectureId,
        locale: dto.locale,
        title: dto.title,
        description: dto.description ?? null,
        status: 'draft',
      },
      update: { title: dto.title, description: dto.description ?? null },
    });
    return this.mapLectureTranslation(record);
  }

  async updateLectureTranslation(
    lectureId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.lectureTranslation.update({
      where: { lectureId_locale: { lectureId, locale: locale as Locale } },
      data: { ...fields },
    });
    return this.mapLectureTranslation(record);
  }

  async publishLectureTranslation(lectureId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.lectureTranslation.update({
      where: { lectureId_locale: { lectureId, locale: locale as Locale } },
      data: { status: 'published' },
    });
    return this.mapLectureTranslation(record);
  }

  async unpublishLectureTranslation(
    lectureId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.lectureTranslation.update({
      where: { lectureId_locale: { lectureId, locale: locale as Locale } },
      data: { status: 'draft' },
    });
    return this.mapLectureTranslation(record);
  }

  // ─── Admin methods ────────────────────────────────────────────────────────

  async listAdmin(params: {
    page: number;
    scholarId?: string;
    status?: string;
    search?: string;
  }): Promise<AdminLectureListDto> {
    const pageSize = 50;
    const skip = (params.page - 1) * pageSize;

    const where: Prisma.LectureWhereInput = {
      deletedAt: null,
      ...(params.scholarId ? { scholarId: params.scholarId } : {}),
      ...(params.status ? { status: params.status as Status } : {}),
      ...(params.search ? { title: { contains: params.search } } : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.lecture.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          durationSeconds: true,
          orderIndex: true,
          createdAt: true,
          scholar: { select: { name: true } },
        },
      }),
      this.prisma.lecture.count({ where }),
    ]);

    return {
      items: records.map((r) => ({
        id: r.id,
        title: r.title,
        scholarName: r.scholar.name,
        status: r.status as StatusValue,
        durationSeconds: r.durationSeconds ?? undefined,
        orderIndex: r.orderIndex ?? undefined,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page: params.page,
    };
  }

  async findAdminDetail(id: string): Promise<AdminLectureDetailDto | null> {
    const lecture = await this.prisma.lecture.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        language: true,
        status: true,
        orderIndex: true,
        durationSeconds: true,
        createdAt: true,
        updatedAt: true,
        scholarId: true,
        seriesId: true,
        scholar: { select: { name: true } },
        topics: { select: { topic: { select: { id: true } } } },
        audioAssets: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });
    if (!lecture) return null;

    return {
      id: lecture.id,
      slug: lecture.slug,
      title: lecture.title,
      description: lecture.description ?? undefined,
      language: lecture.language ?? undefined,
      status: lecture.status as StatusValue,
      orderIndex: lecture.orderIndex ?? undefined,
      durationSeconds: lecture.durationSeconds ?? undefined,
      scholarId: lecture.scholarId,
      scholarName: lecture.scholar.name,
      seriesId: lecture.seriesId ?? undefined,
      topics: lecture.topics.map((t) => t.topic.id),
      audioUrl: lecture.audioAssets[0]?.url,
      createdAt: lecture.createdAt.toISOString(),
      updatedAt: lecture.updatedAt?.toISOString(),
    };
  }

  async createWithAudioAsset(
    dto: CreateLectureDto & { publicUrl: string },
  ): Promise<{ id: string; title: string }> {
    const slug = dto.slug ?? dto.title.toLowerCase().replace(/\s+/g, '-');

    return this.prisma.$transaction(async (tx) => {
      const lectureData: Prisma.LectureUncheckedCreateInput = {
        title: dto.title,
        slug,
        status: Status.draft,
        durationSeconds: dto.durationSeconds ?? undefined,
        scholarId: dto.scholarId,
        seriesId: dto.seriesId ?? undefined,
      };

      const lecture = await tx.lecture.create({
        data: lectureData,
        select: { id: true, title: true },
      });

      if (dto.topics?.length) {
        await tx.lectureTopic.createMany({
          data: dto.topics.map((topicId: string) => ({
            lectureId: lecture.id,
            topicId,
          })),
        });
      }

      await tx.audioAsset.create({
        data: {
          lectureId: lecture.id,
          url: dto.publicUrl,
          format: dto.format ?? undefined,
          sizeBytes: dto.sizeBytes ?? undefined,
          durationSeconds: dto.durationSeconds ?? undefined,
          isPrimary: true,
          source: 'r2',
        },
      });

      return lecture;
    });
  }

  async bulkUpdateStatus(ids: string[], status: Status): Promise<BulkActionResultDto> {
    const succeeded: string[] = [];
    const failed: string[] = [];

    await Promise.all(
      ids.map(async (id) => {
        try {
          const updated = await this.prisma.lecture.updateMany({
            where: { id, deletedAt: null },
            data: {
              status,
              ...(status === Status.published ? { publishedAt: new Date() } : {}),
            },
          });
          if (updated.count > 0) {
            succeeded.push(id);
          } else {
            failed.push(id);
          }
        } catch {
          failed.push(id);
        }
      }),
    );

    return { succeeded, failed };
  }
}
