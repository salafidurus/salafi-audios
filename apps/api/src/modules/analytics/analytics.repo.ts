import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { AnalyticsEventType, AnalyticsSource } from '@sd/db';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

const EVENT_WEIGHTS: Record<AnalyticsEventType, number> = {
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
    const weight = EVENT_WEIGHTS[input.eventType];

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
}
