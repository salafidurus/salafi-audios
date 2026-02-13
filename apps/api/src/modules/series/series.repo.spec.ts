import { Status } from '@sd/db/client';
import { SeriesRepository } from './series.repo';

describe('SeriesRepository', () => {
  const scholarFindFirst = jest.fn();
  const collectionFindFirst = jest.fn();
  const seriesFindMany = jest.fn();
  const seriesFindFirst = jest.fn();

  const prisma = {
    scholar: { findFirst: scholarFindFirst },
    collection: { findFirst: collectionFindFirst },
    series: {
      findMany: seriesFindMany,
      findFirst: seriesFindFirst,
    },
  };

  const repo = new SeriesRepository(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty list when scholar does not exist', async () => {
    scholarFindFirst.mockResolvedValue(null);

    await expect(repo.listPublishedByScholarSlug('missing')).resolves.toEqual(
      [],
    );
    expect(seriesFindMany).not.toHaveBeenCalled();
  });

  it('filters to published series and published parent collection', async () => {
    const createdAt = new Date('2026-01-03T00:00:00.000Z');

    scholarFindFirst.mockResolvedValue({ id: 'sch-1' });
    seriesFindMany.mockResolvedValue([
      {
        id: 'ser-1',
        scholarId: 'sch-1',
        collectionId: null,
        slug: 'series-1',
        title: 'Series 1',
        description: null,
        coverImageUrl: null,
        language: null,
        status: Status.published,
        orderIndex: 2,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt,
        updatedAt: null,
      },
    ]);

    await repo.listPublishedByScholarSlug('ibn-baz');

    expect(seriesFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scholarId: 'sch-1',
          deletedAt: null,
          status: Status.published,
          OR: [
            { collectionId: null },
            {
              collection: {
                is: {
                  deletedAt: null,
                  status: Status.published,
                },
              },
            },
          ],
        }),
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      }),
    );
  });

  it('enforces active scholar and published ancestor checks for get by id', async () => {
    const createdAt = new Date('2026-01-04T00:00:00.000Z');

    seriesFindFirst.mockResolvedValue({
      id: 'ser-2',
      scholarId: 'sch-2',
      collectionId: null,
      slug: 'series-2',
      title: 'Series 2',
      description: null,
      coverImageUrl: null,
      language: null,
      status: Status.published,
      orderIndex: null,
      deletedAt: null,
      deleteAfterAt: null,
      createdAt,
      updatedAt: null,
    });

    await repo.findPublishedById('ser-2');

    expect(seriesFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'ser-2',
          deletedAt: null,
          status: Status.published,
          scholar: { isActive: true },
          OR: [
            { collectionId: null },
            {
              collection: {
                is: {
                  deletedAt: null,
                  status: Status.published,
                },
              },
            },
          ],
        }),
      }),
    );
  });

  it('uses deterministic ordering for series inside a collection', async () => {
    scholarFindFirst.mockResolvedValue({ id: 'sch-3' });
    collectionFindFirst.mockResolvedValue({ id: 'col-3' });
    seriesFindMany.mockResolvedValue([]);

    await repo.listPublishedByScholarAndCollectionSlug(
      'ibn-uthaymin',
      'aqidah',
    );

    expect(seriesFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      }),
    );
  });
});
