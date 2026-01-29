import { Module } from '@nestjs/common';
import { SeriesTopicsController } from './series-topics.controller';
import { SeriesTopicsService } from './series-topics.service';
import { SeriesTopicsRepository } from './series-topics.repo';

@Module({
  controllers: [SeriesTopicsController],
  providers: [SeriesTopicsService, SeriesTopicsRepository],
  exports: [SeriesTopicsService, SeriesTopicsRepository],
})
export class SeriesTopicsModule {}
