import { Module } from '@nestjs/common';
import { LecturesBySeriesController } from './lectures-by-series.controller';
import { LecturesByScholarController } from './lectures-by-scholar.controller';
import { LecturesController } from './lectures.controller';
import { LecturesRepository } from './lectures.repo';
import { LecturesService } from './lectures.service';
import { LecturesPublicController } from './lectures-public.controller';

@Module({
  controllers: [
    LecturesController,
    LecturesBySeriesController,
    LecturesByScholarController,
    LecturesPublicController,
  ],
  providers: [LecturesService, LecturesRepository],
  exports: [LecturesService, LecturesRepository],
})
export class LecturesModule {}
