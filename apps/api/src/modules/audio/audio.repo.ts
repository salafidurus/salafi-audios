import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import type { ProgressSyncItemDto, AudioProgressDto } from '@sd/core-contracts';

@Injectable()
export class AudioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(userId: string, since?: Date): Promise<AudioProgressDto[]> {
    const progressRecords = await this.prisma.userListingProgress.findMany({
      where: {
        userId,
        ...(since ? { updatedAt: { gt: since } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
          select: {
            durationSeconds: true,
          },
        },
      },
    });

    return progressRecords.map((record) => ({
      listingId: record.listingId,
      positionSeconds: record.positionSeconds,
      durationSeconds: record.listing.durationSeconds || 0,
      completedAt: record.isCompleted ? record.updatedAt.toISOString() : undefined,
      updatedAt: record.updatedAt.toISOString(),
    }));
  }

  async upsertProgress(
    userId: string,
    listingId: string,
    positionSeconds: number,
    durationSeconds?: number,
    isCompleted?: boolean,
  ): Promise<void> {
    await this.prisma.userListingProgress.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: {
        userId,
        listingId,
        positionSeconds,
        isCompleted: isCompleted ?? false,
      },
      update: {
        positionSeconds,
        ...(isCompleted !== undefined ? { isCompleted } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async bulkSync(userId: string, items: ProgressSyncItemDto[]): Promise<void> {
    if (items.length === 0) return;

    const operations = items.map((item) => {
      const clientUpdatedAt = new Date(item.updatedAt);
      const isCompleted = !!item.completedAt;

      return this.prisma.$executeRaw`
        INSERT INTO "UserListingProgress" ("userId", "listingId", "positionSeconds", "isCompleted", "updatedAt")
        VALUES (${userId}, ${item.listingId}::uuid, ${item.positionSeconds}, ${isCompleted}, ${clientUpdatedAt})
        ON CONFLICT ("userId", "listingId")
        DO UPDATE SET
          "positionSeconds" = CASE
            WHEN "UserListingProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserListingProgress"."positionSeconds"
            ELSE ${item.positionSeconds}
          END,
          "isCompleted" = CASE
            WHEN "UserListingProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserListingProgress"."isCompleted"
            ELSE ${isCompleted}
          END,
          "updatedAt" = CASE
            WHEN "UserListingProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserListingProgress"."updatedAt"
            ELSE ${clientUpdatedAt}
          END
      `;
    });

    await this.prisma.$transaction(operations);
  }

  async findListingById(listingId: string) {
    return this.prisma.listing.findUnique({
      where: { id: listingId },
    });
  }

  async findPrimaryAsset(listingId: string) {
    return this.prisma.audioAsset.findFirst({
      where: { listingId, isPrimary: true },
    });
  }

  async findFirstAsset(listingId: string) {
    return this.prisma.audioAsset.findFirst({
      where: { listingId },
    });
  }
}
