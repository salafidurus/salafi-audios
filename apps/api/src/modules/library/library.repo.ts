import { Injectable } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import type { LibraryItemDto } from '@sd/core-contracts';
import { PrismaService } from '../../shared/db/prisma.service';

const DEFAULT_PAGE_SIZE = 20;

const lectureInclude = {
  lecture: {
    select: {
      id: true,
      title: true,
      slug: true,
      durationSeconds: true,
      scholar: { select: { id: true, slug: true, name: true } },
      series: { select: { title: true } },
    },
  },
} satisfies Prisma.UserLectureProgressInclude;

const favoriteLectureInclude = {
  lecture: {
    select: {
      id: true,
      title: true,
      slug: true,
      durationSeconds: true,
      scholar: { select: { id: true, slug: true, name: true } },
      series: { select: { title: true } },
    },
  },
} satisfies Prisma.FavoriteLectureInclude;

@Injectable()
export class LibraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInProgress(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;

    const records = await this.prisma.userLectureProgress.findMany({
      where: {
        userId,
        isCompleted: false,
        positionSeconds: { gt: 0 },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_lectureId: { userId, lectureId: cursor } },
            skip: 1,
          }
        : {}),
      include: lectureInclude,
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.progressToDto(r),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.lectureId : undefined;

    return { items, nextCursor };
  }

  async findCompleted(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;

    const records = await this.prisma.userLectureProgress.findMany({
      where: { userId, isCompleted: true },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_lectureId: { userId, lectureId: cursor } },
            skip: 1,
          }
        : {}),
      include: lectureInclude,
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.progressToDto(r),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.lectureId : undefined;

    return { items, nextCursor };
  }

  async findSaved(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;

    const records = await this.prisma.favoriteLecture.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_lectureId: { userId, lectureId: cursor } },
            skip: 1,
          }
        : {}),
      include: favoriteLectureInclude,
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.favoriteToDto(r),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.lectureId : undefined;

    return { items, nextCursor };
  }

  async saveLecture(userId: string, lectureId: string): Promise<void> {
    await this.prisma.favoriteLecture.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      create: { userId, lectureId },
      update: {},
    });
  }

  async unsaveLecture(userId: string, lectureId: string): Promise<void> {
    await this.prisma.favoriteLecture.deleteMany({
      where: { userId, lectureId },
    });
  }

  async bulkSave(userId: string, lectureIds: string[]): Promise<void> {
    if (lectureIds.length === 0) return;

    const operations = lectureIds.map((lectureId) =>
      this.prisma.favoriteLecture.upsert({
        where: { userId_lectureId: { userId, lectureId } },
        create: { userId, lectureId },
        update: {},
      }),
    );
    await this.prisma.$transaction(operations);
  }

  private progressToDto(
    r: Prisma.UserLectureProgressGetPayload<{ include: typeof lectureInclude }>,
  ): LibraryItemDto {
    return {
      id: `${r.userId}-${r.lectureId}`,
      lectureId: r.lectureId,
      lectureTitle: r.lecture.title,
      lectureSlug: r.lecture.slug,
      scholarId: r.lecture.scholar.id,
      scholarSlug: r.lecture.scholar.slug,
      scholarName: r.lecture.scholar.name,
      seriesTitle: r.lecture.series?.title ?? undefined,
      durationSeconds: r.lecture.durationSeconds ?? undefined,
      progressSeconds: r.positionSeconds,
      completedAt: r.isCompleted ? r.updatedAt.toISOString() : undefined,
    };
  }

  private favoriteToDto(
    r: Prisma.FavoriteLectureGetPayload<{
      include: typeof favoriteLectureInclude;
    }>,
  ): LibraryItemDto {
    return {
      id: `${r.userId}-${r.lectureId}`,
      lectureId: r.lectureId,
      lectureTitle: r.lecture.title,
      lectureSlug: r.lecture.slug,
      scholarId: r.lecture.scholar.id,
      scholarSlug: r.lecture.scholar.slug,
      scholarName: r.lecture.scholar.name,
      seriesTitle: r.lecture.series?.title ?? undefined,
      durationSeconds: r.lecture.durationSeconds ?? undefined,
      savedAt: r.createdAt.toISOString(),
    };
  }
}
