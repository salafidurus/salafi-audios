import { HealthModule } from '@/core/health/health.module';
import { ConfigModule } from '@/shared/config/config.module';
import { DbModule } from '@/shared/db/db.module';
import { AppLoggerModule } from '@/shared/logger/logger.module';
import { AppThrottlerModule } from '@/shared/security/throttler.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScholarsModule } from './modules/scholars/scholars.module';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    AppLoggerModule,
    AppThrottlerModule,
    DbModule,
    ScholarsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
