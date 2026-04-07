import { Module } from '@nestjs/common';
import { AdminLecturesController } from './admin-lectures.controller';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repo';

@Module({
  controllers: [LecturesController, AdminLecturesController],
  providers: [LecturesService, LecturesRepository],
  exports: [LecturesService, LecturesRepository],
})
export class LecturesModule {}
