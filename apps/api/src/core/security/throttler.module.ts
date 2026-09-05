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
/** Registers the API-owned rate-limit guard for every application module. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AppThrottlerModule {}
