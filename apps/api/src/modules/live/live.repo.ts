import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

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
    const where: any = { status: 'live' as any };
    if (since) where.updatedAt = { gt: since };
    return this.prisma.liveSession.findMany({
      where,
      select: sessionPublicSelect,
      orderBy: { startedAt: 'desc' },
    });
  }

  async findUpcoming(since?: Date) {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const where: any = {
      status: 'scheduled' as any,
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
    const where: any = {
      status: 'ended' as any,
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
        status: { not: 'live' as any },
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }

  async findDeletedFromUpcoming(since: Date): Promise<string[]> {
    const sessions = await this.prisma.liveSession.findMany({
      where: {
        updatedAt: { gt: since },
        status: { not: 'scheduled' as any },
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }

  async findDeletedFromEnded(since: Date): Promise<string[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sessions = await this.prisma.liveSession.findMany({
      where: {
        status: 'ended' as any,
        endedAt: { lt: twentyFourHoursAgo },
        updatedAt: { gt: since },
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }
}
