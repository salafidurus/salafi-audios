import { PrismaService } from '../../core/db/prisma.service';
import { ConfigService } from '../../core/config/config.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type {
  ListingDetailDto,
  RelatedListingDto,
  AdminListingListDto,
  AdminListingDetailDto,
  AdminListingMediaDetailDto,
  UpdateListingDetailsDto,
  UpdateListingMediaDto,
  BulkActionResultDto,
  TranslationViewDto,
  Locale,
  CreateListingDto,
  SaveListingTranslationDto,
  ListingContentsDto,
  LastPlayedLessonDto,
  ListingProgressSummaryDto,
  AdminArrangeDataDto,
  AdminArrangeLessonDto,
  ArrangeAudioRef,
  ArrangeCommitDto,
  ArrangeCommitResultDto,
  ArrangeLessonOp,
  HomePromotionsDto,
  ListingFormat,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { syncMainLanguageTranslation } from '../../shared/i18n/sync-main-language-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { publishedListingSlugWhere } from '../../shared/utils/published-listing-slug-where';
import {
  assertListingTransition,
  type ListingEditorialTransition,
} from './listing-editorial.transitions';
import { toOptional } from '../../shared/utils/to-optional';

type AdminListingFilterParams = {
  cursor?: string;
  scholarId?: string;
  status?: string;
  search?: string;
  accessibleScholarIds?: string[];
};

type CounterChild = {
  format: string;
  durationSeconds: number | null;
  publishedLectureCount: number | null;
  publishedDurationSeconds: number | null;
};

function buildAdminListingWhere(params: AdminListingFilterParams): Prisma.ListingWhereInput {
  const scholarId = params.accessibleScholarIds
    ? params.scholarId && !params.accessibleScholarIds.includes(params.scholarId)
      ? { in: [] }
      : (params.scholarId ?? { in: params.accessibleScholarIds })
    : params.scholarId;
  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    parentId: null,
    scholarId,
    // SAFETY: status is validated by the admin route DTO before reaching this repository filter.
    status: params.status as Status | undefined,
  };
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { translations: { some: { title: { contains: params.search, mode: 'insensitive' } } } },
      { scholar: { name: { contains: params.search, mode: 'insensitive' } } },
      {
        scholar: {
          translations: { some: { name: { contains: params.search, mode: 'insensitive' } } },
        },
      },
    ];
  }
  return where;
}

function sumListingCounters(children: CounterChild[]): {
  totalCount: number;
  totalDuration: number;
} {
  return children.reduce(
    (totals, child) =>
      child.format === 'single'
        ? {
            totalCount: totals.totalCount + 1,
            totalDuration: totals.totalDuration + (child.durationSeconds ?? 0),
          }
        : {
            totalCount: totals.totalCount + (child.publishedLectureCount ?? 0),
            totalDuration: totals.totalDuration + (child.publishedDurationSeconds ?? 0),
          },
    { totalCount: 0, totalDuration: 0 },
  );
}

function hasTranslatableListingChange(dto: UpdateListingDetailsDto): boolean {
  return [dto.title, dto.description, dto.language].some((value) => value !== undefined);
}

function setPublishedAtWhenPublishing(
  updateData: Prisma.ListingUpdateInput,
  nextStatus: Status | undefined,
  currentStatus: Status,
): void {
  if (nextStatus === Status.published && currentStatus !== Status.published) {
    updateData.publishedAt = new Date();
  }
}

async function createListingTopics(
  tx: Prisma.TransactionClient,
  listingId: string,
  topics: string[] | undefined,
): Promise<void> {
  if (!topics?.length) return;
  await tx.listingTopic.createMany({ data: topics.map((topicId) => ({ listingId, topicId })) });
}

async function createListingAudioAsset(
  tx: Prisma.TransactionClient,
  listingId: string,
  dto: CreateListingDto & { publicUrl?: string },
): Promise<void> {
  if (dto.format !== 'single' || !dto.publicUrl) return;
  await tx.audioAsset.create({
    data: {
      listingId,
      url: dto.publicUrl,
      objectKey: dto.audioKey ?? undefined,
      format: dto.publicUrl.endsWith('.mp3') ? 'mp3' : undefined,
      sizeBytes: dto.sizeBytes ?? undefined,
      durationSeconds: dto.durationSeconds ?? undefined,
      isPrimary: true,
      source: 'r2',
    },
  });
}

async function replaceListingTopics(
  tx: Prisma.TransactionClient,
  listingId: string,
  topics: string[] | undefined,
): Promise<void> {
  if (topics === undefined) return;
  await tx.listingTopic.deleteMany({ where: { listingId } });
  await createListingTopics(tx, listingId, topics);
}

function buildListingMediaUpdateData(
  dto: UpdateListingMediaDto,
  updatedBy?: string,
): Prisma.ListingUpdateInput {
  const updateData: Prisma.ListingUpdateInput = {
    updatedAt: new Date(),
    updatedBy,
  };
  if (dto.durationSeconds !== undefined) updateData.durationSeconds = dto.durationSeconds;
  if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
  return updateData;
}

function mapListingTopic(topic: {
  id: string;
  slug: string;
  name: string;
  translations: Array<{ name: string }>;
}) {
  return {
    id: topic.id,
    slug: topic.slug,
    name: topic.translations[0]?.name || topic.name,
  };
}

function mapPrimaryAudioAsset(
  asset: {
    id: string;
    url: string;
    format: string | null;
    bitrateKbps: number | null;
    durationSeconds: number | null;
  } | null,
) {
  if (!asset) return null;
  return {
    id: asset.id,
    url: asset.url,
    format: toOptional(asset.format),
    bitrateKbps: toOptional(asset.bitrateKbps),
    durationSeconds: toOptional(asset.durationSeconds),
  };
}

function mapOriginalListingTranslation(
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
    description: toOptional(original.description),
  };
}

function mapOriginalListingTitle(original: { title: string } | null | undefined) {
  return original ? { title: original.title } : undefined;
}

