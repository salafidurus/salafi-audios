import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { AudioRepository, isPositionCompleted } from './audio.repo';

describe('isPositionCompleted', () => {
  it('returns false when duration is missing or zero', () => {
    expect(isPositionCompleted(100, undefined)).toBe(false);
    expect(isPositionCompleted(100, null)).toBe(false);
    expect(isPositionCompleted(100, 0)).toBe(false);
  });

  it('returns true once position reaches 95% of a long duration', () => {
    expect(isPositionCompleted(3420, 3600)).toBe(true); // exactly 95%
    expect(isPositionCompleted(3419, 3600)).toBe(false); // just under 95%, and 181s remain (>30s)
  });

  it('completes early via the 30s-remaining branch even under 95%', () => {
    // duration=300 → 95% = 285, but position=275 is only 91.6% — still completes
    // because only 25s remain.
    expect(isPositionCompleted(275, 300)).toBe(true);
    expect(isPositionCompleted(269, 300)).toBe(false); // 31s remain, under neither threshold
  });

  it('does not trivially complete a sub-30s clip at position 0', () => {
    expect(isPositionCompleted(0, 20)).toBe(false);
    expect(isPositionCompleted(18, 20)).toBe(false); // 90%, under 95%
    expect(isPositionCompleted(19, 20)).toBe(true); // 95%
  });

  it('only applies the tail-remaining branch when duration is strictly greater than 30s', () => {
    // duration=30: tail branch never applies (duration > 30 is false); only 95% (28.5s) matters
    expect(isPositionCompleted(28, 30)).toBe(false);
    expect(isPositionCompleted(29, 30)).toBe(true);
  });
});

