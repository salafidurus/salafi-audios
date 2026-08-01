import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { LibraryRepository } from './library.repo';

const seriesListingRow = {
  id: 'series-1',
  title: 'Series One',
  slug: 'series-one',
  language: 'en',
  durationSeconds: null,
  translations: [],
  scholar: {
    id: 'sch-1',
    slug: 'scholar-1',
    name: 'Scholar One',
    mainLanguage: 'en',
    translations: [],
  },
  parent: null,
};

const singleListingRow = {
  id: 'single-1',
  title: 'Standalone Lecture',
  slug: 'standalone-lecture',
  language: 'en',
  durationSeconds: 1200,
  translations: [],
  scholar: {
    id: 'sch-1',
    slug: 'scholar-1',
    name: 'Scholar One',
    mainLanguage: 'en',
    translations: [],
  },
  parent: null,
};

describe('LibraryRepository — rollup to top-level listings', () => {
  let repo: LibraryRepository;
  let prisma: any;
  let listingRepo: any;

  beforeEach(() => {
    prisma = {
      userListingProgress: {
        findMany: vi.fn<any>(),
      },
      listing: {
        findMany: vi.fn<any>(),
      },
      favoriteListing: {
        findMany: vi.fn<any>(),
      },
    };
    listingRepo = {
      getProgressSummaryByListingId: vi.fn<any>(),
    };

    repo = new LibraryRepository(prisma, listingRepo);
  });

  it('collapses progress across a series into a single in-progress entry', async () => {
    prisma.userListingProgress.findMany.mockResolvedValue([
      {
        listingId: 'lesson-1',
        positionSeconds: 300,
        isCompleted: true,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        listing: { parentId: 'series-1', parent: null },
      },
      {
        listingId: 'lesson-2',
        positionSeconds: 50,
        isCompleted: false,
        updatedAt: new Date('2026-01-02T00:00:00Z'),
        listing: { parentId: 'series-1', parent: null },
      },
    ]);
    listingRepo.getProgressSummaryByListingId.mockResolvedValue({
      listingId: 'series-1',
      format: 'series',
      totalCount: 3,
      completedCount: 1,
      percentComplete: 33.33,
      isCompleted: false,
    });
    prisma.listing.findMany.mockResolvedValue([seriesListingRow]);

    const result = await repo.findInProgress('user1');

    expect(listingRepo.getProgressSummaryByListingId).toHaveBeenCalledTimes(1);
    expect(listingRepo.getProgressSummaryByListingId).toHaveBeenCalledWith('series-1', 'user1');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      listingId: 'series-1',
      listingSlug: 'series-one',
      listingTitle: 'Series One',
      totalLeafCount: 3,
      completedLeafCount: 1,
    });
  });

  it('resolves the top-level ancestor two levels up (collection -> module -> lesson)', async () => {
    prisma.userListingProgress.findMany.mockResolvedValue([
      {
        listingId: 'lesson-1',
        positionSeconds: 100,
        isCompleted: false,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        listing: { parentId: 'module-1', parent: { parentId: 'collection-1' } },
      },
    ]);
    listingRepo.getProgressSummaryByListingId.mockResolvedValue({
      listingId: 'collection-1',
      format: 'collection',
      totalCount: 10,
      completedCount: 0,
      percentComplete: 0,
      isCompleted: false,
    });
    prisma.listing.findMany.mockResolvedValue([{ ...seriesListingRow, id: 'collection-1' }]);

    const result = await repo.findInProgress('user1');

    expect(listingRepo.getProgressSummaryByListingId).toHaveBeenCalledWith('collection-1', 'user1');
    expect(result.items[0]?.listingId).toBe('collection-1');
  });

  it('keeps a parentless single lecture as its own entry with leaf-level progress seconds', async () => {
    prisma.userListingProgress.findMany.mockResolvedValue([
      {
        listingId: 'single-1',
        positionSeconds: 400,
        isCompleted: false,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        listing: { parentId: null, parent: null },
      },
    ]);
    listingRepo.getProgressSummaryByListingId.mockResolvedValue({
      listingId: 'single-1',
      format: 'single',
      totalCount: 1,
      completedCount: 0,
      percentComplete: 0,
      isCompleted: false,
    });
    prisma.listing.findMany.mockResolvedValue([singleListingRow]);

    const result = await repo.findInProgress('user1');

    expect(result.items[0]).toMatchObject({
      listingId: 'single-1',
      progressSeconds: 400,
      totalLeafCount: 1,
      completedLeafCount: 0,
    });
  });

  it('only lists a series as completed once every lesson is completed', async () => {
    prisma.userListingProgress.findMany.mockResolvedValue([
      {
        listingId: 'lesson-1',
        positionSeconds: 300,
        isCompleted: true,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        listing: { parentId: 'series-1', parent: null },
      },
      {
        listingId: 'lesson-2',
        positionSeconds: 50,
        isCompleted: false,
        updatedAt: new Date('2026-01-02T00:00:00Z'),
        listing: { parentId: 'series-1', parent: null },
      },
    ]);
    listingRepo.getProgressSummaryByListingId.mockResolvedValue({
      listingId: 'series-1',
      format: 'series',
      totalCount: 2,
      completedCount: 1,
      percentComplete: 50,
      isCompleted: false,
    });
    prisma.listing.findMany.mockResolvedValue([seriesListingRow]);

    const inProgress = await repo.findInProgress('user1');
    const completed = await repo.findCompleted('user1');

    expect(inProgress.items).toHaveLength(1);
    expect(completed.items).toHaveLength(0);
  });

  it('lists a series as completed once its rollup summary is fully completed', async () => {
    prisma.userListingProgress.findMany.mockResolvedValue([
      {
        listingId: 'lesson-1',
        positionSeconds: 300,
        isCompleted: true,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        listing: { parentId: 'series-1', parent: null },
      },
      {
        listingId: 'lesson-2',
        positionSeconds: 400,
        isCompleted: true,
        updatedAt: new Date('2026-01-02T00:00:00Z'),
        listing: { parentId: 'series-1', parent: null },
      },
    ]);
    listingRepo.getProgressSummaryByListingId.mockResolvedValue({
      listingId: 'series-1',
      format: 'series',
      totalCount: 2,
      completedCount: 2,
      percentComplete: 100,
      isCompleted: true,
    });
    prisma.listing.findMany.mockResolvedValue([seriesListingRow]);

    const inProgress = await repo.findInProgress('user1');
    const completed = await repo.findCompleted('user1');

    expect(inProgress.items).toHaveLength(0);
    expect(completed.items).toHaveLength(1);
    expect(completed.items[0]?.listingId).toBe('series-1');
  });
});
