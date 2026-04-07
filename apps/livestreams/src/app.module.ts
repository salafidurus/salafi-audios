import { Module } from "@nestjs/common";
import { DbModule } from "./shared/db/db.module";
import { LiveConfigModule } from "./shared/config/config.module";
import { TelegramModule } from "./telegram/telegram.module";
import { ChannelsModule } from "./channels/channels.module";
import { SessionsModule } from "./sessions/sessions.module";

@Module({
  imports: [LiveConfigModule, DbModule, TelegramModule, ChannelsModule, SessionsModule],
})
export class AppModule {}
