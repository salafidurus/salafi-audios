import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { TelegramService } from "./telegram.service";
import { SessionsService } from "../sessions/sessions.service";
import { ChannelsService } from "../channels/channels.service";

@Injectable()
export class TelegramMonitor {
  private readonly logger = new Logger(TelegramMonitor.name);

  constructor(
    private readonly telegram: TelegramService,
    private readonly sessions: SessionsService,
    private readonly channels: ChannelsService,
  ) {}

  @Cron("*/30 * * * * *")
  async pollChannels() {
    if (!this.telegram.isConnected()) {
      return;
    }

    try {
      const activeChannels = await this.channels.listActive();
      await Promise.all(activeChannels.map((ch) => this.checkChannel(ch)));
    } catch (error) {
      this.logger.error("Error polling Telegram channels", error);
    }
  }

  private async checkChannel(channel: {
    id: string;
    telegramId: string;
    telegramSlug: string | null;
  }) {
    const client = this.telegram.getClient();
    if (!client) return;

    try {
      const { Api } = await import("telegram");
      const identifier = channel.telegramSlug ?? channel.telegramId;

      const result = await client.invoke(new Api.channels.GetFullChannel({ channel: identifier }));

      const fullChat = result.fullChat as unknown as Record<string, unknown>;
      const call = fullChat["call"];
      const isLive = call != null;
      const viewerCount =
        isLive && typeof fullChat["participantsCount"] === "number"
          ? (fullChat["participantsCount"] as number)
          : undefined;

      await this.sessions.upsertFromTelegram(channel.id, { isLive, viewerCount });
      this.logger.debug(`Channel ${identifier}: isLive=${isLive}`);
    } catch (error) {
      this.logger.warn(`Failed to check channel ${channel.telegramId}: ${error}`);
    }
  }
}
