import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';
import { Status } from '@sd/core-db';
import type { ProgressSyncItemDto, AudioProgressDto } from '@sd/core-contracts';

const COMPLETION_PERCENT_THRESHOLD = 0.95;
const COMPLETION_TAIL_SECONDS = 30;

/**
 * Server-side completion safety net: a position counts as "complete" once it
 * reaches 95% of the track, OR is within the last 30 seconds — whichever comes
 * first. The tail branch only applies once the track is longer than 30s, so a
 * sub-30s clip can't trivially "complete" at position 0.
 */
export function isPositionCompleted(
  positionSeconds: number,
  durationSeconds?: number | null,
): boolean {
  if (!durationSeconds || durationSeconds <= 0) return false;

  return (
    positionSeconds >= durationSeconds * COMPLETION_PERCENT_THRESHOLD ||
    (durationSeconds > COMPLETION_TAIL_SECONDS &&
      positionSeconds >= durationSeconds - COMPLETION_TAIL_SECONDS)
  );
}

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

  /** Returns false when `slug` doesn't resolve to a real Listing (no row written). */
  async upsertProgress(
    userId: string,
    slug: string,
    positionSeconds: number,
    _durationSeconds?: number,
    isCompleted?: boolean,
  ): Promise<boolean> {
    const listing = await this.prisma.listing.findFirst({
      where: { slug },
      select: { id: true, durationSeconds: true },
    });
    if (!listing) return false;

    const listingId = listing.id;
    const existing = await this.prisma.userListingProgress.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { isCompleted: true },
    });

    const derivedCompleted =
      isCompleted ?? isPositionCompleted(positionSeconds, listing.durationSeconds);
    // Monotonic: once completed, a later sync can never un-complete it.
    const finalCompleted = existing?.isCompleted ? true : derivedCompleted;

    await this.prisma.userListingProgress.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: {
        userId,
        listingId,
        positionSeconds,
        isCompleted: finalCompleted,
      },
      update: {
        positionSeconds,
        isCompleted: finalCompleted,
        updatedAt: new Date(),
      },
    });
    return true;
  }

  async bulkSync(userId: string, items: ProgressSyncItemDto[]): Promise<void> {
    if (items.length === 0) return;

    // Duration comes from each Listing's own canonical record, never trusted
    // from the client, to keep the completion derivation below consistent.
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: items.map((item) => item.listingId) } },
      select: { id: true, durationSeconds: true },
    });
    const durationById = new Map(listings.map((listing) => [listing.id, listing.durationSeconds]));

    const operations = items.map((item) => {
      const clientUpdatedAt = new Date(item.updatedAt);
      const isCompleted =
        !!item.completedAt ||
        isPositionCompleted(item.positionSeconds, durationById.get(item.listingId));

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
          "isCompleted" = "UserListingProgress"."isCompleted" OR (
            CASE
              WHEN "UserListingProgress"."updatedAt" > ${clientUpdatedAt}
              THEN "UserListingProgress"."isCompleted"
              ELSE ${isCompleted}
            END
          ),
          "updatedAt" = CASE
            WHEN "UserListingProgress"."updatedAt" > ${clientUpdatedAt}
            THEN "UserListingProgress"."updatedAt"
            ELSE ${clientUpdatedAt}
          END
      `;
    });

    await this.prisma.$transaction(operations);
  }

  async findListingById(slug: string) {
    return this.prisma.listing.findFirst({
      where: { slug },
      select: { id: true, durationSeconds: true }, // Only fetch fields needed for stream response
    });
  }

  async findPrimaryAsset(listingId: string) {
    const directPrimary = await this.prisma.audioAsset.findFirst({
      where: { listingId, isPrimary: true },
      select: {
        url: true,
        durationSeconds: true,
        format: true,
      },
    });

    if (directPrimary) return directPrimary;

    return this.prisma.audioAsset.findFirst({
      where: {
        listing: {
          parentId: listingId,
          status: Status.published,
          deletedAt: null,
        },
        isPrimary: true,
      },
      orderBy: [{ listing: { orderIndex: 'asc' } }, { listing: { createdAt: 'asc' } }],
      select: {
        url: true,
        durationSeconds: true,
        format: true,
      },
    });
  }

  async findFirstAsset(listingId: string) {
    const directAsset = await this.prisma.audioAsset.findFirst({
      where: { listingId },
      select: {
        url: true,
        durationSeconds: true,
        format: true,
      },
    });

    if (directAsset) return directAsset;

    return this.prisma.audioAsset.findFirst({
      where: {
        listing: {
          parentId: listingId,
          status: Status.published,
          deletedAt: null,
        },
      },
      orderBy: [{ listing: { orderIndex: 'asc' } }, { listing: { createdAt: 'asc' } }],
      select: {
        url: true,
        durationSeconds: true,
        format: true,
      },
    });
  }
}
