import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Status } from '@sd/core-db';
import type {
  ScholarChipDto,
  ContentSuggestionDto,
  RecentProgressDto,
} from '@sd/core-contracts';

@Injectable()
export class HomeRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getScholars(): Promise<ScholarChipDto[]> {
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { isKibar: 'desc' }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      imageUrl: r.imageUrl,
    }));
  }

  async getSuggestions(): Promise<ContentSuggestionDto[]> {
    const records = await this.prisma.lecture.findMany({
      where: {
        status: Status.published,
        deletedAt: null,
        scholar: { isActive: true },
      },
      include: {
        scholar: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    return records.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      kind: 'lecture' as const,
      scholarName: r.scholar.name,
      scholarSlug: r.scholar.slug,
      thumbnailUrl: null,
      durationSeconds: r.durationSeconds,
    }));
  }

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    const record = await this.prisma.userLectureProgress.findFirst({
      where: {
        userId,
        isCompleted: false,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationSeconds: true,
            scholar: { select: { name: true } },
          },
        },
      },
    });

    if (!record) return null;

    return {
      lectureId: record.lecture.id,
      lectureTitle: record.lecture.title,
      lectureSlug: record.lecture.slug,
      scholarName: record.lecture.scholar.name,
      durationSeconds: record.lecture.durationSeconds ?? 0,
      positionSeconds: record.positionSeconds,
    };
  }
}
