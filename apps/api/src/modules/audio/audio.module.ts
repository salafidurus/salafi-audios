import { Module } from '@nestjs/common';
import { DbModule } from '../../core/db/db.module';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { AudioRepository } from './audio.repo';
import { AudioProgressFlushJob } from './audio-progress-flush.job';
import { AnalyticsModule } from '../analytics/analytics.module';

/** audio application module responsible for audio.module behavior at the backend boundary. */
@Module({
  imports: [DbModule, AnalyticsModule],
  controllers: [AudioController],
  providers: [AudioService, AudioRepository, AudioProgressFlushJob],
  exports: [AudioService],
})
/** NestJS audio module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AudioModule {}
