import { describe, expect, it } from 'bun:test';
import { ExploreMapper } from './explore.mapper';
import type { ExplorePage } from './explore.repo';

describe('ExploreMapper', () => {
  it('adds the public schema version at the Explore caller seam', () => {
    const page: ExplorePage = {
      batches: [
        {
          kind: 'topics',
          id: 'topics:discoverable',
          reason: 'deterministic_topics',
          itemIds: ['topic-1'],
          items: [{ id: 'topic-1', slug: 'aqeedah', name: 'Aqeedah' }],
        },
      ],
      exhausted: true,
    };
    const result = new ExploreMapper().toFeedPage(page);

    expect(result.schemaVersion).toBe(1);
    expect(result.batches[0]?.kind).toBe('topics');
  });
});
