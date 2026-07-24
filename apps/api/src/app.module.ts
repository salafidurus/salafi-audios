import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

import { HealthModule } from './core/health/health.module';
import { ConfigModule } from './core/config/config.module';
import { DbModule } from './core/db/db.module';
import { AppLoggerModule } from './core/logger/logger.module';
import { AppThrottlerModule } from './core/security/throttler.module';

import { AuthModule } from './core/auth/auth.module';
import { AuthGuard } from './core/auth/auth.guard';
import { PermissionGuard } from './core/auth/permission.guard';
import { AccountModule } from './core/account/account.module';
import { SitemapModule } from './core/sitemap/sitemap.module';

import { SearchModule } from './modules/search/search.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { LibraryModule } from './modules/library/library.module';
import { AudioModule } from './modules/audio/audio.module';
import { MediaModule } from './modules/media/media.module';
import { ListingModule } from './modules/listing/listing.module';
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
      max: 1000, // Maximum number of items in cache
    }),
    AuthModule,
    AccountModule,
    SitemapModule,
    SearchModule,
    TopicsModule,
    ScholarsModule,
    LibraryModule,
    AudioModule,
    MediaModule,
    ListingModule,
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
