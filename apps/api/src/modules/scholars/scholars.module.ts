import { Module } from '@nestjs/common';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsController } from './scholars.controller';
import { ScholarRepository } from './scholars.repo';
import { ScholarService } from './scholars.service';

@Module({
  imports: [RecommendationsModule],
  controllers: [ScholarsController, AdminScholarsController],
  providers: [ScholarRepository, ScholarService],
  exports: [ScholarService, ScholarRepository],
})
export class ScholarsModule {}
