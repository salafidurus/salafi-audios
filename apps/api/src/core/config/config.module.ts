import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

export { ConfigService };

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
