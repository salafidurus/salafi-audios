import { beforeEach, describe, expect, it, vi } from 'bun:test';
import { ExploreRecommendationRepo } from './explore-recommendation.repo';

describe('ExploreRecommendationRepo', () => {
  let repo: ExploreRecommendationRepo;
  let listingFindMany: ReturnType<typeof vi.fn>;
  let scholarFindMany: ReturnType<typeof vi.fn>;
  let topicFindMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    listingFindMany = vi.fn().mockResolvedValue([]);
    scholarFindMany = vi.fn().mockResolvedValue([]);
    topicFindMany = vi.fn().mockResolvedValue([]);
    repo = new ExploreRecommendationRepo({
      listing: { findMany: listingFindMany },
      scholar: { findMany: scholarFindMany },
      topic: { findMany: topicFindMany },
    } as never);
  });

  it('selects ordered unsteered listing references without hydrating presentation data', async () => {
    listingFindMany.mockResolvedValue([
      { id: 'listing-1', slug: 'listing-1', createdAt: new Date('2026-07-24') },
    ]);

    const result = await repo.getRecommendations(undefined, 20);

    expect(result.batches).toEqual([
      {
        kind: 'listings',
        id: 'listings:recent',
        reason: 'deterministic_recent',
        itemIds: ['listing-1'],
      },
    ]);
    expect(listingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { id: true, slug: true, createdAt: true },
      }),
    );
  });

  it('queries all supported listing formats and applies stable cursor pagination', async () => {
    const cursor = Buffer.from(
      JSON.stringify({ date: '2026-07-24T12:00:00.000Z', slug: 'listing-5' }),
    ).toString('base64url');
    await repo.getRecommendations(cursor, 10);
    const args = listingFindMany.mock.calls[0]?.[0] as any;

    expect(args.where.format.in).toEqual(['single', 'series', 'collection']);
    expect(args.where.OR).toEqual([
      { createdAt: { lt: new Date('2026-07-24T12:00:00.000Z') } },
      { createdAt: new Date('2026-07-24T12:00:00.000Z'), slug: { lt: 'listing-5' } },
    ]);
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { slug: 'desc' }]);
    expect(args.take).toBe(11);
  });

  it('returns scholar and topic references only on the initial page', async () => {
    scholarFindMany.mockResolvedValue([{ id: 'scholar-1' }]);
    topicFindMany.mockResolvedValue([{ id: 'topic-1' }]);

    const result = await repo.getRecommendations();

    expect(result.batches).toEqual([
      {
        kind: 'scholars',
        id: 'scholars:senior',
        reason: 'deterministic_senior_scholars',
        itemIds: ['scholar-1'],
      },
      {
        kind: 'topics',
        id: 'topics:discoverable',
        reason: 'deterministic_topics',
        itemIds: ['topic-1'],
      },
    ]);
    expect(scholarFindMany).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true } }));
    expect(topicFindMany).toHaveBeenCalledWith(expect.objectContaining({ select: { id: true } }));
  });

  it('returns a stable continuation cursor when listing candidates continue', async () => {
    listingFindMany.mockResolvedValue([
      { id: 'listing-1', slug: 'listing-1', createdAt: new Date('2026-07-24') },
      { id: 'listing-2', slug: 'listing-2', createdAt: new Date('2026-07-23') },
    ]);

    const result = await repo.getRecommendations(undefined, 1);
    expect(result.batches[0]?.itemIds).toEqual(['listing-1']);
    expect(result.nextCursor).toBeDefined();
    expect(result.exhausted).toBe(false);
  });
});
