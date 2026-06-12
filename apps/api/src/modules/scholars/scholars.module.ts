import { Module } from '@nestjs/common';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsTranslationsController } from './scholars-translations.controller';
import { SeriesTranslationsController } from './series-translations.controller';
import { CollectionTranslationsController } from './collection-translations.controller';
import { AdminSeriesController } from './admin-series.controller';
import { AdminCollectionsController } from './admin-collections.controller';
import { ScholarsService } from './scholars.service';
import { ScholarsRepository } from './scholars.repo';

@Module({
  controllers: [
    ScholarsController,
    AdminScholarsController,
    ScholarsTranslationsController,
    SeriesTranslationsController,
    CollectionTranslationsController,
    AdminSeriesController,
    AdminCollectionsController,
  ],
  providers: [ScholarsService, ScholarsRepository],
  exports: [ScholarsService, ScholarsRepository],
})
export class ScholarsModule {}
