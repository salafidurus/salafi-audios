import { Injectable, NotFoundException } from '@nestjs/common';
import { LiveRepository } from './live.repo';

type LiveSessionPublicDto = {
  id: string;
  status: string;
  channelDisplayName: string;
  telegramSlug?: string;
  scholarName?: string;
  scholarSlug?: string;
  scholarImageUrl?: string;
  title?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  updatedAt: string;
};

type LiveSessionDeltaDto = {
  sessions: LiveSessionPublicDto[];
  deletedIds: string[];
  fetchedAt: string;
};

@Injectable()
export class LiveService {
  constructor(private readonly repo: LiveRepository) {}

  async getActive(since?: string): Promise<LiveSessionDeltaDto> {
    const sinceDate = since ? new Date(since) : undefined;
    const sessions = await this.repo.findActive(sinceDate);
    const deletedIds = sinceDate
      ? await this.repo.findDeletedFromActive(sinceDate)
      : [];
    return {
      sessions: sessions.map(this.mapSession),
      deletedIds,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getUpcoming(since?: string): Promise<LiveSessionDeltaDto> {
    const sinceDate = since ? new Date(since) : undefined;
    const sessions = await this.repo.findUpcoming(sinceDate);
    const deletedIds = sinceDate
      ? await this.repo.findDeletedFromUpcoming(sinceDate)
      : [];
    return {
      sessions: sessions.map(this.mapSession),
      deletedIds,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getEnded(since?: string): Promise<LiveSessionDeltaDto> {
    const sinceDate = since ? new Date(since) : undefined;
    const sessions = await this.repo.findEnded(sinceDate);
    const deletedIds = sinceDate
      ? await this.repo.findDeletedFromEnded(sinceDate)
      : [];
    return {
      sessions: sessions.map(this.mapSession),
      deletedIds,
      fetchedAt: new Date().toISOString(),
    };
  }

  async updateSessionStatus(id: string, status: string) {
    const session = await this.repo.findSessionById(id);
    if (!session) {
      throw new NotFoundException(`Live session "${id}" not found`);
    }
    return this.repo.updateSessionStatus(id, status);
  }

  private mapSession(session: any): LiveSessionPublicDto {
    return {
      id: session.id,
      status: session.status,
      channelDisplayName: session.channel.displayName,
      telegramSlug: session.channel.telegramSlug ?? undefined,
      scholarName: session.channel.scholar?.name ?? undefined,
      scholarSlug: session.channel.scholar?.slug ?? undefined,
      scholarImageUrl: session.channel.scholar?.imageUrl ?? undefined,
      title: session.title ?? undefined,
      scheduledAt: session.scheduledAt?.toISOString() ?? undefined,
      startedAt: session.startedAt?.toISOString() ?? undefined,
      endedAt: session.endedAt?.toISOString() ?? undefined,
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
