import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma, Status } from '@sd/db';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';

const topicSelect = {
  id: true,
  slug: true,
  name: true,
} satisfies Prisma.TopicSelect;

const seriesTopicSelect = {
  createdAt: true,
  topic: { select: topicSelect },
} satisfies Prisma.SeriesTopicSelect;

type SeriesTopicRecord = Prisma.SeriesTopicGetPayload<{
  select: typeof seriesTopicSelect;
}>;

@Injectable()
export class SeriesTopicsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByScholarAndSeriesSlug(
    scholarSlug: string,
    seriesSlug: string,
  ): Promise<LectureTopicViewDto[] | null> {
    const series = await this.findSeriesIdBySlugs(scholarSlug, seriesSlug);
    if (!series) return null;

    const rows = await this.prisma.seriesTopic.findMany({
      where: { seriesId: series.id },
      orderBy: { createdAt: 'asc' },
      select: seriesTopicSelect,
    });

    return rows.map((r) => this.toViewDto(r));
  }

  async attach(
    scholarSlug: string,
    seriesSlug: string,
    topicSlug: string,
  ): Promise<LectureTopicViewDto | null> {
    const series = await this.findSeriesIdBySlugs(scholarSlug, seriesSlug);
    if (!series) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) return null;

    const row = await this.prisma.seriesTopic.upsert({
      where: {
        seriesId_topicId: {
          seriesId: series.id,
          topicId: topic.id,
        },
      },
      create: {
        seriesId: series.id,
        topicId: topic.id,
      },
      update: {},
      select: seriesTopicSelect,
    });

    return this.toViewDto(row);
  }

  async detach(
    scholarSlug: string,
    seriesSlug: string,
    topicSlug: string,
  ): Promise<boolean | null> {
    const series = await this.findSeriesIdBySlugs(scholarSlug, seriesSlug);
    if (!series) return null;

    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) return null;

    await this.prisma.seriesTopic.deleteMany({
      where: { seriesId: series.id, topicId: topic.id },
    });

    return true;
  }

  // ------------------------
  // Helpers
  // ------------------------

  private async findSeriesIdBySlugs(
    scholarSlug: string,
    seriesSlug: string,
  ): Promise<{ id: string } | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return null;

    // Align with your public “published catalog” endpoints:
    // - deletedAt null
    // - status published
    const series = await this.prisma.series.findFirst({
      where: {
        scholarId: scholar.id,
        slug: seriesSlug,
        deletedAt: null,
        status: Status.published,
      },
      select: { id: true },
    });

    return series ?? null;
  }

  private toViewDto(r: SeriesTopicRecord): LectureTopicViewDto {
    return {
      topic: {
        id: r.topic.id,
        slug: r.topic.slug,
        name: r.topic.name,
      },
      attachedAt: r.createdAt.toISOString(),
    };
  }
}
