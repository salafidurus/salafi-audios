import { Module } from '@nestjs/common';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsService } from './scholars.service';
import { ScholarsRepository } from './scholars.repo';

@Module({
  controllers: [ScholarsController, AdminScholarsController],
  providers: [ScholarsService, ScholarsRepository],
  exports: [ScholarsService, ScholarsRepository],
})
export class ScholarsModule {}
