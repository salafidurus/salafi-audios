import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { TelegramClient } from 'telegram';
import { ConfigService } from '../../shared/config/config.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private client: TelegramClient | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      const apiId = this.config.TELEGRAM_API_ID;
      const apiHash = this.config.TELEGRAM_API_HASH;
      const sessionStr = this.config.TELEGRAM_SESSION;

      if (!apiId || !apiHash || !sessionStr) {
        this.logger.warn('Telegram credentials not configured — monitor disabled');
        return;
      }

      const { TelegramClient } = await import('telegram');
      const { StringSession } = await import('telegram/sessions');

      const session = new StringSession(sessionStr);
      const client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
      });
      this.client = client;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.start({ botAuthToken: undefined } as any);
      this.logger.log('Telegram client connected');
    } catch (error) {
      this.logger.error('Failed to connect Telegram client', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('Telegram client disconnected');
    }
  }

  getClient() {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
