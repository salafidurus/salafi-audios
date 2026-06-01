import { Module } from '@nestjs/common';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsTranslationsController } from './scholars-translations.controller';
import { SeriesTranslationsController } from './series-translations.controller';
import { CollectionTranslationsController } from './collection-translations.controller';
import { ScholarsService } from './scholars.service';
import { ScholarsRepository } from './scholars.repo';

@Module({
  controllers: [
    ScholarsController,
    AdminScholarsController,
    ScholarsTranslationsController,
    SeriesTranslationsController,
    CollectionTranslationsController,
  ],
  providers: [ScholarsService, ScholarsRepository],
  exports: [ScholarsService, ScholarsRepository],
})
export class ScholarsModule {}