function getAdminListingOptionalFields(listing: {
  description: string | null;
  language: Locale | null;
  orderIndex: number | null;
  durationSeconds: number | null;
  parentId: string | null;
  coverImageUrl: string | null;
  updatedAt: Date | null;
}) {
  return {
    description: toOptional(listing.description),
    language: toOptional(listing.language),
    orderIndex: toOptional(listing.orderIndex),
    durationSeconds: toOptional(listing.durationSeconds),
    parentId: toOptional(listing.parentId),
    coverImageUrl: toOptional(listing.coverImageUrl),
    updatedAt: listing.updatedAt?.toISOString(),
  };
}

function nullableValue<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

function buildCreateListingData(
  dto: CreateListingDto & { publicUrl?: string },
  slug: string,
  createdBy?: string,
): Prisma.ListingUncheckedCreateInput {
  return {
    title: dto.title,
    slug,
    format: dto.format,
    status: dto.status ?? Status.draft,
    language: dto.language ?? 'ar',
    durationSeconds: dto.durationSeconds ?? undefined,
    scholarId: dto.scholarId,
    parentId: dto.parentId ?? undefined,
    coverImageUrl: dto.coverImageUrl ?? undefined,
    coverImageKey: dto.coverImageKey ?? undefined,
    createdBy,
  };
}

function buildArrangeLessonUpdateData(
  op: Extract<ArrangeLessonOp, { op: 'update' }>,
  existingStatus: Status | null | undefined,
  userId?: string,
): Prisma.ListingUpdateInput {
  const data: Prisma.ListingUpdateInput = { updatedAt: new Date(), updatedBy: userId };
  if (op.title !== undefined) data.title = op.title;
  if (op.description !== undefined) data.description = op.description;
  if (op.status !== undefined) {
    data.status = op.status;
    if (isNewlyPublished(op.status, existingStatus)) {
      data.publishedAt = new Date();
    }
  }
  if (op.orderIndex !== undefined) data.orderIndex = op.orderIndex;
  if (op.audio) data.durationSeconds = op.audio.durationSeconds;
  return data;
}

function isNewlyPublished(status: Status, existingStatus: Status | null | undefined): boolean {
  return status === Status.published && existingStatus !== Status.published;
}

