import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Status, AnalyticsSource } from '@sd/db';
import { PlatformStatsDto } from './dto/platform-stats.dto';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

const EVENT_WEIGHTS: Record<string, number> = {
  view: 1,
  play: 2,
  complete: 4,
  save: 3,
  share: 5,
};

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(input: CreateAnalyticsEventDto): Promise<void> {
    const weight = EVENT_WEIGHTS[input.eventType] ?? 1;

    await this.prisma.analyticsEvent.create({
      data: {
        contentKind: input.contentKind,
        contentId: input.contentId,
        eventType: input.eventType,
        weight,
        source: input.source ?? AnalyticsSource.web,
      },
    });
  }

  async getPlatformStats(): Promise<PlatformStatsDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalScholars, totalLectures, lecturesPublishedLast30Days] =
      await Promise.all([
        // Count active scholars
        this.prisma.scholar.count({
          where: { isActive: true },
        }),

        // Count published lectures
        this.prisma.lecture.count({
          where: { status: Status.published },
        }),

        // Count lectures published in last 30 days
        this.prisma.lecture.count({
          where: {
            status: Status.published,
            publishedAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),
      ]);

    return {
      totalScholars,
      totalLectures,
      lecturesPublishedLast30Days,
    };
  }
}
