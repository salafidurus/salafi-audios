import { Module } from '@nestjs/common';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repo';

@Module({
  controllers: [LecturesController],
  providers: [LecturesService, LecturesRepository],
  exports: [LecturesService, LecturesRepository],
})
export class LecturesModule {}
