import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { HealthModule } from './core/health/health.module';
import { ConfigModule } from './shared/config/config.module';
import { DbModule } from './shared/db/db.module';
import { AppLoggerModule } from './shared/logger/logger.module';
import { AppThrottlerModule } from './shared/security/throttler.module';

import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { SearchModule } from './modules/search/search.module';
import { TopicsModule } from './modules/topics/topics.module';
import { AdminPermissionsModule } from './modules/admin-permissions/admin-permissions.module';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    AppLoggerModule,
    AppThrottlerModule,
    DbModule,
    AuthModule,
    SearchModule,
    TopicsModule,
    AdminPermissionsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
