import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

/** Core API throttler.module module providing shared backend infrastructure and authority-boundary services. */
type AppThrottlerConfig = {
  throttlers: { ttl: number; limit: number }[];
  storage?: ReturnType<RedisService['createThrottlerStorage']>;
};

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => {
        const throttlerConfig: AppThrottlerConfig = {
          throttlers: [
            {
              ttl: config.DISABLE_THROTTLER ? 1000 : config.NODE_ENV === 'test' ? 1000 : 60_000,
              limit: config.DISABLE_THROTTLER ? 10000 : config.NODE_ENV === 'test' ? 2 : 100,
            },
          ],
        };
        if (redis.enabled) {
          throttlerConfig.storage = redis.createThrottlerStorage();
        }
        return throttlerConfig;
      },
    }),
  ],
  exports: [ThrottlerModule],
})
/** NestJS app throttler module service or controller coordinating the API boundary for this responsibility. */
export class AppThrottlerModule {}
