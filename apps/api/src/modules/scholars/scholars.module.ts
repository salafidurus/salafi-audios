import { Module } from '@nestjs/common';
import { ScholarsController } from './scholars.controller';
import { ScholarsService } from './scholars.service';
import { ScholarsRepository } from './scholars.repo';

@Module({
  controllers: [ScholarsController],
  providers: [ScholarsService, ScholarsRepository],
  exports: [ScholarsService, ScholarsRepository],
})
export class ScholarsModule {}
