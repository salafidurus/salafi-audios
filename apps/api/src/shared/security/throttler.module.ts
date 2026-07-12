import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: process.env.NODE_ENV === 'test' ? 1000 : 60_000, // 1 second for test, 60 seconds otherwise
        limit: process.env.NODE_ENV === 'test' ? 2 : 100, // 2 req/sec for test, 100 req/min otherwise
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
