import { beforeEach, describe, expect, it, vi } from 'bun:test';

import { ScholarPageFeedRepo } from './scholar-page-feed.repo';

describe('ScholarPageFeedRepo', () => {
  let repo: ScholarPageFeedRepo;
  let findMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findMany = vi.fn().mockResolvedValue([]);
    repo = new ScholarPageFeedRepo({ scholar: { findMany }, listing: { findMany } } as never);
  });

  it('selects active Allamah scholars in deterministic order', async () => {
    findMany
      .mockResolvedValueOnce([
        { id: 'scholar-2', slug: 'second-scholar' },
        { id: 'scholar-1', slug: 'first-scholar' },
      ])
      .mockResolvedValueOnce([{ id: 'listing-1', scholarId: 'scholar-1' }]);

    const result = await repo.getRecommendations();

    expect(result).toEqual([
      {
        form: 'scholars',
        id: 'scholars:allamah',
        titleKind: 'allamah',
        itemIds: ['scholar-2', 'scholar-1'],
      },
      {
        form: 'scholar_listings',
        id: 'scholar-listings:first-scholar',
        scholarSlug: 'first-scholar',
        scholarId: 'scholar-1',
        titleKind: 'scholar_listings',
        itemIds: ['listing-1'],
      },
    ]);
    expect(findMany).toHaveBeenCalledWith({
      where: { isActive: true, title: 'allamah' },
      select: { id: true, slug: true },
      orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
    });
    expect(findMany).toHaveBeenCalledWith({
      where: {
        scholarId: { in: ['scholar-2', 'scholar-1'] },
        parentId: null,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true, scholarId: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { slug: 'asc' }],
    });
  });

  it('returns an empty recommendation when no eligible scholars exist', async () => {
    await expect(repo.getRecommendations()).resolves.toEqual([
      { form: 'scholars', id: 'scholars:allamah', titleKind: 'allamah', itemIds: [] },
    ]);
  });
});
