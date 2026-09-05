import { describe, expect, it } from 'bun:test';
import { ExploreMapper } from './explore.mapper';

describe('ExploreMapper', () => {
  it('adds the public schema version at the Explore caller seam', () => {
    const result = new ExploreMapper().toFeedPage({
      batches: [
        {
          kind: 'topics',
          id: 'topics:discoverable',
          title: { kind: 'topics', id: 'discoverable_topics', label: 'Explore topics' },
          reason: 'deterministic_topics',
          items: [{ id: 'topic-1', slug: 'aqeedah', name: 'Aqeedah' }],
        },
      ],
      exhausted: true,
    });

    expect(result.schemaVersion).toBe(1);
    expect(result.batches[0]?.kind).toBe('topics');
  });
});
