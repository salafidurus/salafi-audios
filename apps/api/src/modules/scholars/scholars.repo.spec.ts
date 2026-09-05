import { describe, expect, it, vi } from 'bun:test';

import { ScholarsRepository } from './scholars.repo';

describe('ScholarsRepository page-feed hydration', () => {
  it('preserves engine order and omits references missing from the active hydration query', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'scholar-1',
        slug: 'first-scholar',
        name: 'First Scholar',
        imageUrl: null,
        mainLanguage: 'en',
        title: 'allamah',
        translations: [],
        _count: { listings: 2 },
      },
      {
        id: 'scholar-2',
        slug: 'second-scholar',
        name: 'Second Scholar',
        imageUrl: null,
        mainLanguage: 'en',
        title: 'allamah',
        translations: [],
        _count: { listings: 1 },
      },
    ]);
    const repository = new ScholarsRepository({ scholar: { findMany } } as never);

    const result = await repository.hydratePageFeed({
      form: 'scholars',
      id: 'scholars:allamah',
      titleKind: 'allamah',
      itemIds: ['scholar-2', 'missing-scholar', 'scholar-1'],
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['scholar-2', 'missing-scholar', 'scholar-1'] }, isActive: true },
      }),
    );
    expect(result.batches[0]?.items.map((scholar) => scholar.id)).toEqual([
      'scholar-2',
      'scholar-1',
    ]);
  });

  it('returns an exhausted empty page when no recommendation item hydrates', async () => {
    const repository = new ScholarsRepository({
      scholar: { findMany: vi.fn().mockResolvedValue([]) },
    } as never);

    await expect(
      repository.hydratePageFeed({
        form: 'scholars',
        id: 'scholars:allamah',
        titleKind: 'allamah',
        itemIds: ['missing-scholar'],
      }),
    ).resolves.toEqual({ schemaVersion: 1, batches: [], exhausted: true });
  });
});