describe('AudioRepository', () => {
  let repo: AudioRepository;
  let prisma: any;
  let redis: any;
  let config: any;

  beforeEach(() => {
    prisma = {
      listing: {
        findFirst: vi.fn<any>(),
        findUnique: vi.fn<any>(),
        findMany: vi.fn<any>(),
      },
      userListingProgress: {
        findUnique: vi.fn<any>(),
        upsert: vi.fn<any>().mockResolvedValue(undefined),
      },
      $executeRaw: vi.fn<any>(),
      $transaction: vi.fn<any>().mockResolvedValue(undefined),
    };
    redis = {
      enabled: false,
      namespace: 'sd:test:api:',
      get: vi.fn<any>(),
      mget: vi.fn<any>(),
      set: vi.fn<any>(),
      del: vi.fn<any>(),
      eval: vi.fn<any>(),
      zrangebyscore: vi.fn<any>(),
    };
    config = {
      REDIS_PROGRESS_BUFFER_DELAY_MS: 120_000,
      REDIS_PROGRESS_PENDING_TTL_SECONDS: 900,
    };
    const logger = {
      setContext: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    repo = new AudioRepository(prisma, redis, config, logger as any);
  });

  describe('upsertProgress', () => {
    it('writes directly to PostgreSQL when Redis is not configured', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });

      const result = await repo.upsertProgress('user1', 'listing-slug', 10);

      expect(result).toBe(true);
      expect(prisma.userListingProgress.upsert).toHaveBeenCalled();
      expect(redis.eval).not.toHaveBeenCalled();
    });

    it('buffers progress through Redis when Redis is enabled', async () => {
      redis.enabled = true;
      redis.get.mockResolvedValue(null);
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });
      redis.eval.mockResolvedValue(1);

      const result = await repo.upsertProgress('user1', 'listing-slug', 10);

      expect(result).toBe(true);
      expect(redis.eval).toHaveBeenCalledTimes(1);
      expect(prisma.userListingProgress.upsert).not.toHaveBeenCalled();
    });

    it('falls back to PostgreSQL when Redis enqueue fails', async () => {
      redis.enabled = true;
      redis.get.mockResolvedValue(null);
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });
      redis.eval.mockRejectedValue(new Error('Redis unavailable'));

      const result = await repo.upsertProgress('user1', 'listing-slug', 10);

      expect(result).toBe(true);
      expect(prisma.userListingProgress.upsert).toHaveBeenCalled();
    });

    it('falls back to PostgreSQL when the Redis listing cache is unavailable', async () => {
      redis.enabled = true;
      redis.get.mockRejectedValue(new Error('Redis unavailable'));
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });
      redis.eval.mockRejectedValue(new Error('Redis unavailable'));

      const result = await repo.upsertProgress('user1', 'listing-slug', 10);

      expect(result).toBe(true);
      expect(redis.eval).toHaveBeenCalled();
      expect(prisma.userListingProgress.upsert).toHaveBeenCalled();
    });

    it("derives isCompleted from the listing's own stored duration when the client omits it", async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });
      prisma.userListingProgress.findUnique.mockResolvedValue(null);

      await repo.upsertProgress('user1', 'tafsir-al-fatiha', 95, undefined, undefined);

      expect(prisma.listing.findFirst).toHaveBeenCalledWith({
        where: { slug: 'tafsir-al-fatiha' },
        select: { id: true, durationSeconds: true },
      });
      const upsertArgs = prisma.userListingProgress.upsert.mock.calls[0][0];
      expect(upsertArgs.create.isCompleted).toBe(true); // 95/100 = 95%
      expect(upsertArgs.update.isCompleted).toBe(true);
    });

    it('resolves the listing by slug and upserts using the resolved id', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });
      prisma.userListingProgress.findUnique.mockResolvedValue(null);

      await repo.upsertProgress('user1', 'tafsir-al-fatiha', 10, undefined, undefined);

      expect(prisma.listing.findFirst).toHaveBeenCalledWith({
        where: { slug: 'tafsir-al-fatiha' },
        select: { id: true, durationSeconds: true },
      });
      expect(prisma.userListingProgress.findUnique).toHaveBeenCalledWith({
        where: { userId_listingId: { userId: 'user1', listingId: 'listing1' } },
        select: { isCompleted: true },
      });
      const upsertArgs = prisma.userListingProgress.upsert.mock.calls[0][0];
      expect(upsertArgs.where).toEqual({
        userId_listingId: { userId: 'user1', listingId: 'listing1' },
      });
      expect(upsertArgs.create.listingId).toBe('listing1');
    });

    it('returns false and does not upsert when the listing cannot be resolved', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      const result = await repo.upsertProgress('user1', 'missing-slug', 10, undefined, undefined);

      expect(result).toBe(false);
      expect(prisma.userListingProgress.upsert).not.toHaveBeenCalled();
    });

    it('respects an explicit client isCompleted override even when the derived value disagrees', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 1000 });
      prisma.userListingProgress.findUnique.mockResolvedValue(null);

      await repo.upsertProgress('user1', 'listing1', 10, undefined, true);

      const upsertArgs = prisma.userListingProgress.upsert.mock.calls[0][0];
      expect(upsertArgs.create.isCompleted).toBe(true);
    });

    it('never flips isCompleted back to false once already true (monotonic)', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 1000 });
      prisma.userListingProgress.findUnique.mockResolvedValue({ isCompleted: true });

      // A later sync reports an earlier position and no explicit completion (e.g. a replay).
      await repo.upsertProgress('user1', 'listing1', 10, undefined, undefined);

      const upsertArgs = prisma.userListingProgress.upsert.mock.calls[0][0];
      expect(upsertArgs.update.isCompleted).toBe(true);
    });

    it('stays false for a fresh row when neither the client nor the derivation indicates completion', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 1000 });
      prisma.userListingProgress.findUnique.mockResolvedValue(null);

      await repo.upsertProgress('user1', 'listing1', 10, undefined, undefined);

      const upsertArgs = prisma.userListingProgress.upsert.mock.calls[0][0];
      expect(upsertArgs.create.isCompleted).toBe(false);
    });
  });

  describe('bulkSync', () => {
    it("fetches canonical durations for all items' listings in one batched query", async () => {
      prisma.listing.findMany.mockResolvedValue([
        { id: 'l1', durationSeconds: 100 },
        { id: 'l2', durationSeconds: 200 },
      ]);

      await repo.bulkSync('user1', [
        {
          listingId: 'l1',
          positionSeconds: 10,
          durationSeconds: 999,
          updatedAt: new Date().toISOString(),
        },
        {
          listingId: 'l2',
          positionSeconds: 20,
          durationSeconds: 999,
          updatedAt: new Date().toISOString(),
        },
      ]);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['l1', 'l2'] } },
        select: { id: true, durationSeconds: true },
      });
    });

    it('derives isCompleted from the canonical duration, not the client-supplied one, when completedAt is absent', async () => {
      prisma.listing.findMany.mockResolvedValue([{ id: 'l1', durationSeconds: 100 }]);

      await repo.bulkSync('user1', [
        {
          listingId: 'l1',
          positionSeconds: 95, // 95% of the canonical 100s duration
          durationSeconds: 5, // client-reported duration is wildly different — must be ignored
          updatedAt: new Date().toISOString(),
        },
      ]);

      const [, ...values] = prisma.$executeRaw.mock.calls[0];
      expect(values).toContain(true);
    });

    it('includes a monotonic OR-guard around the isCompleted CASE so a stale sync cannot un-complete a lesson', async () => {
      prisma.listing.findMany.mockResolvedValue([{ id: 'l1', durationSeconds: 100 }]);

      await repo.bulkSync('user1', [
        {
          listingId: 'l1',
          positionSeconds: 1,
          durationSeconds: 100,
          updatedAt: new Date().toISOString(),
        },
      ]);

      const [strings] = prisma.$executeRaw.mock.calls[0];
      const sql = strings.join('?');
      expect(sql).toContain('"isCompleted" = "UserListingProgress"."isCompleted" OR');
    });
  });

  describe('findListingBySlug', () => {
    it('resolves strictly by slug through the published-only seam', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing1', durationSeconds: 100 });

      await repo.findListingBySlug('tafsir-al-fatiha');

      // The stream route is public discovery — a draft or archived Listing
      // must resolve as not found, never by internal-ID compatibility.
      expect(prisma.listing.findFirst).toHaveBeenCalledWith({
        where: { slug: 'tafsir-al-fatiha', deletedAt: null, status: 'published' },
        select: { id: true, durationSeconds: true },
      });
    });
  });

  describe('flushBufferedProgress', () => {
    it('persists due progress and removes the matching Redis version', async () => {
      redis.enabled = true;
      redis.set.mockResolvedValue('OK');
      redis.zrangebyscore.mockResolvedValue([
        JSON.stringify({ userId: 'user1', listingId: 'listing1' }),
      ]);
      redis.mget.mockResolvedValue([
        JSON.stringify({
          version: 'version-1',
          userId: 'user1',
          listingId: 'listing1',
          positionSeconds: 120,
          isCompleted: false,
          updatedAt: '2026-08-10T10:00:00.000Z',
        }),
      ]);
      prisma.listing.findMany.mockResolvedValue([{ id: 'listing1', durationSeconds: 300 }]);

      await repo.flushBufferedProgress();

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(redis.eval).toHaveBeenCalledTimes(2);
    });

    it('retains pending Redis data when PostgreSQL fails', async () => {
      redis.enabled = true;
      redis.set.mockResolvedValue('OK');
      redis.zrangebyscore.mockResolvedValue([
        JSON.stringify({ userId: 'user1', listingId: 'listing1' }),
      ]);
      redis.mget.mockResolvedValue([
        JSON.stringify({
          version: 'version-1',
          userId: 'user1',
          listingId: 'listing1',
          positionSeconds: 120,
          isCompleted: false,
          updatedAt: '2026-08-10T10:00:00.000Z',
        }),
      ]);
      prisma.listing.findMany.mockRejectedValue(new Error('database unavailable'));

      await repo.flushBufferedProgress();

      expect(redis.eval).toHaveBeenCalledTimes(1);
    });
  });
});
