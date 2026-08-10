import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => ({
        throttlers: [
          {
            ttl: config.DISABLE_THROTTLER ? 1000 : config.NODE_ENV === 'test' ? 1000 : 60_000,
            limit: config.DISABLE_THROTTLER ? 10000 : config.NODE_ENV === 'test' ? 2 : 100,
          },
        ],
        ...(redis.enabled ? { storage: redis.createThrottlerStorage() } : {}),
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
