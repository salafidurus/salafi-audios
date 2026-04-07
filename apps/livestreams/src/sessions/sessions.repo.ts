import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/db/prisma.service";
import { LiveSessionStatus } from "@sd/core-db";

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByChannelAndStatus(channelId: string, status: LiveSessionStatus) {
    return this.prisma.liveSession.findMany({
      where: { channelId, status },
      orderBy: { updatedAt: "desc" },
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
