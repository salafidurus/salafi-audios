import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { HealthModule } from './core/health/health.module';
import { ConfigModule } from './shared/config/config.module';
import { DbModule } from './shared/db/db.module';
import { AppLoggerModule } from './shared/logger/logger.module';
import { AppThrottlerModule } from './shared/security/throttler.module';

import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { AccountModule } from './modules/account/account.module';
import { SearchModule } from './modules/search/search.module';
import { TopicsModule } from './modules/topics/topics.module';
import { AdminPermissionsModule } from './modules/admin-permissions/admin-permissions.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { LiveModule } from './modules/live/live.module';
import { LibraryModule } from './modules/library/library.module';
import { AudioModule } from './modules/audio/audio.module';
import { HomeModule } from './modules/home/home.module';
import { ExploreModule } from './modules/explore/explore.module';
import { MediaModule } from './modules/media/media.module';
import { ListingModule } from './modules/listing/listing.module';
import { SitemapModule } from './modules/sitemap/sitemap.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from './modules/telegram/telegram.module';
import { LocaleInterceptor } from './shared/interceptors/locale.interceptor';
import { LocaleMiddleware } from './shared/i18n/locale.middleware';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    AppLoggerModule,
    AppThrottlerModule,
    DbModule,
    AuthModule,
    AccountModule,
    SearchModule,
    TopicsModule,
    AdminPermissionsModule,
    ScholarsModule,
    LiveModule,
    LibraryModule,
    AudioModule,
    HomeModule,
    ExploreModule,
    MediaModule,
    ListingModule,
    SitemapModule,
    ScheduleModule.forRoot(),
    TelegramModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LocaleInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LocaleMiddleware).forRoutes('*');
  }
}
