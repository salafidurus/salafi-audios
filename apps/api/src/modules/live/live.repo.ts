import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import type { Prisma, LiveSessionStatus } from '@sd/core-db';

const sessionPublicSelect = {
  id: true,
  status: true,
  title: true,
  scheduledAt: true,
  startedAt: true,
  endedAt: true,
  updatedAt: true,
  channel: {
    select: {
      displayName: true,
      telegramSlug: true,
      scholar: {
        select: {
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class LiveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(since?: Date) {
    const where: Prisma.LiveSessionWhereInput = {
      status: 'live' satisfies LiveSessionStatus,
    };
    if (since) where.updatedAt = { gt: since };
    return this.prisma.liveSession.findMany({
      where,
      select: sessionPublicSelect,
      orderBy: { startedAt: 'desc' },
    });
  }

  async findUpcoming(since?: Date) {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const where: Prisma.LiveSessionWhereInput = {
      status: 'scheduled' satisfies LiveSessionStatus,
      scheduledAt: { lte: sevenDaysFromNow },
    };
    if (since) where.updatedAt = { gt: since };
    return this.prisma.liveSession.findMany({
      where,
      select: sessionPublicSelect,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findEnded(since?: Date) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const where: Prisma.LiveSessionWhereInput = {
      status: 'ended' satisfies LiveSessionStatus,
      endedAt: { gte: twentyFourHoursAgo },
    };
    if (since) where.updatedAt = { gt: since };
    return this.prisma.liveSession.findMany({
      where,
      select: sessionPublicSelect,
      orderBy: { endedAt: 'desc' },
    });
  }

  async findDeletedFromActive(since: Date): Promise<string[]> {
    const sessions = await this.prisma.liveSession.findMany({
      where: {
        updatedAt: { gt: since },
        status: { not: 'live' satisfies LiveSessionStatus },
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }

  async findDeletedFromUpcoming(since: Date): Promise<string[]> {
    const sessions = await this.prisma.liveSession.findMany({
      where: {
        updatedAt: { gt: since },
        status: { not: 'scheduled' satisfies LiveSessionStatus },
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }

  async findDeletedFromEnded(since: Date): Promise<string[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sessions = await this.prisma.liveSession.findMany({
      where: {
        status: 'ended' satisfies LiveSessionStatus,
        endedAt: { lt: twentyFourHoursAgo },
        updatedAt: { gt: since },
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }

  async findSessionById(id: string) {
    return this.prisma.liveSession.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
  }

  async updateSessionStatus(id: string, status: LiveSessionStatus) {
    const now = new Date();
    const data: Prisma.LiveSessionUpdateInput = { status };

    if (status === 'live') data.startedAt = now;
    if (status === 'ended') data.endedAt = now;

    return this.prisma.liveSession.update({
      where: { id },
      data,
    });
  }
}
