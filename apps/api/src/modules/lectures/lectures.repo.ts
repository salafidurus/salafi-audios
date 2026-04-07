import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type { LectureDetailDto, RelatedLectureDto, AdminLectureUpdateDto } from '@sd/core-contracts';

@Injectable()
export class LecturesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDetailById(id: string): Promise<LectureDetailDto | null> {
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
        scholar: {
          select: {
            id: true,
            slug: true,
            name: true,
            imageUrl: true,
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

    const seriesContext = await this.resolveSeriesContext(
      lecture.seriesId,
      lecture.id,
    );

    const primaryAudio = lecture.audioAssets[0] ?? null;

    return {
      id: lecture.id,
      slug: lecture.slug,
      title: lecture.title,
      description: lecture.description ?? undefined,
      language: lecture.language ?? undefined,
      durationSeconds: lecture.durationSeconds ?? undefined,
      publishedAt: lecture.publishedAt?.toISOString(),
      scholar: {
        id: lecture.scholar.id,
        slug: lecture.scholar.slug,
        name: lecture.scholar.name,
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
      },
    });

    const currentIndex = siblings.findIndex((s) => s.id === lectureId);
    const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const next =
      currentIndex >= 0 && currentIndex < siblings.length - 1
        ? siblings[currentIndex + 1]
        : null;

    return {
      seriesId: series.id,
      seriesTitle: series.title,
      seriesSlug: series.slug,
      prevLecture: prev
        ? { id: prev.id, slug: prev.slug, title: prev.title }
        : null,
      nextLecture: next
        ? { id: next.id, slug: next.slug, title: next.title }
        : null,
    };
  }

  async findRelated(lectureId: string, limit: number = 6): Promise<RelatedLectureDto[]> {
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
        durationSeconds: true,
        scholarId: true,
        seriesId: true,
        publishedAt: true,
        createdAt: true,
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
            imageUrl: true,
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

    return rankedRelated.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      durationSeconds: r.durationSeconds ?? undefined,
      scholar: {
        id: r.scholar.id,
        slug: r.scholar.slug,
        name: r.scholar.name,
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
    }));
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
}
