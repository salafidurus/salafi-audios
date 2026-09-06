import { describe, expect, it, vi } from 'bun:test';

import { ScholarsRecommendationEngine } from './scholars-recommendation.engine';

const recommendations = [
  {
    form: 'scholars' as const,
    id: 'scholars:allamah',
    titleKind: 'allamah' as const,
    itemIds: ['s1'],
  },
  {
    form: 'scholar_listings' as const,
    id: 'scholar-listings:first',
    scholarSlug: 'first',
    scholarId: 's1',
    titleKind: 'scholar_listings' as const,
    itemIds: ['l1'],
  },
  {
    form: 'topic_scholars' as const,
    id: 'topic-scholars:first',
    topicSlug: 'first-topic',
    topicId: 't1',
    titleKind: 'topic_scholars' as const,
    itemIds: ['s1'],
  },
  {
    form: 'scholars' as const,
    id: 'scholars:second',
    titleKind: 'allamah' as const,
    itemIds: ['s2'],
  },
];

describe('ScholarsRecommendationEngine', () => {
  it('deduplicates references within each semantic batch before pagination', async () => {
    const repo = {
      getRecommendations: vi
        .fn()
        .mockResolvedValue([{ ...recommendations[0], itemIds: ['s1', 's1', 's2'] }]),
    };
    const engine = new ScholarsRecommendationEngine(repo as never);

    const result = await engine.recommend(undefined, 1);

    expect(result.recommendations[0]?.itemIds).toEqual(['s1', 's2']);
    expect(result.nextCursor).toBeUndefined();
    expect(result.exhausted).toBe(true);
  });

  it('returns an ordered first page with opaque continuation metadata', async () => {
    const repo = { getRecommendations: vi.fn().mockResolvedValue(recommendations) };
    const engine = new ScholarsRecommendationEngine(repo as never);

    const result = await engine.recommend(undefined, 2);

    expect(result.recommendations.map((item) => item.id)).toEqual([
      'scholars:allamah',
      'scholar-listings:first',
    ]);
    expect(result.nextCursor).toBeDefined();
    expect(result.exhausted).toBe(false);
  });

  it('continues from the opaque cursor without repeating the previous page', async () => {
    const repo = { getRecommendations: vi.fn().mockResolvedValue(recommendations) };
    const engine = new ScholarsRecommendationEngine(repo as never);
    const firstPage = await engine.recommend(undefined, 2);

    const result = await engine.recommend(firstPage.nextCursor, 2);

    expect(result.recommendations.map((item) => item.id)).toEqual([
      'topic-scholars:first',
      'scholars:second',
    ]);
    expect(result.nextCursor).toBeUndefined();
    expect(result.exhausted).toBe(true);
  });
});
