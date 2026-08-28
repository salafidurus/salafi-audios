import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { AdminTopicsController } from './admin-topics.controller';
import { TopicsTranslationsController } from './topics-translations.controller';
import { TopicsService } from './topics.service';
import { TopicsRepository } from './topics.repo';

/** topics application module responsible for topics.module behavior at the backend boundary. */
@Module({
  controllers: [TopicsController, AdminTopicsController, TopicsTranslationsController],
  providers: [TopicsService, TopicsRepository],
  exports: [TopicsService, TopicsRepository],
})
/** NestJS topics module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class TopicsModule {}
