import { Module } from '@nestjs/common';
import { AdminLecturesController } from './admin-lectures.controller';
import { LecturesController } from './lectures.controller';
import { LecturesTranslationsController } from './lectures-translations.controller';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repo';

@Module({
  controllers: [LecturesController, AdminLecturesController, LecturesTranslationsController],
  providers: [LecturesService, LecturesRepository],
  exports: [LecturesService, LecturesRepository],
})
export class LecturesModule {}
