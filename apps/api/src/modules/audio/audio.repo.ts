import { Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppLoggerService } from '../../core/logger/app-logger.service';
import { PrimaryDbService } from '../../core/db/primary-db.service';
import { ConfigService } from '../../core/config/config.service';
import { RedisService } from '../../core/redis/redis.service';
import { Status } from '@sd/core-db';
import type { Prisma } from '@sd/core-db';
import { publishedListingSlugWhere } from '../../shared/utils/published-listing-slug-where';
import type { ProgressSyncItemDto, AudioProgressDto } from '@sd/core-contracts';
import { z } from 'zod';
import { AnalyticsDispatchRepository } from '../analytics/analytics-dispatch.repository';

/** audio application module responsible for audio.repo behavior at the backend boundary. */
const COMPLETION_PERCENT_THRESHOLD = 0.95;
const COMPLETION_TAIL_SECONDS = 30;

type PendingProgress = {
  /** Documents the version field's API projection semantics and lifecycle meaning. */ version: string;
  /** Documents the userId field's API projection semantics and lifecycle meaning. */ userId: string;
  listingId: string;
  positionSeconds: number;
  isCompleted: boolean;
  /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */ updatedAt: string;
};

type ProgressWrite = Omit<PendingProgress, 'version' | 'updatedAt'> & {
  /** Server-side timestamp used for progress conflict resolution. */
  updatedAt: Date;
};
type ProgressWhere = Prisma.UserListingProgressWhereInput;

const ENQUEUE_PROGRESS_SCRIPT = `
local existing = redis.call('GET', KEYS[1])
local incoming = cjson.decode(ARGV[1])
if existing then
  local previous = cjson.decode(existing)
  if previous.isCompleted == true then incoming.isCompleted = true end
end
redis.call('SET', KEYS[1], cjson.encode(incoming), 'EX', ARGV[3])
redis.call('ZADD', KEYS[2], ARGV[2], ARGV[4])
return 1
`;

const progressMemberSchema = z.object({
  userId: z.string().min(1),
  listingId: z.string().min(1),
});

const pendingProgressSchema = z.object({
  version: z.string().min(1),
  userId: z.string().min(1),
  listingId: z.string().min(1),
  positionSeconds: z.number(),
  isCompleted: z.boolean(),
  updatedAt: z.string().min(1),
}) satisfies z.ZodType<PendingProgress>;

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
/** NestJS audio repository service or controller coordinating the API boundary for this responsibility. */
export class AudioRepository {
  constructor(
    private readonly prisma: PrimaryDbService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService,
    @Optional() private readonly analyticsDispatch?: AnalyticsDispatchRepository,
  ) {
    this.logger.setContext(AudioRepository.name);
  }

