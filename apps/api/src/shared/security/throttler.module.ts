import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl:
          process.env.DISABLE_THROTTLER === 'true'
            ? 1000
            : process.env.NODE_ENV === 'test'
              ? 1000
              : 60_000,
        limit:
          process.env.DISABLE_THROTTLER === 'true'
            ? 10000
            : process.env.NODE_ENV === 'test'
              ? 2
              : 100,
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
