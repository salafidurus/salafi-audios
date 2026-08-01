import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.DISABLE_THROTTLER ? 1000 : config.NODE_ENV === 'test' ? 1000 : 60_000,
          limit: config.DISABLE_THROTTLER ? 10000 : config.NODE_ENV === 'test' ? 2 : 100,
        },
      ],
    }),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
