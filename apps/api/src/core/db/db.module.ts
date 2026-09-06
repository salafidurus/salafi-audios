import { Global, Module } from '@nestjs/common';
import { PrimaryDbService } from './primary-db.service';
import { AnalyticsDbService } from './analytics-db.service';

/** Core API db.module module providing shared backend infrastructure and authority-boundary services. */
@Global()
@Module({
  providers: [PrimaryDbService, AnalyticsDbService],
  exports: [PrimaryDbService, AnalyticsDbService],
})
/** NestJS db module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class DbModule {}
