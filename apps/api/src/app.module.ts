import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

import { HealthModule } from './core/health/health.module';
import { ConfigModule } from './shared/config/config.module';
import { DbModule } from './shared/db/db.module';
import { AppLoggerModule } from './shared/logger/logger.module';
import { AppThrottlerModule } from './shared/security/throttler.module';

import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { PermissionGuard } from './shared/guards/permission.guard';
import { AccountModule } from './modules/account/account.module';
import { SearchModule } from './modules/search/search.module';
import { TopicsModule } from './modules/topics/topics.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { LibraryModule } from './modules/library/library.module';
import { AudioModule } from './modules/audio/audio.module';
import { HomeModule } from './modules/home/home.module';
import { ExploreModule } from './modules/explore/explore.module';
import { MediaModule } from './modules/media/media.module';
import { ListingModule } from './modules/listing/listing.module';
import { SitemapModule } from './modules/sitemap/sitemap.module';
import { LocaleInterceptor } from './shared/interceptors/locale.interceptor';
import { LocaleMiddleware } from './shared/i18n/locale.middleware';

import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    AppLoggerModule,
    AppThrottlerModule,
    DbModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default TTL (in milliseconds)
      max: 100, // Maximum number of items in cache
    }),
    AuthModule,
    AccountModule,
    SearchModule,
    TopicsModule,
    PermissionsModule,
    ScholarsModule,
    LibraryModule,
    AudioModule,
    HomeModule,
    ExploreModule,
    MediaModule,
    ListingModule,
    SitemapModule,
  ],
  providers: [
    ThrottlerGuard,
    { provide: APP_GUARD, useExisting: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_INTERCEPTOR, useClass: LocaleInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LocaleMiddleware).forRoutes('*');
  }
}
