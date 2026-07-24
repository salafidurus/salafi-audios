import { PrismaService } from '../../core/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type {
  ListingDetailDto,
  RelatedListingDto,
  AdminListingUpdateDto,
  AdminListingListDto,
  AdminListingDetailDto,
  BulkActionResultDto,
  TranslationViewDto,
  Locale,
  CreateListingDto,
  SaveListingTranslationDto,
  ListingContentsDto,
  LastPlayedLessonDto,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

@Injectable()
export class ListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDetailById(id: string): Promise<ListingDetailDto | null> {
    const locale = getRequestLocale();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const listing = await this.prisma.listing.findFirst({
      where: {
        ...(isUuid ? { id } : { slug: id }),
        deletedAt: null,
        status: Status.published,
        scholar: { isActive: true },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        format: true,
        language: true,
        durationSeconds: true,
        publishedAt: true,
        parentId: true,
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
                translations: {
                  where: { locale },
                  select: { name: true },
                  take: 1,
                },
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

    if (!listing) return null;

    const seriesContext = await this.resolveSeriesContext(listing.parentId, listing.id, locale);
    const primaryAudio = listing.audioAssets[0] ?? null;

    const resolved = resolveContentTranslation({
      base: { title: listing.title, description: listing.description ?? null },
      originalLanguage: listing.language,
      targetLocale: locale,
      publishedTranslation: listing.translations[0] ?? null,
    });

    const scholarName = resolveContentTranslation({
      base: { name: listing.scholar.name },
      originalLanguage: listing.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: listing.scholar.translations[0] ?? null,
    }).fields.name;

    return {
      id: listing.id,
      slug: listing.slug,
      title: resolved.fields.title,
      description: resolved.fields.description ?? undefined,
      format: listing.format,
      language: listing.language ?? undefined,
      originalLanguage: resolved.originalLanguage,
      original: resolved.original
        ? {
            title: resolved.original.title,
            description: resolved.original.description ?? undefined,
          }
        : undefined,
      durationSeconds: listing.durationSeconds ?? undefined,
      publishedAt: listing.publishedAt?.toISOString(),
      scholar: {
        id: listing.scholar.id,
        slug: listing.scholar.slug,
        name: scholarName,
        imageUrl: listing.scholar.imageUrl ?? undefined,
      },
      topics: listing.topics.map((lt) => ({
        id: lt.topic.id,
        slug: lt.topic.slug,
        name: lt.topic.translations?.[0]?.name || lt.topic.name,
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
    parentId: string | null,
    listingId: string,
    locale: Locale,
  ): Promise<ListingDetailDto['seriesContext']> {
    if (!parentId) return null;

    const parentSeries = await this.prisma.listing.findFirst({
      where: {
        id: parentId,
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

    if (!parentSeries) return null;

    const siblings = await this.prisma.listing.findMany({
      where: {
        parentId,
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

    const currentIndex = siblings.findIndex((s) => s.id === listingId);
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
      seriesId: parentSeries.id,
      seriesTitle: titleOf(parentSeries),
      seriesSlug: parentSeries.slug,
      prevLecture: prev ? { id: prev.id, slug: prev.slug, title: titleOf(prev) } : null,
      nextLecture: next ? { id: next.id, slug: next.slug, title: titleOf(next) } : null,
    };
  }

  async findContentsById(id: string): Promise<ListingContentsDto | null> {
    const locale = getRequestLocale();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const listing = await this.prisma.listing.findFirst({
      where: {
        ...(isUuid ? { id } : { slug: id }),
        deletedAt: null,
        status: Status.published,
        scholar: { isActive: true },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        format: true,
        durationSeconds: true,
        language: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
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

    if (!listing) return null;

    const resolveTitle = (item: {
      title: string;
      language?: Locale | null;
      translations?: { title: string }[];
    }) =>
      resolveContentTranslation({
        base: { title: item.title },
        originalLanguage: item.language ?? undefined,
        targetLocale: locale,
        publishedTranslation: item.translations?.[0] ?? null,
      }).fields.title;

    const mapAsset = (asset: (typeof listing.audioAssets)[0] | undefined) =>
      asset
        ? {
            id: asset.id,
            url: asset.url,
            format: asset.format ?? undefined,
            bitrateKbps: asset.bitrateKbps ?? undefined,
            durationSeconds: asset.durationSeconds ?? undefined,
          }
        : null;

    if (listing.format === 'single') {
      return {
        format: 'single',
        items: [
          {
            id: listing.id,
            slug: listing.slug,
            title: resolveTitle(listing),
            durationSeconds: listing.durationSeconds ?? undefined,
            primaryAudioAsset: mapAsset(listing.audioAssets[0]),
          },
        ],
      };
    }

    if (listing.format === 'series') {
      const children = await this.prisma.listing.findMany({
        where: {
          parentId: listing.id,
          deletedAt: null,
          status: Status.published,
        },
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          durationSeconds: true,
          orderIndex: true,
          language: true,
          translations: {
            where: { locale, status: 'published' },
            select: { title: true },
            take: 1,
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

      return {
        format: 'series',
        items: children.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: resolveTitle(c),
          durationSeconds: c.durationSeconds ?? undefined,
          orderIndex: c.orderIndex ?? undefined,
          primaryAudioAsset: mapAsset(c.audioAssets[0]),
        })),
      };
    }

    if (listing.format === 'collection') {
      const modules = await this.prisma.listing.findMany({
        where: {
          parentId: listing.id,
          deletedAt: null,
          status: Status.published,
        },
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
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
          children: {
            where: { deletedAt: null, status: Status.published },
            orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
            select: {
              id: true,
              slug: true,
              title: true,
              durationSeconds: true,
              orderIndex: true,
              language: true,
              translations: {
                where: { locale, status: 'published' },
                select: { title: true },
                take: 1,
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
          },
        },
      });

      return {
        format: 'collection',
        modules: modules.map((m) => ({
          id: m.id,
          slug: m.slug,
          title: resolveTitle(m),
          lessons: m.children.map((c) => ({
            id: c.id,
            slug: c.slug,
            title: resolveTitle(c),
            durationSeconds: c.durationSeconds ?? undefined,
            orderIndex: c.orderIndex ?? undefined,
            primaryAudioAsset: mapAsset(c.audioAssets[0]),
          })),
        })),
      };
    }

    return null;
  }

  async findLastPlayedLesson(id: string, userId: string): Promise<LastPlayedLessonDto | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const targetListing = await this.prisma.listing.findFirst({
      where: {
        ...(isUuid ? { id } : { slug: id }),
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!targetListing) return null;

    const actualId = targetListing.id;

    const progress = await this.prisma.$queryRaw<
      {
        listingId: string;
        positionSeconds: number;
        isCompleted: boolean;
        updatedAt: Date;
      }[]
    >`
      SELECT ulp."listingId", ulp."positionSeconds", ulp."isCompleted", ulp."updatedAt"
      FROM "UserListingProgress" ulp
      JOIN "Listing" l ON ulp."listingId" = l.id
      LEFT JOIN "Listing" m ON l."parentId" = m.id
      WHERE (l."parentId" = ${actualId}::uuid OR m."parentId" = ${actualId}::uuid)
        AND ulp."userId" = ${userId}
        AND l."deletedAt" IS NULL
      ORDER BY ulp."updatedAt" DESC
      LIMIT 1
    `;

    const p = progress[0];
    if (!p) return null;

    return {
      listingId: p.listingId,
      positionSeconds: p.positionSeconds,
      isCompleted: p.isCompleted,
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async findRelated(listingId: string, limit = 6): Promise<RelatedListingDto[]> {
    const locale = getRequestLocale();
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
      select: {
        scholarId: true,
        parentId: true,
        topics: {
          select: { topicId: true },
        },
      },
    });

    if (!listing) return [];

    const topicIds = listing.topics.map((topic) => topic.topicId);

    const related = await this.prisma.listing.findMany({
      where: {
        AND: [
          { id: { not: listingId } },
          { deletedAt: null },
          { status: Status.published },
          { scholar: { isActive: true } },
          {
            OR: [
              { scholarId: listing.scholarId },
              { topics: { some: { topicId: { in: topicIds } } } },
              ...(listing.parentId ? [{ parentId: listing.parentId }] : []),
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
        parentId: true,
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

    const topicIdSet = new Set(topicIds);
    const rankedRelated = related
      .map((item) => {
        const sharedTopicCount = item.topics.reduce(
          (count, topic) => count + (topicIdSet.has(topic.topicId) ? 1 : 0),
          0,
        );
        const relevanceScore =
          (item.scholarId === listing.scholarId ? 100 : 0) +
          (listing.parentId && item.parentId === listing.parentId ? 40 : 0) +
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

  // ─── Counter Sync Hooks ───────────────────────────────────────────────────

  async syncListingCounters(listingId: string, tx: Prisma.TransactionClient): Promise<void> {
    const children = await tx.listing.findMany({
      where: {
        parentId: listingId,
        status: Status.published,
        deletedAt: null,
      },
      select: {
        format: true,
        durationSeconds: true,
        publishedLectureCount: true,
        publishedDurationSeconds: true,
      },
    });

    let totalCount = 0;
    let totalDuration = 0;

    for (const child of children) {
      if (child.format === 'single') {
        totalCount += 1;
        totalDuration += child.durationSeconds ?? 0;
      } else {
        totalCount += child.publishedLectureCount ?? 0;
        totalDuration += child.publishedDurationSeconds ?? 0;
      }
    }

    await tx.listing.update({
      where: { id: listingId },
      data: {
        publishedLectureCount: totalCount,
        publishedDurationSeconds: totalDuration,
      },
    });

    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { parentId: true },
    });

    if (listing?.parentId) {
      await this.syncListingCounters(listing.parentId, tx);
    }
  }

  // ─── Admin Listing Methods ────────────────────────────────────────────────

  async listAdmin(params: {
    cursor?: string;
    scholarId?: string;
    status?: string;
    search?: string;
  }): Promise<AdminListingListDto> {
    const pageSize = 50;
    const take = pageSize + 1;

    const where: Prisma.ListingWhereInput = {
      deletedAt: null,
      parentId: null,
      ...(params.scholarId ? { scholarId: params.scholarId } : {}),
      ...(params.status ? { status: params.status as Status } : {}),
      ...(params.search ? { title: { contains: params.search } } : {}),
    };

    const records = await this.prisma.listing.findMany({
      where,
      take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        format: true,
        durationSeconds: true,
        orderIndex: true,
        createdAt: true,
        scholar: { select: { name: true } },
      },
    });

    const hasMore = records.length > pageSize;
    const items = (hasMore ? records.slice(0, pageSize) : records).map((r) => ({
      id: r.id,
      title: r.title,
      scholarName: r.scholar.name,
      format: r.format,
      status: r.status,
      durationSeconds: r.durationSeconds ?? undefined,
      orderIndex: r.orderIndex ?? undefined,
      createdAt: r.createdAt.toISOString(),
    }));
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async findAdminDetail(id: string): Promise<AdminListingDetailDto | null> {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        format: true,
        language: true,
        status: true,
        orderIndex: true,
        durationSeconds: true,
        createdAt: true,
        updatedAt: true,
        scholarId: true,
        parentId: true,
        scholar: { select: { name: true } },
        topics: { select: { topic: { select: { id: true } } } },
        audioAssets: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });
    if (!listing) return null;

    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description ?? undefined,
      format: listing.format,
      language: listing.language ?? undefined,
      status: listing.status,
      orderIndex: listing.orderIndex ?? undefined,
      durationSeconds: listing.durationSeconds ?? undefined,
      scholarId: listing.scholarId,
      scholarName: listing.scholar.name,
      parentId: listing.parentId ?? undefined,
      topics: listing.topics.map((t) => t.topic.id),
      audioUrl: listing.audioAssets[0]?.url,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt?.toISOString(),
    };
  }

  async findSeriesOptionsByScholar(scholarId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { scholarId, format: 'series' as const, deletedAt: null },
      select: { id: true, slug: true, title: true },
      orderBy: { title: 'asc' },
    });
    return listings;
  }

  async getFormData(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        format: true,
        language: true,
        status: true,
        orderIndex: true,
        durationSeconds: true,
        createdAt: true,
        updatedAt: true,
        scholarId: true,
        parentId: true,
        scholar: { select: { name: true } },
        topics: { select: { topic: { select: { id: true } } } },
        audioAssets: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
        translations: {
          select: {
            locale: true,
            status: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!listing) return null;

    return {
      listing: {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        description: listing.description ?? undefined,
        format: listing.format,
        language: listing.language ?? undefined,
        status: listing.status,
        orderIndex: listing.orderIndex ?? undefined,
        durationSeconds: listing.durationSeconds ?? undefined,
        scholarId: listing.scholarId,
        scholarName: listing.scholar.name,
        parentId: listing.parentId ?? undefined,
        topics: listing.topics.map((t) => t.topic.id),
        audioUrl: listing.audioAssets[0]?.url,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt?.toISOString(),
      },
      translations: listing.translations.map((t) => ({
        locale: t.locale,
        status: t.status,
        fields: {
          title: t.title,
          description: t.description ?? null,
        },
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  }

  async createWithAudioAsset(
    dto: CreateListingDto & { publicUrl?: string },
    createdBy?: string,
  ): Promise<{ id: string; title: string }> {
    const slug = dto.slug ?? dto.title.toLowerCase().replace(/\s+/g, '-');

    return this.prisma.$transaction(async (tx) => {
      const listing = await tx.listing.create({
        data: {
          title: dto.title,
          slug,
          format: dto.format,
          status: Status.draft,
          language: dto.language ?? 'ar',
          durationSeconds: dto.durationSeconds ?? undefined,
          scholarId: dto.scholarId,
          parentId: dto.parentId ?? undefined,
          createdBy,
        },
        select: { id: true, title: true, parentId: true },
      });

      if (dto.topics?.length) {
        await tx.listingTopic.createMany({
          data: dto.topics.map((topicId: string) => ({
            listingId: listing.id,
            topicId,
          })),
        });
      }

      if (dto.format === 'single' && dto.publicUrl) {
        await tx.audioAsset.create({
          data: {
            listingId: listing.id,
            url: dto.publicUrl,
            format: dto.publicUrl.endsWith('.mp3') ? 'mp3' : undefined,
            sizeBytes: dto.sizeBytes ?? undefined,
            durationSeconds: dto.durationSeconds ?? undefined,
            isPrimary: true,
            source: 'r2',
          },
        });
      }

      if (listing.parentId) {
        await this.syncListingCounters(listing.parentId, tx);
      }

      // If translations were provided in the DTO, upsert them
      if (dto.translations) {
        await Promise.all(
          Object.entries(dto.translations).map(([locale, fields]) =>
            tx.listingTranslation.upsert({
              where: { listingId_locale: { listingId: listing.id, locale: locale as any } },
              update: { title: fields.title, description: fields.description ?? null },
              create: {
                listingId: listing.id,
                locale: locale as any,
                title: fields.title,
                description: fields.description ?? null,
              },
            }),
          ),
        );
      }

      return { id: listing.id, title: listing.title };
    });
  }

  async updateListing(
    id: string,
    dto: AdminListingUpdateDto,
    updatedBy?: string,
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const original = await tx.listing.findUnique({
          where: { id },
          select: { parentId: true, status: true, durationSeconds: true },
        });

        if (!original) throw new Error('Not found');

        // Exclude translations from the main update data
        const { translations, ...dtoWithoutTranslations } = dto;

        const updateData: Prisma.ListingUpdateInput = {
          ...dtoWithoutTranslations,
          updatedAt: new Date(),
          updatedBy,
        };

        if (dto.status === Status.published && original.status !== Status.published) {
          updateData.publishedAt = new Date();
        }

        await tx.listing.update({
          where: { id },
          data: updateData,
        });

        // If translations were provided in the DTO, upsert them
        if (translations) {
          await Promise.all(
            Object.entries(translations).map(([locale, fields]) =>
              tx.listingTranslation.upsert({
                where: { listingId_locale: { listingId: id, locale: locale as any } },
                update: { title: fields.title, description: fields.description ?? null },
                create: {
                  listingId: id,
                  locale: locale as any,
                  title: fields.title,
                  description: fields.description ?? null,
                },
              }),
            ),
          );
        }

        // Sync old parent if parent changed or status changed or duration changed
        if (original.parentId) {
          await this.syncListingCounters(original.parentId, tx);
        }

        // Sync new parent if parent ID is updated and different
        // In AdminListingUpdateDto, parentId is not usually updated directly, but we can verify if it's there
        const parentId = (dto as { parentId?: string }).parentId;
        if (parentId && parentId !== original.parentId) {
          await this.syncListingCounters(parentId, tx);
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateListingStatus(id: string, status: Status): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const original = await tx.listing.findUnique({
          where: { id },
          select: { parentId: true, status: true },
        });

        if (!original) throw new Error('Not found');

        const updateData: Prisma.ListingUpdateInput = {
          status,
          updatedAt: new Date(),
        };

        if (status === Status.published && original.status !== Status.published) {
          updateData.publishedAt = new Date();
        }

        await tx.listing.update({
          where: { id },
          data: updateData,
        });

        if (original.parentId) {
          await this.syncListingCounters(original.parentId, tx);
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteListing(id: string, deletedBy?: string): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const original = await tx.listing.findUnique({
          where: { id },
          select: { parentId: true },
        });

        await tx.listing.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            deletedBy,
          },
        });

        if (original?.parentId) {
          await this.syncListingCounters(original.parentId, tx);
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  async bulkUpdateStatus(ids: string[], status: Status): Promise<BulkActionResultDto> {
    const succeeded: string[] = [];
    const failed: string[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const ok = await this.updateListingStatus(id, status);
        (ok ? succeeded : failed).push(id);
      }),
    );

    return { succeeded, failed };
  }

  // ─── Translation Methods ──────────────────────────────────────────────────

  private mapListingTranslation(t: {
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

  async listListingTranslations(listingId: string): Promise<TranslationViewDto[]> {
    const records = await this.prisma.listingTranslation.findMany({
      where: { listingId },
      orderBy: { locale: 'asc' },
    });
    return records.map((r) => this.mapListingTranslation(r));
  }

  async upsertListingTranslation(
    listingId: string,
    dto: SaveListingTranslationDto,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.upsert({
      where: { listingId_locale: { listingId, locale: dto.locale } },
      create: {
        listingId,
        locale: dto.locale,
        title: dto.title,
        description: dto.description ?? null,
        status: 'draft',
      },
      update: { title: dto.title, description: dto.description ?? null },
    });
    return this.mapListingTranslation(record);
  }

  async updateListingTranslation(
    listingId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.update({
      where: { listingId_locale: { listingId, locale: locale as Locale } },
      data: { ...fields },
    });
    return this.mapListingTranslation(record);
  }

  async publishListingTranslation(listingId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.update({
      where: { listingId_locale: { listingId, locale: locale as Locale } },
      data: { status: 'published' },
    });
    return this.mapListingTranslation(record);
  }

  async unpublishListingTranslation(
    listingId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.update({
      where: { listingId_locale: { listingId, locale: locale as Locale } },
      data: { status: 'draft' },
    });
    return this.mapListingTranslation(record);
  }
}
