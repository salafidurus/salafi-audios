import { Injectable, Logger } from "@nestjs/common";
import { SessionsRepository } from "./sessions.repo";
import { LiveSessionStatus } from "@sd/core-db";

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly repo: SessionsRepository) {}

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
