import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repo';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { PlatformStatsDto } from './dto/platform-stats.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  async recordEvent(dto: CreateAnalyticsEventDto): Promise<void> {
    await this.repo.recordEvent(dto);
  }

  async getPlatformStats(): Promise<PlatformStatsDto> {
    return this.repo.getPlatformStats();
  }
}
