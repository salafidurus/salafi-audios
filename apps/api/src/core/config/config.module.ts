import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

/** Core API config.module module providing shared backend infrastructure and authority-boundary services. */
export { ConfigService };

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
/** NestJS config module service or controller coordinating the API boundary for this responsibility. */
export class ConfigModule {}
