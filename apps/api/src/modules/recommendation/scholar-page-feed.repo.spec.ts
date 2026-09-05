import { beforeEach, describe, expect, it, vi } from 'bun:test';

import { ScholarPageFeedRepo } from './scholar-page-feed.repo';

describe('ScholarPageFeedRepo', () => {
  let repo: ScholarPageFeedRepo;
  let findMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findMany = vi.fn().mockResolvedValue([]);
    repo = new ScholarPageFeedRepo({ scholar: { findMany } } as never);
  });

  it('selects active Allamah scholars in deterministic order', async () => {
    findMany.mockResolvedValue([{ id: 'scholar-2' }, { id: 'scholar-1' }]);

    const result = await repo.getRecommendations();

    expect(result).toEqual({
      form: 'scholars',
      id: 'scholars:allamah',
      titleKind: 'allamah',
      itemIds: ['scholar-2', 'scholar-1'],
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { isActive: true, title: 'allamah' },
      select: { id: true },
      orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
    });
  });

  it('returns an empty recommendation when no eligible scholars exist', async () => {
    await expect(repo.getRecommendations()).resolves.toMatchObject({ itemIds: [] });
  });
});
