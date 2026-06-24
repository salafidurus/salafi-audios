import { Injectable } from '@nestjs/common';
import { LiveSessionStatus } from '@sd/core-db';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestLiveSession(channelId: string): Promise<{
    id: string;
    status: LiveSessionStatus;
    startedAt: Date | null;
  } | null> {
    return this.prisma.liveSession.findFirst({
      where: { channelId, status: { in: ['live', 'scheduled'] } },
      select: { id: true, status: true, startedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByChannelAndStatus(channelId: string, status: LiveSessionStatus) {
    return this.prisma.liveSession.findMany({
      where: { channelId, status },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createSession(data: {
    channelId: string;
    status?: LiveSessionStatus;
    title?: string;
    scheduledAt?: Date;
    startedAt?: Date;
    telegramMsgId?: string;
  }) {
    return this.prisma.liveSession.create({ data });
  }

  async updateStatus(
    id: string,
    status: LiveSessionStatus,
    extra?: { startedAt?: Date; endedAt?: Date; viewerCount?: number },
  ) {
    return this.prisma.liveSession.update({
      where: { id },
      data: { status, ...extra },
    });
  }
}
