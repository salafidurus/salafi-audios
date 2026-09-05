import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
/** Registers the API-owned rate-limit guard for every application module. */
export class AppThrottlerModule {}
