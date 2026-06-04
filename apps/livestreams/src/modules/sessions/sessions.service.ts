import { Injectable, Logger } from "@nestjs/common";
import { SessionsRepository } from "./sessions.repo";
import { LiveSessionStatus } from "@sd/core-db";

export interface TelegramPollData {
  isLive: boolean;
  telegramMsgId?: string;
  viewerCount?: number;
  title?: string;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly repo: SessionsRepository) {}

  /**
   * Called by TelegramMonitor every poll cycle.
   * Reconciles DB state with Telegram live status for a given channel.
   */
  async upsertFromTelegram(channelId: string, data: TelegramPollData): Promise<void> {
    const existing = await this.repo.findLatestLiveSession(channelId);

    if (data.isLive) {
      if (existing?.status === "live") {
        await this.repo.updateStatus(existing.id, "live", {
          viewerCount: data.viewerCount,
        });
      } else if (existing?.status === "scheduled") {
        await this.repo.updateStatus(existing.id, "live", {
          startedAt: new Date(),
          viewerCount: data.viewerCount,
        });
      } else {
        await this.repo.createSession({
          channelId,
          status: "live" as LiveSessionStatus,
          title: data.title,
          telegramMsgId: data.telegramMsgId,
          startedAt: new Date(),
        });
      }
    } else if (existing?.status === "live") {
      await this.repo.updateStatus(existing.id, "ended", { endedAt: new Date() });
    }
  }

  async startSession(channelId: string, title?: string, telegramMsgId?: string) {
    this.logger.log(`Starting live session for channel ${channelId}`);
    return this.repo.createSession({
      channelId,
      status: "live" as LiveSessionStatus,
      title,
      startedAt: new Date(),
      telegramMsgId,
    });
  }

  async endSession(sessionId: string, viewerCount?: number) {
    this.logger.log(`Ending session ${sessionId}`);
    return this.repo.updateStatus(sessionId, "ended" as LiveSessionStatus, {
      endedAt: new Date(),
      viewerCount,
    });
  }

  async scheduleSession(channelId: string, scheduledAt: Date, title?: string) {
    return this.repo.createSession({
      channelId,
      status: "scheduled" as LiveSessionStatus,
      title,
      scheduledAt,
    });
  }

  async getLiveSessionsForChannel(channelId: string) {
    return this.repo.findByChannelAndStatus(channelId, "live" as LiveSessionStatus);
  }
}
