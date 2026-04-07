import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import type { ProgressSyncItemDto } from '@sd/core-contracts';

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
