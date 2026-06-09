import { Module } from '@nestjs/common';
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
import { LecturesModule } from './modules/lectures/lectures.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { LiveModule } from './modules/live/live.module';
import { LibraryModule } from './modules/library/library.module';
import { AudioModule } from './modules/audio/audio.module';
import { HomeModule } from './modules/home/home.module';
import { FeedModule } from './modules/feed/feed.module';
import { MediaModule } from './modules/media/media.module';
import { LocaleInterceptor } from './shared/interceptors/locale.interceptor';

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
    LecturesModule,
    ScholarsModule,
    LiveModule,
    LibraryModule,
    AudioModule,
    HomeModule,
    FeedModule,
    MediaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LocaleInterceptor },
  ],
})
export class AppModule {}
