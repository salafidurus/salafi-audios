import { HealthModule } from '@/core/health/health.module';
import { AudioAssetsModule } from '@/modules/audio-assets/audio-assets.module';
import { CollectionTopicsModule } from '@/modules/collection-topics/collection-topics.module';
import { CollectionsModule } from '@/modules/collections/collections.module';
import { LectureTopicsModule } from '@/modules/lecture-topics/lecture-topics.module';
import { LecturesModule } from '@/modules/lectures/lectures.module';
import { ScholarsModule } from '@/modules/scholars/scholars.module';
import { SeriesTopicsModule } from '@/modules/series-topics/series-topics.module';
import { SeriesModule } from '@/modules/series/series.module';
import { TopicsModule } from '@/modules/topics/topics.module';
import { ConfigModule } from '@/shared/config/config.module';
import { DbModule } from '@/shared/db/db.module';
import { AppLoggerModule } from '@/shared/logger/logger.module';
import { AppThrottlerModule } from '@/shared/security/throttler.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './modules/catalog/catalog.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // Setup Modules
    ConfigModule,
    HealthModule,
    AppLoggerModule,
    AppThrottlerModule,
    DbModule,

    // Main Content Modules
    ScholarsModule,
    CollectionsModule,
    SeriesModule,
    LecturesModule,
    AudioAssetsModule,
    CatalogModule,
    RecommendationsModule,
    AnalyticsModule,

    // Topics Modules
    TopicsModule,
    LectureTopicsModule,
    SeriesTopicsModule,
    CollectionTopicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
