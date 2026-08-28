import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthModule } from './core/health/health.module';
import { ConfigModule } from './core/config/config.module';
import { DbModule } from './core/db/db.module';
import { AppLoggerModule } from './core/logger/logger.module';
import { AppThrottlerModule } from './core/security/throttler.module';
import { RedisModule } from './core/redis/redis.module';
import { RedisService } from './core/redis/redis.service';

import { AuthModule } from './core/auth/auth.module';
import { AuthGuard } from './core/auth/auth.guard';
import { PolicyGuard } from './core/auth/policy.guard';
import { AccountModule } from './core/account/account.module';
import { SitemapModule } from './core/sitemap/sitemap.module';

import { SearchModule } from './modules/search/search.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ScholarsModule } from './modules/scholars/scholars.module';
import { MyLibraryModule } from './modules/my-library/my-library.module';
import { AudioModule } from './modules/audio/audio.module';
import { MediaModule } from './modules/media/media.module';
import { ListingModule } from './modules/listing/listing.module';
import { LocaleInterceptor } from './shared/interceptors/locale.interceptor';
import { LocaleMiddleware } from './shared/i18n/locale.middleware';
import { CacheInvalidationInterceptor } from './shared/interceptors/cache-invalidation.interceptor';

import { ThrottlerGuard } from '@nestjs/throttler';

/** Root NestJS module composing the API application and its infrastructure dependencies. */
@Module({
  imports: [
    ConfigModule,
    RedisModule,
    ScheduleModule.forRoot(),
    HealthModule,
    AppLoggerModule,
    AppThrottlerModule,
    DbModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [RedisService],
      useFactory: (redis: RedisService) => ({
        ttl: 300_000,
        stores: redis.enabled ? [redis.createCacheStore()] : undefined,
      }),
    }),
    AuthModule,
    AccountModule,
    SitemapModule,
    SearchModule,
    TopicsModule,
    ScholarsModule,
    MyLibraryModule,
    AudioModule,
    MediaModule,
    ListingModule,
  ],
  providers: [
    ThrottlerGuard,
    { provide: APP_INTERCEPTOR, useClass: CacheInvalidationInterceptor },
    { provide: APP_GUARD, useExisting: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PolicyGuard },
    { provide: APP_INTERCEPTOR, useClass: LocaleInterceptor },
  ],
})
/** NestJS app module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LocaleMiddleware).forRoutes('*');
  }
}
