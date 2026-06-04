import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthModule } from "./core/health/health.module";
import { ChannelsModule } from "./channels/channels.module";
import { SessionsModule } from "./sessions/sessions.module";
import { TelegramModule } from "./telegram/telegram.module";
import { LiveConfigModule } from "./shared/config/config.module";
import { DbModule } from "./shared/db/db.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    LiveConfigModule,
    DbModule,
    HealthModule,
    TelegramModule,
    ChannelsModule,
    SessionsModule,
  ],
})
export class AppModule {}
