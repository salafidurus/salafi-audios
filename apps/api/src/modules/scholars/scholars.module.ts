import { Module } from '@nestjs/common';
import { ScholarRepository } from './scholars.repo';
import { ScholarService } from './scholars.service';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';

@Module({
  controllers: [ScholarsController, AdminScholarsController],
  providers: [ScholarRepository, ScholarService],
  exports: [ScholarService, ScholarRepository],
})
export class ScholarsModule {}