@Injectable()
export class ListingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config?: ConfigService,
  ) {}

  private toPublicAssetUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    if (/^[a-z]+:\/\//i.test(value)) return value;
    const base = this.config?.ASSET_CDN_BASE_URL;
    if (!base) return value;
    return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  }

  async findIdBySlug(slug: string): Promise<string | null> {
    const listing = await this.prisma.listing.findUnique({ where: { slug }, select: { id: true } });
    return listing?.id ?? null;
  }

  async findDetailBySlug(slug: string): Promise<ListingDetailDto | null> {
    const locale = getRequestLocale();

    const listing = await this.prisma.listing.findFirst({
      where: {
        ...publishedListingSlugWhere(slug),
        scholar: { isActive: true },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        coverImageUrl: true,
        description: true,
        format: true,
        language: true,
        durationSeconds: true,
        publishedLectureCount: true,
        publishedDurationSeconds: true,
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
            title: true,
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

    const { seriesContext, rootListing } = await this.resolveAncestry(listing.parentId, locale);
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
      description: toOptional(resolved.fields.description),
      format: listing.format,
      coverImageUrl: this.toPublicAssetUrl(listing.coverImageUrl),
      language: toOptional(listing.language),
      originalLanguage: resolved.originalLanguage,
      original: mapOriginalListingTranslation(resolved.original),
      durationSeconds: toOptional(listing.durationSeconds),
      publishedLectureCount: toOptional(listing.publishedLectureCount),
      publishedDurationSeconds: toOptional(listing.publishedDurationSeconds),
      publishedAt: listing.publishedAt?.toISOString(),
      scholar: {
        id: listing.scholar.id,
        slug: listing.scholar.slug,
        name: scholarName,
        imageUrl: toOptional(listing.scholar.imageUrl),
        title: toOptional(listing.scholar.title),
      },
      topics: listing.topics.map((lt) => mapListingTopic(lt.topic)),
      primaryAudioAsset: mapPrimaryAudioAsset(primaryAudio),
      seriesContext,
      rootListing,
    };
  }

  private resolveTranslatedTitle(
    item: {
      title: string;
      language: Locale | null;
      translations: { title: string }[];
    },
    locale: Locale,
  ): string {
    return resolveContentTranslation({
      base: { title: item.title },
      originalLanguage: item.language,
      targetLocale: locale,
      publishedTranslation: item.translations[0] ?? null,
    }).fields.title;
  }

  /**
   * Resolves both the immediate Series/Module a listing is nested under (for
   * breadcrumb display) and its ultimate top-level Listing ancestor (for
   * redirecting a Lesson/Module's own slug to the top-level page it belongs
   * under — slugs are flat, so a nested item's slug never encodes its
   * parent). Listing nesting is capped at 3 levels (Collection -> Module ->
   * Lesson), so at most one extra hop past the immediate parent is needed.
   * Prev/next lecture navigation is not resolved here — it only ever knew
   * about direct siblings, so it silently failed to cross Module boundaries
   * inside a Collection. Real prev/next playback navigation is derived
   * client-side from the full ordered play queue (built from
   * `findContentsBySlug`) instead.
   */
  private async resolveAncestry(
    parentId: string | null,
    locale: Locale,
  ): Promise<{
    seriesContext: ListingDetailDto['seriesContext'];
    rootListing: ListingDetailDto['rootListing'];
  }> {
    if (!parentId) return { seriesContext: null, rootListing: null };

    const parent = await this.prisma.listing.findFirst({
      where: { id: parentId, deletedAt: null, status: Status.published },
      select: {
        id: true,
        slug: true,
        title: true,
        language: true,
        parentId: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
      },
    });

    if (!parent) return { seriesContext: null, rootListing: null };

    const seriesContext = {
      seriesId: parent.id,
      seriesTitle: this.resolveTranslatedTitle(parent, locale),
      seriesSlug: parent.slug,
    };

    if (!parent.parentId) {
      return {
        seriesContext,
        rootListing: { id: parent.id, slug: parent.slug, title: seriesContext.seriesTitle },
      };
    }

    const grandparent = await this.prisma.listing.findFirst({
      where: { id: parent.parentId, deletedAt: null, status: Status.published },
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

    if (!grandparent) return { seriesContext, rootListing: null };

    return {
      seriesContext,
      rootListing: {
        id: grandparent.id,
        slug: grandparent.slug,
        title: this.resolveTranslatedTitle(grandparent, locale),
      },
    };
  }

  async findContentsBySlug(slug: string): Promise<ListingContentsDto | null> {
    const locale = getRequestLocale();

    const listing = await this.prisma.listing.findFirst({
      where: {
        ...publishedListingSlugWhere(slug),
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

  async findLastPlayedLesson(slug: string, userId: string): Promise<LastPlayedLessonDto | null> {
    const targetListing = await this.prisma.listing.findFirst({
      where: publishedListingSlugWhere(slug),
      select: { id: true },
    });

    if (!targetListing) return null;

    const actualId = targetListing.id;

    const progress = await this.prisma.$queryRaw<
      {
        listingId: string;
        listingSlug: string;
        positionSeconds: number;
        isCompleted: boolean;
        updatedAt: Date;
      }[]
    >`
      SELECT ulp."listingId", l."slug" AS "listingSlug", ulp."positionSeconds", ulp."isCompleted", ulp."updatedAt"
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

    const result: LastPlayedLessonDto = {
      listingId: p.listingId,
      positionSeconds: p.positionSeconds,
      isCompleted: p.isCompleted,
      updatedAt: p.updatedAt.toISOString(),
    };
    if (p.listingSlug) result.listingSlug = p.listingSlug;
    return result;
  }

  /**
   * Read-time aggregate of a user's progress across a Listing's playable
   * leaves, computed on demand from `UserListingProgress` — not stored.
   * Public/HTTP path — the client always supplies the public slug, resolved
   * through the same published-only identity seam as every Catalog read.
   */
  async getProgressSummary(
    slug: string,
    userId: string,
  ): Promise<ListingProgressSummaryDto | null> {
    const listing = await this.prisma.listing.findFirst({
      where: publishedListingSlugWhere(slug),
      select: { id: true, slug: true, format: true },
    });
    if (!listing) return null;

    return this.computeProgressSummary(listing.id, listing.slug, listing.format, userId);
  }

  /**
   * For callers that already hold a resolved Listing uuid — e.g.
   * LibraryRepository's rollup, which derives a top-level ancestor id by
   * walking `parentId` chains on raw progress rows, never a client-supplied
   * slug. Skips the slug lookup `getProgressSummary` does above.
   */
  async getProgressSummaryByListingId(
    id: string,
    userId: string,
  ): Promise<ListingProgressSummaryDto | null> {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true, format: true },
    });
    if (!listing) return null;

    return this.computeProgressSummary(listing.id, listing.slug, listing.format, userId);
  }

  private async computeProgressSummary(
    actualId: string,
    listingSlug: string,
    format: ListingProgressSummaryDto['format'],
    userId: string,
  ): Promise<ListingProgressSummaryDto> {
    const counts =
      format === 'single'
        ? await this.getSingleProgressCounts(actualId, userId)
        : await this.getNestedProgressCounts(actualId, userId, format);

    return this.toProgressSummary(actualId, listingSlug, format, counts.total, counts.completed);
  }

  private async getSingleProgressCounts(
    listingId: string,
    userId: string,
  ): Promise<{ total: number; completed: number }> {
    const progress = await this.prisma.userListingProgress.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { isCompleted: true },
    });
    return { total: 1, completed: progress?.isCompleted ? 1 : 0 };
  }

  private async getNestedProgressCounts(
    listingId: string,
    userId: string,
    format: ListingProgressSummaryDto['format'],
  ): Promise<{ total: number; completed: number }> {
    const [row] =
      format === 'series'
        ? await this.prisma.$queryRaw<{ total: number; completed: number }[]>`
          SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE ulp."isCompleted")::int AS completed
          FROM "Listing" l
          LEFT JOIN "UserListingProgress" ulp ON ulp."listingId" = l.id AND ulp."userId" = ${userId}
          WHERE l."parentId" = ${listingId}::uuid
            AND l."deletedAt" IS NULL
            AND l."status" = 'published'
        `
        : await this.prisma.$queryRaw<{ total: number; completed: number }[]>`
          SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE ulp."isCompleted")::int AS completed
          FROM "Listing" l
          JOIN "Listing" m ON l."parentId" = m.id
          LEFT JOIN "UserListingProgress" ulp ON ulp."listingId" = l.id AND ulp."userId" = ${userId}
          WHERE m."parentId" = ${listingId}::uuid
            AND l."deletedAt" IS NULL
            AND l."status" = 'published'
            AND m."deletedAt" IS NULL
            AND m."status" = 'published'
        `;
    return { total: row?.total ?? 0, completed: row?.completed ?? 0 };
  }

  private toProgressSummary(
    listingId: string,
    listingSlug: string,
    format: ListingProgressSummaryDto['format'],
    totalCount: number,
    completedCount: number,
  ): ListingProgressSummaryDto {
    return {
      listingId,
      listingSlug,
      format,
      totalCount,
      completedCount,
      percentComplete: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
      isCompleted: totalCount > 0 && completedCount === totalCount,
    };
  }

  async findRelated(slug: string, limit = 6): Promise<RelatedListingDto[]> {
    const locale = getRequestLocale();
    // The related surface is discovery too — an unpublished or deleted target
    // resolves as empty through the same identity seam, never by internal ID.
    const listing = await this.prisma.listing.findFirst({
      where: publishedListingSlugWhere(slug),
      select: {
        id: true,
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
          { id: { not: listing.id } },
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
        original: mapOriginalListingTitle(resolved.original),
        durationSeconds: toOptional(r.durationSeconds),
        scholar: {
          id: r.scholar.id,
          slug: r.scholar.slug,
          name: scholarName,
          imageUrl: toOptional(r.scholar.imageUrl),
        },
        primaryAudioAsset: mapPrimaryAudioAsset(r.audioAssets[0] ?? null),
      };
    });
  }

  // ─── Counter Sync Hooks ───────────────────────────────────────────────────

  async syncListingCounters(
    listingId: string,
    tx: Prisma.TransactionClient,
    options?: { recurse?: boolean },
  ): Promise<void> {
    const children = await this.findPublishedChildren(tx, listingId);
    const { totalCount, totalDuration } = sumListingCounters(children);

    await tx.listing.update({
      where: { id: listingId },
      data: {
        publishedLectureCount: totalCount,
        publishedDurationSeconds: totalDuration,
      },
    });

    if (options?.recurse === false) return;

    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { parentId: true },
    });

    if (listing?.parentId) {
      await this.syncListingCounters(listing.parentId, tx);
    }
  }

  private async findPublishedChildren(
    tx: Prisma.TransactionClient,
    listingId: string,
  ): Promise<CounterChild[]> {
    return tx.listing.findMany({
      where: { parentId: listingId, status: Status.published, deletedAt: null },
      select: {
        format: true,
        durationSeconds: true,
        publishedLectureCount: true,
        publishedDurationSeconds: true,
      },
    });
  }

  // ─── Admin Listing Methods ────────────────────────────────────────────────

  async listAdmin(params: AdminListingFilterParams): Promise<AdminListingListDto> {
    const locale = getRequestLocale();
    const pageSize = 50;
    const take = pageSize + 1;

    const where = buildAdminListingWhere(params);

    const baseQueryArgs = {
      where,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        language: true,
        status: true,
        format: true,
        durationSeconds: true,
        orderIndex: true,
        createdAt: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
        scholar: {
          select: {
            slug: true,
            name: true,
            mainLanguage: true,
            translations: {
              where: { locale, status: 'published' },
              select: { name: true },
              take: 1,
            },
          },
        },
      },
    } satisfies Prisma.ListingFindManyArgs;
    const queryArgs = params.cursor
      ? { ...baseQueryArgs, cursor: { id: params.cursor }, skip: 1 }
      : baseQueryArgs;
    const records = await this.prisma.listing.findMany(queryArgs);

    const hasMore = records.length > pageSize;
    const items = (hasMore ? records.slice(0, pageSize) : records).map((r) => {
      const title = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      }).fields.title;

      const scholarName = resolveContentTranslation({
        base: { name: r.scholar.name },
        originalLanguage: r.scholar.mainLanguage,
        targetLocale: locale,
        publishedTranslation: r.scholar.translations[0] ?? null,
      }).fields.name;

      return {
        id: r.id,
        title,
        coverImageUrl: this.toPublicAssetUrl(r.coverImageUrl),
        scholarName,
        scholarSlug: r.scholar.slug,
        format: r.format,
        status: r.status,
        durationSeconds: r.durationSeconds ?? undefined,
        orderIndex: r.orderIndex ?? undefined,
        createdAt: r.createdAt.toISOString(),
      };
    });
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
        coverImageUrl: true,
        scholar: { select: { name: true, slug: true } },
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
      ...getAdminListingOptionalFields(listing),
      format: listing.format,
      status: listing.status,
      scholarId: listing.scholarId,
      scholarSlug: listing.scholar.slug,
      scholarName: listing.scholar.name,
      topics: listing.topics.map((t) => t.topic.id),
      audioUrl: listing.audioAssets[0]?.url,
      createdAt: listing.createdAt.toISOString(),
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
        coverImageUrl: true,
        scholar: { select: { name: true, slug: true } },
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
        ...getAdminListingOptionalFields(listing),
        format: listing.format,
        status: listing.status,
        scholarId: listing.scholarId,
        scholarSlug: listing.scholar.slug,
        scholarName: listing.scholar.name,
        topics: listing.topics.map((t) => t.topic.id),
        audioUrl: listing.audioAssets[0]?.url,
        createdAt: listing.createdAt.toISOString(),
      },
      translations: listing.translations.map((t) => ({
        locale: t.locale,
        status: t.status,
        fields: {
          title: t.title,
          description: nullableValue(t.description),
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
        data: buildCreateListingData(dto, slug, createdBy),
        select: { id: true, title: true, parentId: true },
      });

      await createListingTopics(tx, listing.id, dto.topics);
      await createListingAudioAsset(tx, listing.id, dto);

      if (listing.parentId) {
        await this.syncListingCounters(listing.parentId, tx);
      }

      await syncMainLanguageTranslation({
        upsert: (locale, fields) =>
          this.upsertMainListingTranslation(tx, listing.id, locale, fields),
        newLocale: dto.language ?? 'ar',
        newFields: { title: dto.title, description: null },
      });

      return { id: listing.id, title: listing.title };
    });
  }

  private upsertMainListingTranslation(
    tx: Prisma.TransactionClient,
    listingId: string,
    locale: Locale,
    fields: { title: string; description?: string | null },
  ) {
    return tx.listingTranslation.upsert({
      where: { listingId_locale: { listingId, locale } },
      create: {
        listingId,
        locale,
        title: fields.title,
        description: fields.description ?? null,
        status: 'published',
      },
      update: { title: fields.title, description: fields.description ?? null, status: 'published' },
    });
  }

  private async syncUpdatedListingParents(
    tx: Prisma.TransactionClient,
    originalParentId: string | null,
    nextParentId: string | null | undefined,
  ): Promise<void> {
    if (originalParentId) {
      await this.syncListingCounters(originalParentId, tx);
    }
    if (nextParentId !== undefined && nextParentId !== originalParentId && nextParentId) {
      await this.syncListingCounters(nextParentId, tx);
    }
  }

  private async syncArrangeLessonAudio(
    tx: Prisma.TransactionClient,
    listingId: string,
    audio: ArrangeAudioRef,
  ): Promise<void> {
    const primary = await tx.audioAsset.findFirst({
      where: { listingId, isPrimary: true },
      select: { id: true },
    });
    if (primary) {
      await tx.audioAsset.update({
        where: { id: primary.id },
        data: this.arrangeAudioAssetData(audio),
      });
      return;
    }
    await tx.audioAsset.create({
      data: {
        listingId,
        ...this.arrangeAudioAssetData(audio),
        isPrimary: true,
        source: 'r2',
      },
    });
  }

  private async createArrangeLesson(
    tx: Prisma.TransactionClient,
    op: Extract<ArrangeLessonOp, { op: 'create' }>,
    parentId: string,
    scholarId: string,
    userId?: string,
  ): Promise<string> {
    const status = op.status ?? Status.draft;
    const lesson = await tx.listing.create({
      data: {
        slug: op.slug,
        title: op.title,
        description: op.description ?? undefined,
        format: 'single',
        status,
        publishedAt: status === Status.published ? new Date() : undefined,
        orderIndex: op.orderIndex ?? undefined,
        durationSeconds: op.audio.durationSeconds,
        scholarId,
        parentId,
        createdBy: userId,
      },
      select: { id: true },
    });
    await tx.audioAsset.create({
      data: {
        listingId: lesson.id,
        ...this.arrangeAudioAssetData(op.audio),
        isPrimary: true,
        source: 'r2',
      },
    });
    return lesson.id;
  }

  private async updateArrangeLesson(
    tx: Prisma.TransactionClient,
    op: Extract<ArrangeLessonOp, { op: 'update' }>,
    userId?: string,
  ): Promise<void> {
    const existing = await tx.listing.findUnique({
      where: { id: op.id },
      select: { status: true },
    });
    const data = buildArrangeLessonUpdateData(op, existing?.status, userId);
    await tx.listing.update({ where: { id: op.id }, data });
    if (op.audio) await this.syncArrangeLessonAudio(tx, op.id, op.audio);
  }

  async updateListingDetails(
    id: string,
    dto: UpdateListingDetailsDto,
    updatedBy?: string,
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const original = await tx.listing.findUnique({
          where: { id },
          select: {
            parentId: true,
            status: true,
            language: true,
            title: true,
            description: true,
          },
        });

        if (!original) throw new Error('Not found');

        const hasTranslatableChange = hasTranslatableListingChange(dto);

        // Exclude topics from the main update data
        const { topics, ...dtoWithoutTopics } = dto;

        const updateData: Prisma.ListingUpdateInput = {
          ...dtoWithoutTopics,
          updatedAt: new Date(),
          updatedBy,
        };

        setPublishedAtWhenPublishing(updateData, dto.status, original.status);

        await tx.listing.update({
          where: { id },
          data: updateData,
        });

        if (hasTranslatableChange) {
          await syncMainLanguageTranslation({
            upsert: (locale, fields) => this.upsertMainListingTranslation(tx, id, locale, fields),
            oldLocale: original.language,
            oldFields: { title: original.title, description: original.description },
            newLocale: dto.language ?? original.language ?? 'ar',
            newFields: {
              title: dto.title ?? original.title,
              description: dto.description !== undefined ? dto.description : original.description,
            },
          });
        }

        await replaceListingTopics(tx, id, topics);

        await this.syncUpdatedListingParents(tx, original.parentId, dto.parentId);
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateListingMedia(
    id: string,
    dto: UpdateListingMediaDto,
    updatedBy?: string,
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const listing = await tx.listing.findUnique({
          where: { id },
          select: { id: true, format: true, parentId: true },
        });

        if (!listing) throw new Error('Not found');

        const updateData = buildListingMediaUpdateData(dto, updatedBy);

        await tx.listing.update({
          where: { id },
          data: updateData,
        });

        // Replace the primary audio asset if audioKey is provided; create it when
        // the listing has none yet (updateMany alone would silently no-op).
        if (dto.audioKey) {
          const assetData = {
            url: `${process.env['R2_PUBLIC_BASE_URL']}/${dto.audioKey}`,
            objectKey: dto.audioKey,
            format: dto.audioKey.endsWith('.mp3') ? 'mp3' : undefined,
            sizeBytes: dto.sizeBytes,
            durationSeconds: dto.durationSeconds,
          };
          const primary = await tx.audioAsset.findFirst({
            where: { listingId: id, isPrimary: true },
            select: { id: true },
          });
          if (primary) {
            await tx.audioAsset.update({ where: { id: primary.id }, data: assetData });
          } else {
            await tx.audioAsset.create({
              data: { listingId: id, ...assetData, isPrimary: true, source: 'r2' },
            });
          }
        }

        // Sync parent counters if this listing has a parent
        if (listing.parentId) {
          await this.syncListingCounters(listing.parentId, tx);
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  async getMediaData(id: string): Promise<AdminListingMediaDetailDto | null> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        format: true,
        orderIndex: true,
        durationSeconds: true,
        audioAssets: {
          where: { isPrimary: true },
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

    return {
      id: listing.id,
      title: listing.title,
      format: listing.format,
      orderIndex: listing.orderIndex ?? undefined,
      durationSeconds: listing.durationSeconds ?? undefined,
      audioUrl: listing.audioAssets[0]?.url,
      audioAssets: listing.audioAssets.map((asset) => ({
        id: asset.id,
        url: asset.url,
        format: asset.format ?? undefined,
        bitrateKbps: asset.bitrateKbps ?? undefined,
        durationSeconds: asset.durationSeconds ?? undefined,
      })),
    };
  }

  // ─── Arrange (bulk upload) Methods ────────────────────────────────────────

  async getArrangeData(id: string): Promise<AdminArrangeDataDto | null> {
    const arrangeChildSelect = {
      id: true,
      slug: true,
      title: true,
      status: true,
      orderIndex: true,
      durationSeconds: true,
      audioAssets: { where: { isPrimary: true }, take: 1, select: { id: true } },
    } satisfies Prisma.ListingSelect;

    const root = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        format: true,
        scholarId: true,
        status: true,
        audioAssets: { where: { isPrimary: true }, take: 1, select: { url: true } },
        children: {
          where: { deletedAt: null },
          orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
          select: {
            ...arrangeChildSelect,
            children: {
              where: { deletedAt: null },
              orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
              select: arrangeChildSelect,
            },
          },
        },
      },
    });

    if (!root) return null;

    const mapLesson = (child: {
      id: string;
      slug: string;
      title: string;
      status: Status;
      orderIndex: number | null;
      durationSeconds: number | null;
      audioAssets: { id: string }[];
    }): AdminArrangeLessonDto => ({
      id: child.id,
      slug: child.slug,
      title: child.title,
      status: child.status,
      orderIndex: child.orderIndex ?? undefined,
      durationSeconds: child.durationSeconds ?? undefined,
      hasAudio: child.audioAssets.length > 0,
    });

    return {
      id: root.id,
      slug: root.slug,
      title: root.title,
      format: root.format,
      scholarId: root.scholarId,
      status: root.status,
      audioUrl: root.audioAssets[0]?.url,
      modules:
        root.format === 'collection'
          ? root.children.map((m) => ({ ...mapLesson(m), lessons: m.children.map(mapLesson) }))
          : [],
      lessons: root.format === 'series' ? root.children.map(mapLesson) : [],
    };
  }

  private validateArrangeRoot(root: { format: ListingFormat }, dto: ArrangeCommitDto): void {
    if (root.format === 'single') {
      throw new BadRequestException('Single listings update audio via the media endpoint');
    }
    if (root.format === 'series' && !dto.lessons) {
      throw new BadRequestException('Series commits require lessons');
    }
    if (root.format === 'collection' && !dto.modules) {
      throw new BadRequestException('Collection commits require modules');
    }
  }

  private async getArrangeModuleSlugs(
    tx: Prisma.TransactionClient,
    rootId: string,
    moduleOps: NonNullable<ArrangeCommitDto['modules']>,
  ): Promise<Map<string, string>> {
    const moduleUpdateIds = moduleOps.flatMap((moduleOp) =>
      moduleOp.op === 'update' ? [moduleOp.id] : [],
    );
    if (moduleUpdateIds.length === 0) return new Map();

    const found = await tx.listing.findMany({
      where: { id: { in: moduleUpdateIds }, parentId: rootId, deletedAt: null },
      select: { id: true, slug: true },
    });
    if (found.length !== moduleUpdateIds.length) {
      throw new BadRequestException('Module update target is not under this listing');
    }
    return new Map(found.map((module) => [module.id, module.slug]));
  }

  private async validateArrangeCommit(
    tx: Prisma.TransactionClient,
    rootId: string,
    dto: ArrangeCommitDto,
  ) {
    const root = await tx.listing.findFirst({
      where: { id: rootId, deletedAt: null },
      select: { id: true, slug: true, scholarId: true, format: true },
    });
    if (!root) throw new NotFoundException('Listing not found');
    this.validateArrangeRoot(root, dto);

    const moduleOps = dto.modules ?? [];
    const rootLessonOps = dto.lessons ?? [];
    this.validateNewModuleLessons(moduleOps);
    const existingModuleSlugById = await this.getArrangeModuleSlugs(tx, rootId, moduleOps);

    await this.validateArrangeSlugs(
      tx,
      root.slug,
      moduleOps,
      rootLessonOps,
      existingModuleSlugById,
    );

    await this.validateArrangeLessonTargets(tx, rootId, moduleOps, rootLessonOps);
    return { root, moduleOps, rootLessonOps };
  }

  private validateNewModuleLessons(moduleOps: NonNullable<ArrangeCommitDto['modules']>): void {
    for (const moduleOp of moduleOps) {
      if (moduleOp.op === 'create' && moduleOp.lessons.some((lesson) => lesson.op === 'update')) {
        throw new BadRequestException('New modules can only contain new lessons');
      }
    }
  }

  private buildArrangePrefixChecks(
    rootSlug: string,
    moduleOps: NonNullable<ArrangeCommitDto['modules']>,
    rootLessonOps: NonNullable<ArrangeCommitDto['lessons']>,
    existingModuleSlugById: Map<string, string>,
  ): { slug: string; expectedPrefix: string }[] {
    return [
      ...this.buildArrangeModulePrefixChecks(rootSlug, moduleOps, existingModuleSlugById),
      ...this.buildArrangeRootLessonPrefixChecks(rootSlug, rootLessonOps),
    ];
  }

  private buildArrangeModulePrefixChecks(
    rootSlug: string,
    moduleOps: NonNullable<ArrangeCommitDto['modules']>,
    existingModuleSlugById: Map<string, string>,
  ): { slug: string; expectedPrefix: string }[] {
    const checks: { slug: string; expectedPrefix: string }[] = [];
    for (const moduleOp of moduleOps) {
      const parentSlug =
        moduleOp.op === 'create'
          ? moduleOp.slug
          : (existingModuleSlugById.get(moduleOp.id) ?? rootSlug);
      if (moduleOp.op === 'create') {
        checks.push({ slug: moduleOp.slug, expectedPrefix: rootSlug });
      }
      for (const lessonOp of moduleOp.lessons) {
        if (lessonOp.op === 'create') {
          checks.push({ slug: lessonOp.slug, expectedPrefix: parentSlug });
        }
      }
    }
    return checks;
  }

  private buildArrangeRootLessonPrefixChecks(
    rootSlug: string,
    rootLessonOps: NonNullable<ArrangeCommitDto['lessons']>,
  ): { slug: string; expectedPrefix: string }[] {
    const checks: { slug: string; expectedPrefix: string }[] = [];
    for (const lessonOp of rootLessonOps) {
      if (lessonOp.op === 'create') {
        checks.push({ slug: lessonOp.slug, expectedPrefix: rootSlug });
      }
    }
    return checks;
  }

  private async validateArrangeSlugs(
    tx: Prisma.TransactionClient,
    rootSlug: string,
    moduleOps: NonNullable<ArrangeCommitDto['modules']>,
    rootLessonOps: NonNullable<ArrangeCommitDto['lessons']>,
    existingModuleSlugById: Map<string, string>,
  ): Promise<void> {
    const prefixChecks = this.buildArrangePrefixChecks(
      rootSlug,
      moduleOps,
      rootLessonOps,
      existingModuleSlugById,
    );

    const createSlugs = prefixChecks.map((check) => check.slug);
    const duplicates = createSlugs.filter((slug, index) => createSlugs.indexOf(slug) !== index);
    if (duplicates.length) {
      throw new BadRequestException(`Duplicate slugs in payload: ${duplicates.join(', ')}`);
    }
    const badPrefix = prefixChecks.filter(
      (check) => !check.slug.startsWith(`${check.expectedPrefix}-`),
    );
    if (badPrefix.length) {
      throw new BadRequestException(
        `Slugs must be prefixed by their parent's slug: ${badPrefix
          .map((check) => `${check.slug} (expected prefix: ${check.expectedPrefix}-)`)
          .join(', ')}`,
      );
    }
    if (!createSlugs.length) return;

    const clashes = await tx.listing.findMany({
      where: { slug: { in: createSlugs } },
      select: { slug: true },
    });
    if (clashes.length) {
      throw new ConflictException({
        message: 'Slugs already in use',
        conflictingSlugs: clashes.map((clash) => clash.slug),
      });
    }
  }

  private collectArrangeLessonUpdateTargets(
    moduleOps: ArrangeCommitDto['modules'],
    rootLessonOps: ArrangeCommitDto['lessons'],
    rootId: string,
  ): Array<{ id: string; parentId: string }> {
    return [
      ...this.collectRootLessonUpdateTargets(rootLessonOps, rootId),
      ...this.collectModuleLessonUpdateTargets(moduleOps),
    ];
  }

  private collectRootLessonUpdateTargets(
    rootLessonOps: ArrangeCommitDto['lessons'],
    rootId: string,
  ): Array<{ id: string; parentId: string }> {
    const targets: Array<{ id: string; parentId: string }> = [];
    for (const lessonOp of rootLessonOps ?? []) {
      if (lessonOp.op === 'update') targets.push({ id: lessonOp.id, parentId: rootId });
    }
    return targets;
  }

  private collectModuleLessonUpdateTargets(
    moduleOps: ArrangeCommitDto['modules'],
  ): Array<{ id: string; parentId: string }> {
    const targets: Array<{ id: string; parentId: string }> = [];
    for (const moduleOp of moduleOps ?? []) {
      if (moduleOp.op !== 'update') continue;
      for (const lessonOp of moduleOp.lessons) {
        if (lessonOp.op === 'update') {
          targets.push({ id: lessonOp.id, parentId: moduleOp.id });
        }
      }
    }
    return targets;
  }

  private assertArrangeLessonTargets(
    targets: Array<{ id: string; parentId: string }>,
    found: Array<{ id: string; parentId: string | null }>,
  ): void {
    const parentById = new Map(found.map((listing) => [listing.id, listing.parentId]));
    for (const target of targets) {
      if (parentById.get(target.id) !== target.parentId) {
        throw new BadRequestException('Lesson update target is not under this listing');
      }
    }
  }

  private async validateArrangeLessonTargets(
    tx: Prisma.TransactionClient,
    rootId: string,
    moduleOps: ArrangeCommitDto['modules'],
    rootLessonOps: ArrangeCommitDto['lessons'],
  ): Promise<void> {
    const lessonUpdateTargets = this.collectArrangeLessonUpdateTargets(
      moduleOps,
      rootLessonOps,
      rootId,
    );
    if (!lessonUpdateTargets.length) return;

    const found = await tx.listing.findMany({
      where: { id: { in: lessonUpdateTargets.map((target) => target.id) }, deletedAt: null },
      select: { id: true, parentId: true },
    });
    this.assertArrangeLessonTargets(lessonUpdateTargets, found);
  }

  private async applyArrangeModule(
    tx: Prisma.TransactionClient,
    moduleOp: NonNullable<ArrangeCommitDto['modules']>[number],
    rootId: string,
    scholarId: string,
    userId: string | undefined,
    result: ArrangeCommitResultDto,
    touchedParents: Set<string>,
  ): Promise<string> {
    if (moduleOp.op === 'create') {
      const status = moduleOp.status ?? Status.draft;
      const created = await tx.listing.create({
        data: {
          slug: moduleOp.slug,
          title: moduleOp.title,
          description: moduleOp.description ?? undefined,
          format: 'series',
          status,
          publishedAt: status === Status.published ? new Date() : undefined,
          orderIndex: moduleOp.orderIndex ?? undefined,
          scholarId,
          parentId: rootId,
          createdBy: userId,
        },
        select: { id: true },
      });
      result.createdModules += 1;
      touchedParents.add(rootId);
      return created.id;
    }

    if (moduleOp.orderIndex !== undefined) {
      await tx.listing.update({
        where: { id: moduleOp.id },
        data: { orderIndex: moduleOp.orderIndex, updatedAt: new Date(), updatedBy: userId },
      });
      touchedParents.add(rootId);
    }
    result.updatedModules += 1;
    return moduleOp.id;
  }

  async arrangeCommit(
    rootId: string,
    dto: ArrangeCommitDto,
    userId?: string,
  ): Promise<{ result: ArrangeCommitResultDto; affectedIds: string[] }> {
    return this.prisma.$transaction(async (tx) => {
      const { root, moduleOps, rootLessonOps } = await this.validateArrangeCommit(tx, rootId, dto);
      const result: ArrangeCommitResultDto = {
        createdModules: 0,
        createdLessons: 0,
        updatedModules: 0,
        updatedLessons: 0,
      };
      const affectedIds: string[] = [rootId];
      const touchedParents = new Set<string>();

      const applyLessonOp = async (op: ArrangeLessonOp, parentId: string): Promise<void> => {
        if (op.op === 'create') {
          const lessonId = await this.createArrangeLesson(tx, op, parentId, root.scholarId, userId);
          result.createdLessons += 1;
          affectedIds.push(lessonId);
        } else {
          await this.updateArrangeLesson(tx, op, userId);
          result.updatedLessons += 1;
          affectedIds.push(op.id);
        }
        touchedParents.add(parentId);
      };

      await Promise.all(rootLessonOps.map((lessonOp) => applyLessonOp(lessonOp, rootId)));

      for (const moduleOp of moduleOps) {
        const moduleId = await this.applyArrangeModule(
          tx,
          moduleOp,
          rootId,
          root.scholarId,
          userId,
          result,
          touchedParents,
        );
        affectedIds.push(moduleId);
        await Promise.all(moduleOp.lessons.map((lessonOp) => applyLessonOp(lessonOp, moduleId)));
      }

      // Touched modules never share a row with each other, so their counts can sync
      // in parallel with recurse:false (no auto-walk to root). Root is synced once,
      // after, so it aggregates the now-committed module counts instead of racing them.
      const touchedModules = [...touchedParents].filter((id) => id !== rootId);
      await Promise.all(
        touchedModules.map((id) => this.syncListingCounters(id, tx, { recurse: false })),
      );
      if (touchedParents.size > 0) {
        await this.syncListingCounters(rootId, tx);
      }

      return { result, affectedIds };
    });
  }

  private arrangeAudioAssetData(audio: ArrangeAudioRef) {
    return {
      url: `${process.env['R2_PUBLIC_BASE_URL']}/${audio.objectKey}`,
      objectKey: audio.objectKey,
      format: audio.format ?? audio.objectKey.split('.').pop(),
      sizeBytes: audio.sizeBytes ?? undefined,
      durationSeconds: audio.durationSeconds,
    };
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

  async transitionListingStatus(
    id: string,
    action: ListingEditorialTransition,
    updatedBy?: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id },
        select: { parentId: true, status: true, deletedAt: true },
      });

      if (!listing || listing.deletedAt) throw new NotFoundException(`Listing "${id}" not found`);

      assertListingTransition(action, listing.status);
      const status = action === 'publish' ? Status.published : Status.archived;
      const updateData: Prisma.ListingUpdateInput = {
        status,
        updatedAt: new Date(),
        updatedBy,
      };
      if (action === 'publish') updateData.publishedAt = new Date();

      await tx.listing.update({
        where: { id },
        data: updateData,
      });

      if (listing.parentId) await this.syncListingCounters(listing.parentId, tx);
    });
  }

  async deleteListing(id: string, deletedBy?: string): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const original = await tx.listing.findUnique({
          where: { id },
          select: { parentId: true, deletedAt: true },
        });

        if (!original || original.deletedAt) throw new Error('Not found');

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
    locale: Locale;
    status: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale,
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
    locale: Locale,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.update({
      where: { listingId_locale: { listingId, locale } },
      data: { ...fields },
    });
    return this.mapListingTranslation(record);
  }

  async publishListingTranslation(listingId: string, locale: Locale): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.update({
      where: { listingId_locale: { listingId, locale } },
      data: { status: 'published' },
    });
    return this.mapListingTranslation(record);
  }

  async unpublishListingTranslation(
    listingId: string,
    locale: Locale,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.listingTranslation.update({
      where: { listingId_locale: { listingId, locale } },
      data: { status: 'draft' },
    });
    return this.mapListingTranslation(record);
  }

  async findPromotions(): Promise<HomePromotionsDto> {
    const locale = getRequestLocale();

    // 1. Get featured hero recommendation and curated editors' picks concurrently
    const [hero, picks] = await Promise.all([
      this.prisma.recommendationHero.findFirst({
        where: { isActive: true },
        include: {
          listing: {
            include: {
              translations: {
                where: { locale, status: 'published' },
                select: { title: true },
                take: 1,
              },
              scholar: {
                select: {
                  name: true,
                  slug: true,
                  title: true,
                  imageUrl: true,
                  mainLanguage: true,
                  translations: {
                    where: { locale, status: 'published' },
                    select: { name: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.curationMetadata.findMany({
        include: {
          listing: {
            include: {
              translations: {
                where: { locale, status: 'published' },
                select: { title: true },
                take: 1,
              },
              scholar: {
                select: {
                  name: true,
                  slug: true,
                  title: true,
                  mainLanguage: true,
                  translations: {
                    where: { locale, status: 'published' },
                    select: { name: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const toPublicUrl = (value: string): string => {
      if (/^[a-z]+:\/\//i.test(value)) {
        return value;
      }
      const base = this.config?.ASSET_CDN_BASE_URL;
      if (!base) return value;
      return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
    };

    const toOptionalPublicUrl = (value?: string | null): string | undefined => {
      if (!value) return undefined;
      return toPublicUrl(value);
    };

    const getListingMetrics = (l: any) => ({
      durationSeconds:
        l.format === 'single' ? (l.durationSeconds ?? 0) : (l.publishedDurationSeconds ?? 0),
      thumbnailUrl: l.format === 'single' ? null : toOptionalPublicUrl(l.coverImageUrl),
      publishedLectureCount: l.format === 'single' ? 1 : (l.publishedLectureCount ?? 1),
    });

    const mapListing = (l: any) => {
      const resolved = resolveContentTranslation({
        base: { title: l.title },
        originalLanguage: l.language,
        targetLocale: locale,
        publishedTranslation: l.translations[0] ?? null,
      });
      const scholarName = resolveContentTranslation({
        base: { name: l.scholar!.name },
        originalLanguage: l.scholar!.mainLanguage,
        targetLocale: locale,
        publishedTranslation: l.scholar!.translations[0] ?? null,
      }).fields.name;

      const { durationSeconds, thumbnailUrl, publishedLectureCount } = getListingMetrics(l);

      return {
        // SAFETY: listing formats are constrained by the shared listing schema to these three values.
        kind: l.format as 'collection' | 'series' | 'single',
        id: l.id,
        title: resolved.fields.title,
        slug: l.slug,
        scholarName,
        scholarSlug: l.scholar!.slug,
        scholarTitle: toOptional(l.scholar!.title),
        scholarImageUrl: toOptional(l.scholar!.imageUrl),
        thumbnailUrl: thumbnailUrl ?? null,
        durationSeconds: durationSeconds ?? 0,
        publishedLectureCount,
        publishedAt: (l.publishedAt ?? l.createdAt).toISOString(),
        originalLanguage: resolved.originalLanguage,
      };
    };

    return {
      hero: hero
        ? {
            id: hero.id,
            listingId: hero.listingId,
            headline: hero.headline,
            listing: mapListing(hero.listing),
          }
        : null,
      editorsPicks: picks.map((p) => ({
        id: p.id,
        listingId: p.listingId,
        listing: mapListing(p.listing),
      })),
    };
  }

  async updatePromotions(body: {
    heroListingId?: string | null;
    heroHeadline?: string | null;
    editorsPickListingIds?: string[];
  }) {
    await this.prisma.$transaction(async (tx) => {
      // 1. Update Hero
      if (body.heroListingId !== undefined) {
        // Deactivate existing heroes
        await tx.recommendationHero.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });

        if (body.heroListingId && body.heroHeadline) {
          // Create new hero
          await tx.recommendationHero.create({
            data: {
              listingId: body.heroListingId,
              headline: body.heroHeadline,
              isActive: true,
            },
          });
        }
      }

      // 2. Update Editors' Picks
      if (body.editorsPickListingIds !== undefined) {
        // Delete existing curation metadata
        await tx.curationMetadata.deleteMany({});

        if (body.editorsPickListingIds.length > 0) {
          // Insert new ones in bulk
          await tx.curationMetadata.createMany({
            data: body.editorsPickListingIds.map((listingId) => ({
              listingId,
            })),
          });
        }
      }
    });

    return { success: true };
  }
}
