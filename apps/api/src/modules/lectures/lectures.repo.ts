import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Status } from '@sd/core-db';
import type { LectureDetailDto } from '@sd/core-contracts';

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
}
