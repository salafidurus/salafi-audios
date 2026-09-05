/** Configures the API's global rate-limit guard and its configuration dependency. */
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { RateLimitGuard } from './rate-limit.guard';

/** Defines the global NestJS module that provides the API rate-limit guard. */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
/** Registers the global rate-limit guard and its configuration dependency for API requests. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the module declaration from its TSDoc.
export class AppThrottlerModule {}
