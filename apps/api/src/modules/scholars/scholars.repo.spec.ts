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

    const result = await repository.hydratePageFeed([
      {
        form: 'scholars',
        id: 'scholars:allamah',
        titleKind: 'allamah',
        itemIds: ['scholar-2', 'missing-scholar', 'scholar-1'],
      },
    ]);

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
      repository.hydratePageFeed([
        {
          form: 'scholars',
          id: 'scholars:allamah',
          titleKind: 'allamah',
          itemIds: ['missing-scholar'],
        },
      ]),
    ).resolves.toEqual({ schemaVersion: 1, batches: [], exhausted: true });
  });

  it('hydrates scholar listings in recommendation order and omits stale listings', async () => {
    const scholarFindMany = vi.fn().mockResolvedValue([
      {
        id: 'scholar-1',
        slug: 'first-scholar',
        name: 'First Scholar',
        imageUrl: 'scholar.jpg',
        mainLanguage: 'en',
        title: 'allamah',
        translations: [],
        _count: { listings: 2 },
      },
    ]);
    const listingFindMany = vi.fn().mockResolvedValue([
      {
        id: 'listing-2',
        scholarId: 'scholar-1',
        slug: 'second',
        title: 'Second',
        format: 'single',
        language: 'en',
        coverImageUrl: null,
        publishedLectureCount: null,
        publishedDurationSeconds: null,
        durationSeconds: 120,
        publishedAt: new Date('2026-01-02T00:00:00.000Z'),
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        translations: [],
      },
    ]);
    const repository = new ScholarsRepository({
      scholar: { findMany: scholarFindMany },
      listing: { findMany: listingFindMany },
    } as never);

    const result = await repository.hydratePageFeed([
      {
        form: 'scholar_listings',
        id: 'scholar-listings:first-scholar',
        scholarSlug: 'first-scholar',
        scholarId: 'scholar-1',
        titleKind: 'scholar_listings',
        itemIds: ['listing-1', 'listing-2'],
      },
    ]);

    expect(result.batches[0]).toMatchObject({
      form: 'scholar_listings',
      scholarSlug: 'first-scholar',
      scholar: { slug: 'first-scholar', name: 'First Scholar' },
      items: [{ slug: 'second', title: 'Second' }],
    });
    expect(listingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['listing-1', 'listing-2'] },
          parentId: null,
          status: 'published',
          deletedAt: null,
        }),
      }),
    );
  });

  it('hydrates topic scholars in recommendation order and omits stale scholars', async () => {
    const scholarFindMany = vi.fn().mockResolvedValue([
      {
        id: 'scholar-2',
        slug: 'second-scholar',
        name: 'Second Scholar',
        imageUrl: null,
        mainLanguage: 'en',
        title: 'sheikh',
        translations: [],
        _count: { listings: 1 },
      },
    ]);
    const topicFindMany = vi.fn().mockResolvedValue([
      {
        id: 'topic-1',
        slug: 'aqeedah',
        name: 'العقيدة',
        translations: [{ name: 'Aqeedah' }],
        listingTopics: [{ listing: { scholarId: 'scholar-2' } }],
      },
    ]);
    const repository = new ScholarsRepository({
      scholar: { findMany: scholarFindMany },
      topic: { findMany: topicFindMany },
    } as never);

    const result = await repository.hydratePageFeed([
      {
        form: 'topic_scholars',
        id: 'topic-scholars:aqeedah',
        topicSlug: 'aqeedah',
        topicId: 'topic-1',
        titleKind: 'topic_scholars',
        itemIds: ['missing-scholar', 'scholar-2'],
      },
    ]);

    expect(result.batches[0]).toMatchObject({
      form: 'topic_scholars',
      topic: { slug: 'aqeedah', name: 'Aqeedah' },
      items: [{ slug: 'second-scholar' }],
    });
  });
});
