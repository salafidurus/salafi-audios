import { Module } from '@nestjs/common';
import { SeriesByCollectionController } from './series-by-collection.controller';
import { SeriesController } from './series.controller';
import { SeriesRepository } from './series.repo';
import { SeriesService } from './series.service';
import { SeriesPublicController } from './series-public.controller';

@Module({
  controllers: [
    SeriesController,
    SeriesByCollectionController,
    SeriesPublicController,
  ],
  providers: [SeriesService, SeriesRepository],
  exports: [SeriesService, SeriesRepository],
})
export class SeriesModule {}
