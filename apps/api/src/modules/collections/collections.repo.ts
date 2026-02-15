import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma, Status } from '@sd/db';
import { CollectionViewDto } from './dto/collection-view.dto';
import { UpsertCollectionDto } from './dto/upsert-collection.dto';

const collectionViewSelect = {
  id: true,
  scholarId: true,
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
} satisfies Prisma.CollectionSelect;

type CollectionViewRecord = Prisma.CollectionGetPayload<{
  select: typeof collectionViewSelect;
}>;

@Injectable()
export class CollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedByScholarSlug(
    scholarSlug: string,
  ): Promise<CollectionViewDto[]> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });

    if (!scholar) return [];

    const records = await this.prisma.collection.findMany({
      where: {
        scholarId: scholar.id,
        deletedAt: null,
        status: Status.published,
      },
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      select: collectionViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  async findPublishedById(id: string): Promise<CollectionViewDto | null> {
    const record = await this.prisma.collection.findFirst({
      where: { id, deletedAt: null, status: Status.published },
      select: collectionViewSelect,
    });
    return record ? this.toViewDto(record) : null;
  }

  async findPublishedByScholarSlugAndSlug(
    scholarSlug: string,
    slug: string,
  ): Promise<CollectionViewDto | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });

    if (!scholar) return null;

    const record = await this.prisma.collection.findFirst({
      where: {
        scholarId: scholar.id,
        slug,
        deletedAt: null,
        status: Status.published,
      },
      select: collectionViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  async upsertByScholarSlug(
    scholarSlug: string,
    input: UpsertCollectionDto,
  ): Promise<CollectionViewDto | null> {
    const scholar = await this.prisma.scholar.findUnique({
      where: { slug: scholarSlug },
      select: { id: true },
    });

    if (!scholar) return null;

    const record = await this.prisma.collection.upsert({
      where: { scholarId_slug: { scholarId: scholar.id, slug: input.slug } },
      select: collectionViewSelect,
      create: {
        scholarId: scholar.id,
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

  // ------------------------
  // Mapping (repo-owned)
  // ------------------------
  private toViewDto(record: CollectionViewRecord): CollectionViewDto {
    return {
      id: record.id,
      scholarId: record.scholarId,
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
