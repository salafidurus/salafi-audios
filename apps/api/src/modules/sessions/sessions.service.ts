import { Injectable, Logger } from '@nestjs/common';
import { LiveSessionStatus } from '@sd/core-db';
import { LiveService } from '../live/live.service';
import { SessionsRepository } from './sessions.repo';

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
    private readonly liveService: LiveService,
  ) {}

  async upsertFromTelegram(
    channelId: string,
    data: TelegramPollData,
  ): Promise<void> {
    const existing = await this.repo.findLatestLiveSession(channelId);
    let session: { id: string } | undefined;

    if (data.isLive) {
      if (existing?.status === 'live') {
        session = await this.repo.updateStatus(existing.id, 'live', {
          viewerCount: data.viewerCount,
        });
      } else if (existing?.status === 'scheduled') {
        session = await this.repo.updateStatus(existing.id, 'live', {
          startedAt: new Date(),
          viewerCount: data.viewerCount,
        });
      } else {
        session = await this.repo.createSession({
          channelId,
          status: 'live' as LiveSessionStatus,
          title: data.title,
          telegramMsgId: data.telegramMsgId,
          startedAt: new Date(),
        });
      }
    } else if (existing?.status === 'live') {
      session = await this.repo.updateStatus(existing.id, 'ended', {
        endedAt: new Date(),
      });
    }

    if (session) {
      await this.notifyLive(session.id);
    }
  }

  async startSession(
    channelId: string,
    title?: string,
    telegramMsgId?: string,
  ) {
    this.logger.log(`Starting live session for channel ${channelId}`);
    const session = await this.repo.createSession({
      channelId,
      status: 'live' as LiveSessionStatus,
      title,
      startedAt: new Date(),
      telegramMsgId,
    });
    await this.notifyLive(session.id);
    return session;
  }

  async endSession(sessionId: string, viewerCount?: number) {
    this.logger.log(`Ending session ${sessionId}`);
    const session = await this.repo.updateStatus(
      sessionId,
      'ended' as LiveSessionStatus,
      { endedAt: new Date(), viewerCount },
    );
    await this.notifyLive(session.id);
    return session;
  }

  async scheduleSession(channelId: string, scheduledAt: Date, title?: string) {
    const session = await this.repo.createSession({
      channelId,
      status: 'scheduled' as LiveSessionStatus,
      title,
      scheduledAt,
    });
    await this.notifyLive(session.id);
    return session;
  }

  async getLiveSessionsForChannel(channelId: string) {
    return this.repo.findByChannelAndStatus(
      channelId,
      'live' as LiveSessionStatus,
    );
  }

  private async notifyLive(sessionId: string): Promise<void> {
    try {
      const session = await this.liveService.getSessionPublic(sessionId);
      if (session) this.liveService.emitSessionUpdate(session);
    } catch (err) {
      this.logger.error(`Failed to emit session update for ${sessionId}`, err);
    }
  }
}
