import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma, Status } from '@sd/db/client';
import { UpsertSeriesDto } from './dto/upsert-series.dto';
import { SeriesViewDto } from './dto/series-view.dto';

const seriesViewSelect = {
  id: true,
  scholarId: true,
  collectionId: true,
  slug: true,
  title: true,
  description: true,
  coverImageUrl: true,
  language: true,
  status: true,
  orderIndex: true,
  deletedAt: true,
  deleteAfterAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SeriesSelect;

type SeriesViewRecord = Prisma.SeriesGetPayload<{
  select: typeof seriesViewSelect;
}>;

@Injectable()
export class SeriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedByScholarSlug(
    scholarSlug: string,
  ): Promise<SeriesViewDto[]> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return [];

    const records = await this.prisma.series.findMany({
      where: {
        scholarId: scholar.id,
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
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      select: seriesViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  async findPublishedByScholarSlugAndSlug(
    scholarSlug: string,
    slug: string,
  ): Promise<SeriesViewDto | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return null;

    const record = await this.prisma.series.findFirst({
      where: {
        scholarId: scholar.id,
        slug,
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
      select: seriesViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  async findPublishedById(id: string): Promise<SeriesViewDto | null> {
    const record = await this.prisma.series.findFirst({
      where: {
        id,
        deletedAt: null,
        status: Status.published,
        scholar: {
          isActive: true,
        },
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
      select: seriesViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  async upsertByScholarSlug(
    scholarSlug: string,
    input: UpsertSeriesDto,
  ): Promise<SeriesViewDto | null> {
    const scholar = await this.prisma.scholar.findUnique({
      where: { slug: scholarSlug },
      select: { id: true },
    });
    if (!scholar) return null;

    const collectionId = await this.resolveOptionalCollectionId(
      scholar.id,
      input.collectionSlug,
    );
    if (input.collectionSlug && !collectionId) return null; // parent collection not found

    const record = await this.prisma.series.upsert({
      where: { scholarId_slug: { scholarId: scholar.id, slug: input.slug } },
      select: seriesViewSelect,
      create: {
        scholarId: scholar.id,
        collectionId,
        slug: input.slug,
        title: input.title,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        language: input.language,
        status: input.status ?? Status.draft,
        orderIndex: input.orderIndex,
        deletedAt: input.deletedAt ? new Date(input.deletedAt) : null,
        deleteAfterAt: input.deleteAfterAt
          ? new Date(input.deleteAfterAt)
          : null,
      },
      update: {
        collectionId,
        title: input.title,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        language: input.language,
        status: input.status ?? Status.draft,
        orderIndex: input.orderIndex,
        deletedAt: input.deletedAt ? new Date(input.deletedAt) : null,
        deleteAfterAt: input.deleteAfterAt
          ? new Date(input.deleteAfterAt)
          : null,
      },
    });

    return this.toViewDto(record);
  }

  /**
   * List published series that belong to a given scholar + collection.
   * Returns null if either the scholar or the collection is not found.
   */
  async listPublishedByScholarAndCollectionSlug(
    scholarSlug: string,
    collectionSlug: string,
  ): Promise<SeriesViewDto[] | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });

    if (!scholar) {
      return null;
    }

    const collection = await this.prisma.collection.findFirst({
      where: {
        scholarId: scholar.id,
        slug: collectionSlug,
        deletedAt: null,
        status: Status.published,
      },
      select: { id: true },
    });

    if (!collection) {
      return null;
    }

    const records = await this.prisma.series.findMany({
      where: {
        scholarId: scholar.id,
        collectionId: collection.id,
        deletedAt: null,
        status: Status.published,
      },
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      select: /* your existing select, e.g. */ seriesViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  // ----------------
  // Helpers
  // ----------------

  private async resolveOptionalCollectionId(
    scholarId: string,
    collectionSlug?: string,
  ): Promise<string | null> {
    if (!collectionSlug) return null;

    const collection = await this.prisma.collection.findUnique({
      where: { scholarId_slug: { scholarId, slug: collectionSlug } },
      select: { id: true },
    });

    return collection?.id ?? null;
  }

  private toViewDto(record: SeriesViewRecord): SeriesViewDto {
    return {
      id: record.id,
      scholarId: record.scholarId,
      collectionId: record.collectionId ?? undefined,
      slug: record.slug,
      title: record.title,
      description: record.description ?? undefined,
      coverImageUrl: record.coverImageUrl ?? undefined,
      language: record.language ?? undefined,
      status: record.status,
      orderIndex: record.orderIndex ?? undefined,
      deletedAt: record.deletedAt?.toISOString(),
      deleteAfterAt: record.deleteAfterAt?.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
    };
  }
}