  async getUserProgress(userId: string, since?: Date): Promise<AudioProgressDto[]> {
    const where: ProgressWhere = { userId };
    if (since) {
      where.updatedAt = { gt: since };
    }
    const progressRecords = await this.prisma.userListingProgress.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
          select: {
            slug: true,
            durationSeconds: true,
          },
        },
      },
    });

    return progressRecords.map((record) => ({
      listingSlug: record.listing.slug,
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
    const listing = await this.findProgressListingBySlug(slug);
    if (!listing) return false;

    const derivedCompleted =
      isCompleted ?? isPositionCompleted(positionSeconds, listing.durationSeconds);
    const updatedAt = new Date();

    if (!this.redis.enabled) {
      await this.persistProgressImmediately({
        userId,
        listingId: listing.id,
        positionSeconds,
        isCompleted: derivedCompleted,
        updatedAt,
      });
      return true;
    }

    try {
      await this.enqueueProgress({
        userId,
        listingId: listing.id,
        positionSeconds,
        isCompleted: derivedCompleted,
        updatedAt,
      });
    } catch (error) {
      this.logger.warn(
        `Redis progress enqueue failed for ${userId}/${listing.id}; using PostgreSQL fallback: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.persistProgressImmediately({
        userId,
        listingId: listing.id,
        positionSeconds,
        isCompleted: derivedCompleted,
        updatedAt,
      });
    }
    return true;
  }

  async bulkSync(userId: string, items: ProgressSyncItemDto[]): Promise<void> {
    if (items.length === 0) return;

    // Duration comes from each Listing's own canonical record, never trusted
    // from the client, to keep the completion derivation below consistent.
    const where = { slug: { in: items.map((item) => item.listingSlug) } };
    const listings = await this.prisma.listing.findMany({
      where,
      select: { id: true, slug: true, durationSeconds: true },
    });
    const listingByIdentity = new Map(
      listings.flatMap((listing) => [
        [listing.id, listing] as const,
        [listing.slug, listing] as const,
      ]),
    );
    const durationById = new Map(listings.map((listing) => [listing.id, listing.durationSeconds]));

    await this.persistProgressBatch(
      items.flatMap((item) => {
        const listing = listingByIdentity.get(item.listingSlug);
        if (!listing) return [];
        return [
          {
            userId,
            listingId: listing.id,
            positionSeconds: item.positionSeconds,
            isCompleted:
              Boolean(item.completedAt) ||
              isPositionCompleted(item.positionSeconds, durationById.get(listing.id)),
            updatedAt: new Date(item.updatedAt),
          },
        ];
      }),
      durationById,
    );
  }

  async flushBufferedProgress(): Promise<void> {
    if (!this.redis.enabled) return;
    const owner = await this.acquireProgressFlushLock();
    if (!owner) return;

    try {
      const pending = await this.readDueProgress();
      if (pending.length === 0) return;
      await this.persistProgressBatch(
        pending.map((item) => ({
          userId: item.userId,
          listingId: item.listingId,
          positionSeconds: item.positionSeconds,
          isCompleted: item.isCompleted,
          updatedAt: new Date(item.updatedAt),
        })),
      );
      await Promise.all(pending.map((item) => this.removePendingProgressIfVersionMatches(item)));
    } catch (error) {
      this.logger.error(
        `Buffered progress flush failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await this.releaseProgressFlushLock(owner);
    }
  }

  /**
   * Personal-state WRITE path — deliberately NOT the published-only Catalog
   * seam. Progress belongs to the user, not to discovery: a listener who is
   * mid-Track when a Listing is archived (or whose offline outbox flushes
   * after publication changes) must still record progress against any
   * non-deleted Listing. Publication filtering stays on Catalog reads and
   * stream resolution.
   */
  private async findProgressListingBySlug(slug: string): Promise<{
    id: string;
    /** Duration used to expose progress and calculate completion. */
    durationSeconds: number | null;
  } | null> {
    const key = this.progressListingKey(slug);
    const cached = await this.findCachedProgressListing(key, slug);
    if (cached) return cached;

    const listing = await this.prisma.listing.findFirst({
      where: { slug },
      select: { id: true, durationSeconds: true },
    });
    await this.cacheProgressListing(slug, key, listing);
    return listing;
  }

  private async findCachedProgressListing(key: string, slug: string) {
    if (!this.redis.enabled) return null;
    try {
      const cachedId = await this.redis.get(key);
      if (!cachedId) return null;
      const cached = await this.prisma.listing.findUnique({
        where: { id: cachedId },
        select: { id: true, durationSeconds: true },
      });
      if (cached) return cached;
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis listing cache lookup failed for ${slug}; using PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return null;
  }

  private async cacheProgressListing(
    slug: string,
    key: string,
    listing: {
      id: string;
      /** Duration cached alongside the listing identity for progress reads. */
      durationSeconds: number | null;
    } | null,
  ) {
    if (!listing || !this.redis.enabled) return;
    try {
      await this.redis.set(key, listing.id, 'EX', 300);
    } catch (error) {
      this.logger.warn(
        `Redis listing cache write failed for ${slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async persistProgressImmediately(input: ProgressWrite): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.userListingProgress.findUnique({
        where: { userId_listingId: { userId: input.userId, listingId: input.listingId } },
        select: { isCompleted: true },
      });
      const finalCompleted = Boolean(existing?.isCompleted) || input.isCompleted;
      await transaction.userListingProgress.upsert({
        where: { userId_listingId: { userId: input.userId, listingId: input.listingId } },
        create: {
          userId: input.userId,
          listingId: input.listingId,
          positionSeconds: input.positionSeconds,
          isCompleted: finalCompleted,
          updatedAt: input.updatedAt,
        },
        update: {
          positionSeconds: input.positionSeconds,
          isCompleted: finalCompleted,
          updatedAt: input.updatedAt,
        },
      });
      if (!existing?.isCompleted && finalCompleted && this.analyticsDispatch) {
        await this.analyticsDispatch.append(transaction, {
          eventName: 'audio_completed',
          subjectId: input.userId,
          payload: { listing_id: input.listingId },
          occurredAt: input.updatedAt,
        });
      }
    });
  }

  private async enqueueProgress(
    input: Omit<ProgressWrite, 'userId'> & {
      /** Authenticated user owning the queued progress write. */
      userId: string;
    },
  ): Promise<void> {
    const pending: PendingProgress = {
      version: randomUUID(),
      userId: input.userId,
      listingId: input.listingId,
      positionSeconds: input.positionSeconds,
      isCompleted: input.isCompleted,
      updatedAt: input.updatedAt.toISOString(),
    };
    await this.redis.eval(
      ENQUEUE_PROGRESS_SCRIPT,
      2,
      this.progressPendingKey(input.userId, input.listingId),
      this.progressDueKey(),
      JSON.stringify(pending),
      String(Date.now() + this.config.REDIS_PROGRESS_BUFFER_DELAY_MS),
      String(this.config.REDIS_PROGRESS_PENDING_TTL_SECONDS),
      JSON.stringify({ userId: input.userId, listingId: input.listingId }),
    );
  }

  // eslint-disable-next-line complexity -- this batch boundary combines canonical duration, monotonic completion, and intent emission.
  private async persistProgressBatch(
    items: ProgressWrite[],
    knownDurations?: Map<string, number | null>,
  ): Promise<void> {
    if (items.length === 0) return;
    const durationById = knownDurations ?? (await this.loadProgressDurations(items));
    // eslint-disable-next-line complexity -- transaction callback combines canonical duration, monotonic completion, and intent emission.
    await this.prisma.$transaction(async (transaction) => {
      for (const item of items) {
        if (!durationById.has(item.listingId)) continue;
        const completed =
          item.isCompleted ||
          isPositionCompleted(item.positionSeconds, durationById.get(item.listingId));
        // react-doctor-disable-next-line react-doctor/async-await-in-loop -- Ordered reads and writes preserve each progress transition inside one transaction.
        const existing = await transaction.userListingProgress.findUnique({
          where: { userId_listingId: { userId: item.userId, listingId: item.listingId } },
          select: { isCompleted: true },
        });
        await transaction.$executeRaw`
          INSERT INTO "UserListingProgress" ("userId", "listingId", "positionSeconds", "isCompleted", "updatedAt")
          VALUES (${item.userId}, ${item.listingId}::uuid, ${item.positionSeconds}, ${completed}, ${item.updatedAt})
          ON CONFLICT ("userId", "listingId")
          DO UPDATE SET
            "positionSeconds" = CASE WHEN "UserListingProgress"."updatedAt" > ${item.updatedAt} THEN "UserListingProgress"."positionSeconds" ELSE ${item.positionSeconds} END,
            "isCompleted" = "UserListingProgress"."isCompleted" OR ${completed},
            "updatedAt" = CASE WHEN "UserListingProgress"."updatedAt" > ${item.updatedAt} THEN "UserListingProgress"."updatedAt" ELSE ${item.updatedAt} END
        `;
        if (!existing?.isCompleted && completed && this.analyticsDispatch) {
          await this.analyticsDispatch.append(transaction, {
            eventName: 'audio_completed',
            subjectId: item.userId,
            payload: { listing_id: item.listingId },
            occurredAt: item.updatedAt,
          });
        }
      }
    });
  }

  private async loadProgressDurations(items: ProgressWrite[]): Promise<Map<string, number | null>> {
    const listingIds = [...new Set(items.map((item) => item.listingId))];
    const listings = await this.prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, durationSeconds: true },
    });
    return new Map(listings.map((listing) => [listing.id, listing.durationSeconds]));
  }

  private async readDueProgress(): Promise<PendingProgress[]> {
    const members = await this.redis.zrangebyscore(this.progressDueKey(), 0, Date.now(), {
      offset: 0,
      count: 100,
    });
    if (members.length === 0) return [];
    const values = await this.redis.mget(
      members.flatMap((member) => {
        try {
          // SAFETY: members were originally enqueued by this repository with the
          // same `{ userId, listingId }` JSON shape. ZRANGEBYSCORE returns the
          // raw member string, so it must be decoded before schema validation.
          // A malformed member is skipped so one bad entry cannot stall the flush.
          const parsed = progressMemberSchema.parse(JSON.parse(member));
          return [this.progressPendingKey(parsed.userId, parsed.listingId)];
        } catch {
          return [];
        }
      }),
    );
    return values.flatMap((value) => {
      if (!value) return [];
      try {
        // SAFETY: the pending payload is serialized by `enqueueProgress` using
        // the `PendingProgress` contract owned by this repository.
        return [pendingProgressSchema.parse(JSON.parse(value))];
      } catch {
        return [];
      }
    });
  }

  private async acquireProgressFlushLock(): Promise<string | null> {
    const owner = randomUUID();
    const result = await this.redis.set(this.progressFlushLockKey(), owner, 'PX', 25_000, 'NX');
    return result === 'OK' ? owner : null;
  }

  private async releaseProgressFlushLock(owner: string): Promise<void> {
    await this.redis.eval(
      `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`,
      1,
      this.progressFlushLockKey(),
      owner,
    );
  }

  private async removePendingProgressIfVersionMatches(item: PendingProgress): Promise<void> {
    await this.redis.eval(
      `local current = redis.call('GET', KEYS[1])
       if not current then redis.call('ZREM', KEYS[2], ARGV[2]) return 1 end
       local decoded = cjson.decode(current)
       if decoded.version == ARGV[1] then redis.call('DEL', KEYS[1]) redis.call('ZREM', KEYS[2], ARGV[2]) return 1 end
       return 0`,
      2,
      this.progressPendingKey(item.userId, item.listingId),
      this.progressDueKey(),
      item.version,
      JSON.stringify({ userId: item.userId, listingId: item.listingId }),
    );
  }

  private progressListingKey(slug: string): string {
    return `${this.redis.namespace}progress:listing:${slug}`;
  }

  private progressPendingKey(userId: string, listingId: string): string {
    return `${this.redis.namespace}progress:pending:${userId}:${listingId}`;
  }

  private progressDueKey(): string {
    return `${this.redis.namespace}progress:due`;
  }

  private progressFlushLockKey(): string {
    return `${this.redis.namespace}progress:flush-lock`;
  }

  /**
   * Stream-route resolution shares the Catalog identity seam — the route is
   * public, so an unpublished or ID-shaped slug value yields no stream.
   */
  async findListingBySlug(slug: string) {
    return this.prisma.listing.findFirst({
      where: publishedListingSlugWhere(slug),
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
