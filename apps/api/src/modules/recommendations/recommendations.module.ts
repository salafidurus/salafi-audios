import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsRepository } from './recommendations.repo';
import { RecommendationsService } from './recommendations.service';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationsRepository],
  exports: [RecommendationsService, RecommendationsRepository],
})
export class RecommendationsModule {}
