import { Module } from '@nestjs/common';
import { LecturesBySeriesController } from './lectures-by-series.controller';
import { LecturesController } from './lectures.controller';
import { LecturesRepository } from './lectures.repo';
import { LecturesService } from './lectures.service';
import { LecturesPublicController } from './lectures-public.controller';

@Module({
  controllers: [
    LecturesController,
    LecturesBySeriesController,
    LecturesPublicController,
  ],
  providers: [LecturesService, LecturesRepository],
  exports: [LecturesService, LecturesRepository],
})
export class LecturesModule {}
