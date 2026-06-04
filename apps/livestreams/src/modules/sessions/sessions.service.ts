import { Injectable, Logger } from "@nestjs/common";
import { SessionsRepository } from "./sessions.repo";
import { LiveSessionStatus } from "@sd/core-db";
import { LiveConfigService } from "../../shared/config/config.service";

export interface TelegramPollData {
  isLive: boolean;
  telegramMsgId?: string;
  viewerCount?: number;
  title?: string;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly repo: SessionsRepository,
    private readonly config: LiveConfigService,
  ) {}

  /**
   * Called by TelegramMonitor every poll cycle.
   * Reconciles DB state with Telegram live status for a given channel.
   */
  async upsertFromTelegram(channelId: string, data: TelegramPollData): Promise<void> {
    const existing = await this.repo.findLatestLiveSession(channelId);
    let session: { id: string } | undefined;

    if (data.isLive) {
      if (existing?.status === "live") {
        session = await this.repo.updateStatus(existing.id, "live", {
          viewerCount: data.viewerCount,
        });
      } else if (existing?.status === "scheduled") {
        session = await this.repo.updateStatus(existing.id, "live", {
          startedAt: new Date(),
          viewerCount: data.viewerCount,
        });
      } else {
        session = await this.repo.createSession({
          channelId,
          status: "live" as LiveSessionStatus,
          title: data.title,
          telegramMsgId: data.telegramMsgId,
          startedAt: new Date(),
        });
      }
    } else if (existing?.status === "live") {
      session = await this.repo.updateStatus(existing.id, "ended", { endedAt: new Date() });
    }

    if (session) {
      await this.notifyApi(session.id);
    }
  }

  async startSession(channelId: string, title?: string, telegramMsgId?: string) {
    this.logger.log(`Starting live session for channel ${channelId}`);
    const session = await this.repo.createSession({
      channelId,
      status: "live" as LiveSessionStatus,
      title,
      startedAt: new Date(),
      telegramMsgId,
    });
    await this.notifyApi(session.id);
    return session;
  }

  async endSession(sessionId: string, viewerCount?: number) {
    this.logger.log(`Ending session ${sessionId}`);
    const session = await this.repo.updateStatus(sessionId, "ended" as LiveSessionStatus, {
      endedAt: new Date(),
      viewerCount,
    });
    await this.notifyApi(session.id);
    return session;
  }

  async scheduleSession(channelId: string, scheduledAt: Date, title?: string) {
    const session = await this.repo.createSession({
      channelId,
      status: "scheduled" as LiveSessionStatus,
      title,
      scheduledAt,
    });
    await this.notifyApi(session.id);
    return session;
  }

  async getLiveSessionsForChannel(channelId: string) {
    return this.repo.findByChannelAndStatus(channelId, "live" as LiveSessionStatus);
  }

  private async notifyApi(sessionId: string) {
    try {
      const url = `${this.config.apiUrl}/live/sessions/sync-notify`;
      const token = this.config.livestreamSecret;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(
          `Failed to notify API for session ${sessionId}: status=${res.status} error=${text}`,
        );
      } else {
        this.logger.debug(`Successfully notified API for session ${sessionId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to notify API for session ${sessionId}: ${error}`);
    }
  }
}
