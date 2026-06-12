import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import type { ProgressSyncItemDto, AudioProgressDto } from '@sd/core-contracts';

@Injectable()
export class AudioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(
    userId: string,
    since?: Date,
  ): Promise<AudioProgressDto[]> {
    const progressRecords = await this.prisma.userLectureProgress.findMany({
      where: {
        userId,
        ...(since ? { updatedAt: { gt: since } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        lecture: {
          select: {
            durationSeconds: true,
          },
        },
      },
    });

    return progressRecords.map((record) => ({
      lectureId: record.lectureId,
      positionSeconds: record.positionSeconds,
      durationSeconds: record.lecture.durationSeconds || 0,
      completedAt: record.isCompleted
        ? record.updatedAt.toISOString()
        : undefined,
      updatedAt: record.updatedAt.toISOString(),
    }));
  }

  async upsertProgress(
    userId: string,
    lectureId: string,
    positionSeconds: number,
    durationSeconds?: number,
    isCompleted?: boolean,
  ): Promise<void> {
    await this.prisma.userLectureProgress.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      create: {
        userId,
        lectureId,
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
        INSERT INTO "UserLectureProgress" ("userId", "lectureId", "positionSeconds", "isCompleted", "updatedAt")
        VALUES (${userId}, ${item.lectureId}, ${item.positionSeconds}, ${isCompleted}, ${clientUpdatedAt})
        ON CONFLICT ("userId", "lectureId")
        DO UPDATE SET
          "positionSeconds" = CASE
            WHEN "UserLectureProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserLectureProgress"."positionSeconds"
            ELSE ${item.positionSeconds}
          END,
          "isCompleted" = CASE
            WHEN "UserLectureProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserLectureProgress"."isCompleted"
            ELSE ${isCompleted}
          END,
          "updatedAt" = CASE
            WHEN "UserLectureProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserLectureProgress"."updatedAt"
            ELSE ${clientUpdatedAt}
          END
      `;
    });

    await this.prisma.$transaction(operations);
  }

  async findLectureById(lectureId: string) {
    return this.prisma.lecture.findUnique({
      where: { id: lectureId },
    });
  }

  async findPrimaryAsset(lectureId: string) {
    return this.prisma.audioAsset.findFirst({
      where: { lectureId, isPrimary: true },
    });
  }

  async findFirstAsset(lectureId: string) {
    return this.prisma.audioAsset.findFirst({
      where: { lectureId },
    });
  }
}
