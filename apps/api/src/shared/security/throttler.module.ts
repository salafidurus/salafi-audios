import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 seconds
        limit: 100, // 100 req/min per IP
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
