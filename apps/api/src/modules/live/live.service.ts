import { Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';
import type {
  LiveSessionDeltaDto,
  LiveSessionPublicDto,
  LiveSessionStatus,
  LivestreamChannelDto,
  CreateLivestreamChannelDto,
  UpdateLivestreamChannelDto,
  CreateLiveSessionDto,
  UpdateLiveSessionDto,
} from '@sd/core-contracts';
import { LiveRepository } from './live.repo';
import type { Prisma } from '@sd/core-db';

type LiveSessionPublicRecord = Prisma.LiveSessionGetPayload<{
  select: {
    id: true;
    status: true;
    title: true;
    scheduledAt: true;
    startedAt: true;
    endedAt: true;
    updatedAt: true;
    channel: {
      select: {
        displayName: true;
        telegramSlug: true;
        scholar: {
          select: {
            name: true;
            slug: true;
            imageUrl: true;
          };
        };
      };
    };
  };
}>;

type LiveChannelRecord = Prisma.LivestreamChannelGetPayload<{
  select: {
    id: true;
    displayName: true;
    telegramSlug: true;
    language: true;
    isActive: true;
    createdAt: true;
    updatedAt: true;
    scholar: {
      select: {
        name: true;
        slug: true;
        imageUrl: true;
      };
    };
  };
}>;

@Injectable()
export class LiveService {
  private readonly updateSubject$ = new Subject<LiveSessionPublicDto>();
  readonly updates$ = this.updateSubject$.asObservable();

  constructor(private readonly repo: LiveRepository) {}

  emitSessionUpdate(session: LiveSessionPublicDto) {
    this.updateSubject$.next(session);
  }

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

  async updateSessionStatus(
    id: string,
    status: LiveSessionStatus,
  ): Promise<LiveSessionPublicDto> {
    const session = await this.repo.findSessionById(id);
    if (!session) {
      throw new NotFoundException(`Live session "${id}" not found`);
    }
    const updated = await this.repo.updateSessionStatus(id, status);
    const dto = this.mapSession(updated);
    this.emitSessionUpdate(dto);
    return dto;
  }

  // Channel methods
  async getChannels(): Promise<LivestreamChannelDto[]> {
    const channels = await this.repo.findChannels();
    return channels.map(this.mapChannel);
  }

  async getChannelBySlug(slug: string): Promise<LivestreamChannelDto> {
    const channel = await this.repo.findChannelBySlug(slug);
    if (!channel) {
      throw new NotFoundException(
        `Livestream channel with slug "${slug}" not found`,
      );
    }
    return this.mapChannel(channel);
  }

  async createChannel(
    data: CreateLivestreamChannelDto,
  ): Promise<LivestreamChannelDto> {
    const channel = await this.repo.createChannel({
      telegramId: data.telegramId,
      telegramSlug: data.telegramSlug,
      displayName: data.displayName,
      language: data.language,
      scholar: data.scholarId ? { connect: { id: data.scholarId } } : undefined,
    });
    return this.mapChannel(channel);
  }

  async updateChannel(
    id: string,
    data: UpdateLivestreamChannelDto,
  ): Promise<LivestreamChannelDto> {
    const existing = await this.repo.findChannelById(id);
    if (!existing) {
      throw new NotFoundException(`Livestream channel "${id}" not found`);
    }

    const updateData: Prisma.LivestreamChannelUpdateInput = {};
    if (data.telegramSlug !== undefined)
      updateData.telegramSlug = data.telegramSlug;
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.scholarId !== undefined) {
      updateData.scholar = data.scholarId
        ? { connect: { id: data.scholarId } }
        : { disconnect: true };
    }

    const channel = await this.repo.updateChannel(id, updateData);
    return this.mapChannel(channel);
  }

  async createSession(
    data: CreateLiveSessionDto,
  ): Promise<LiveSessionPublicDto> {
    const session = await this.repo.createSession({
      channel: { connect: { id: data.channelId } },
      title: data.title,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      telegramMsgId: data.telegramMsgId,
    });
    const dto = this.mapSession(session);
    this.emitSessionUpdate(dto);
    return dto;
  }

  async updateSession(
    id: string,
    data: UpdateLiveSessionDto,
  ): Promise<LiveSessionPublicDto> {
    const existing = await this.repo.findSessionById(id);
    if (!existing) {
      throw new NotFoundException(`Live session "${id}" not found`);
    }

    const updateData: Prisma.LiveSessionUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.scheduledAt !== undefined)
      updateData.scheduledAt = new Date(data.scheduledAt);
    if (data.status !== undefined) {
      updateData.status = data.status;
      const now = new Date();
      if (data.status === 'live') updateData.startedAt = now;
      if (data.status === 'ended') updateData.endedAt = now;
    }
    if (data.telegramMsgId !== undefined)
      updateData.telegramMsgId = data.telegramMsgId;
    if (data.viewerCount !== undefined)
      updateData.viewerCount = data.viewerCount;

    const session = await this.repo.updateSession(id, updateData);
    const dto = this.mapSession(session);
    this.emitSessionUpdate(dto);
    return dto;
  }

  async getSessionPublic(id: string): Promise<LiveSessionPublicDto | null> {
    const session = await this.repo.findSessionPublicById(id);
    if (!session) return null;
    return this.mapSession(session);
  }

  private mapSession(session: LiveSessionPublicRecord): LiveSessionPublicDto {
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

  private mapChannel(channel: LiveChannelRecord): LivestreamChannelDto {
    return {
      id: channel.id,
      displayName: channel.displayName,
      telegramSlug: channel.telegramSlug ?? undefined,
      language: channel.language ?? undefined,
      isActive: channel.isActive,
      scholarName: channel.scholar?.name ?? undefined,
      scholarSlug: channel.scholar?.slug ?? undefined,
      scholarImageUrl: channel.scholar?.imageUrl ?? undefined,
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
    };
  }
}
