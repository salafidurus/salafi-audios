import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { LiveConfigService } from "../shared/config/config.service";

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private client: any = null;

  constructor(private readonly config: LiveConfigService) {}

  async onModuleInit() {
    const apiId = this.config.telegramApiId;
    const apiHash = this.config.telegramApiHash;
    const sessionStr = this.config.telegramSession;

    if (!apiId || !apiHash) {
      this.logger.warn("Telegram credentials not configured — monitor disabled");
      return;
    }

    try {
      const { TelegramClient } = await import("telegram");
      const { StringSession } = await import("telegram/sessions");

      const session = new StringSession(sessionStr);
      this.client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
      });

      await this.client.start({ botAuthToken: undefined } as any);
      this.logger.log("Telegram client connected");
    } catch (error) {
      this.logger.error("Failed to connect Telegram client", error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log("Telegram client disconnected");
    }
  }

  getClient() {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
