/** Configures the API's global rate-limit guard and its configuration dependency. */
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
/** Registers the global rate-limit guard and its configuration dependency for API requests. */
export class AppThrottlerModule {}
