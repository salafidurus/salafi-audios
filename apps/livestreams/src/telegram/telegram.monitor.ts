import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { SessionsService } from "../sessions/sessions.service";
import { ChannelsService } from "../channels/channels.service";

@Injectable()
export class TelegramMonitor implements OnModuleInit {
  private readonly logger = new Logger(TelegramMonitor.name);

  constructor(
    private readonly telegram: TelegramService,
    private readonly sessions: SessionsService,
    private readonly channels: ChannelsService,
  ) {}

  async onModuleInit() {
    if (!this.telegram.isConnected()) {
      this.logger.warn("Telegram not connected — monitor not starting");
      return;
    }

    this.logger.log("Starting Telegram channel monitor");
    this.startPolling();
  }

  private startPolling() {
    // Poll active channels every 60 seconds for live session changes
    setInterval(() => this.pollChannels(), 60_000);
    // Initial poll
    this.pollChannels();
  }

  private async pollChannels() {
    try {
      const activeChannels = await this.channels.listActive();
      for (const channel of activeChannels) {
        await this.checkChannel(channel);
      }
    } catch (error) {
      this.logger.error("Error polling channels", error);
    }
  }

  private async checkChannel(channel: { id: string; telegramId: string }) {
    // Placeholder — actual implementation would use gramjs to check
    // for group call status, new messages with schedule announcements, etc.
    this.logger.debug(`Checking channel ${channel.telegramId}`);
  }
}
