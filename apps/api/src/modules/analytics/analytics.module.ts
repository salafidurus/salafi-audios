import { Module } from '@nestjs/common';
import { DbModule } from '../../core/db/db.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';
import { AnalyticsDispatchRepository } from './analytics-dispatch.repository';
import { AnalyticsDispatchService } from './analytics-dispatch.service';
import { MixpanelAdapter } from './mixpanel.adapter';

/** analytics application module responsible for analytics.module behavior at the backend boundary. */
@Module({
  imports: [DbModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsRepository,
    AnalyticsDispatchRepository,
    AnalyticsDispatchService,
    MixpanelAdapter,
  ],
  exports: [AnalyticsDispatchRepository],
})
/** NestJS analytics module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AnalyticsModule {}
