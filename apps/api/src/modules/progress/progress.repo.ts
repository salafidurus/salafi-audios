import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import type {
  ProgressSyncItemDto,
  LectureProgressDto,
} from '@sd/core-contracts';

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(userId: string): Promise<LectureProgressDto[]> {
    const progressRecords = await this.prisma.userLectureProgress.findMany({
      where: { userId },
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

    // Raw SQL is required because Prisma's upsert does not support conditional SET clauses.
    // Strategy: last-write-wins by comparing updatedAt timestamps.
    // The client sends its local updatedAt from the offline outbox; the backend only
    // overwrites if the client's record is newer than what is stored — resolving conflicts
    // deterministically without requiring a separate conflict-resolution round-trip.
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
}
