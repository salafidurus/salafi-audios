import { Global, Module } from '@nestjs/common';

import { RedisService } from './redis.service';

/** Core API redis.module module providing shared backend infrastructure and authority-boundary services. */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
/** NestJS redis module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class RedisModule {}
