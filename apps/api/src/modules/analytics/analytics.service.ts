import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repo';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  async recordEvent(dto: CreateAnalyticsEventDto): Promise<void> {
    await this.repo.recordEvent(dto);
  }
}
