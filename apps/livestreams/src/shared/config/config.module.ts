import { Global, Module } from "@nestjs/common";
import { LiveConfigService } from "./config.service";

@Global()
@Module({
  providers: [LiveConfigService],
  exports: [LiveConfigService],
})
export class LiveConfigModule {}
