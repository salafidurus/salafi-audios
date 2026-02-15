import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsRepository } from './recommendations.repo';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationsRepository],
})
export class RecommendationsModule {}
