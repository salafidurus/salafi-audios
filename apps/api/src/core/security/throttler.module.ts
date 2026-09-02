import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
/** Provides the API-owned rate-limit guard and named policy boundary. */
export class AppThrottlerModule {}
