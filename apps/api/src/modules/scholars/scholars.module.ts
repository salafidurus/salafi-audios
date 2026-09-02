import { Module } from '@nestjs/common';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsTranslationsController } from './scholars-translations.controller';
import { ScholarsService } from './scholars.service';
import { ScholarsRepository } from './scholars.repo';

/** scholars application module responsible for scholars.module behavior at the backend boundary. */
@Module({
  controllers: [ScholarsController, AdminScholarsController, ScholarsTranslationsController],
  providers: [ScholarsService, ScholarsRepository],
  exports: [ScholarsService, ScholarsRepository],
})
/** NestJS scholars module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ScholarsModule {}
