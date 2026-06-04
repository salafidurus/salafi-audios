import { Module, forwardRef } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { TelegramMonitor } from "./telegram.monitor";
import { SessionsModule } from "../sessions/sessions.module";
import { ChannelsModule } from "../channels/channels.module";

@Module({
  imports: [forwardRef(() => SessionsModule), forwardRef(() => ChannelsModule)],
  providers: [TelegramService, TelegramMonitor],
  exports: [TelegramService],
})
export class TelegramModule {}
