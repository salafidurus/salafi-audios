import { Status } from '@sd/db/client';
import { CollectionRepository } from './collections.repo';

describe('CollectionRepository', () => {
  const scholarFindFirst = jest.fn();
  const collectionFindMany = jest.fn();
  const collectionFindFirst = jest.fn();

  const prisma = {
    scholar: { findFirst: scholarFindFirst },
    collection: {
      findMany: collectionFindMany,
      findFirst: collectionFindFirst,
    },
  };

  const repo = new CollectionRepository(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty list when scholar does not exist', async () => {
    scholarFindFirst.mockResolvedValue(null);

    await expect(repo.listPublishedByScholarSlug('missing')).resolves.toEqual(
      [],
    );
    expect(collectionFindMany).not.toHaveBeenCalled();
  });

  it('filters to published, non-deleted collections with deterministic ordering', async () => {
    const createdAt = new Date('2026-01-05T00:00:00.000Z');

    scholarFindFirst.mockResolvedValue({ id: 'sch-1' });
    collectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        scholarId: 'sch-1',
        slug: 'collection-1',
        title: 'Collection 1',
        description: null,
        coverImageUrl: null,
        language: null,
        status: Status.published,
        orderIndex: 1,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt,
        updatedAt: null,
      },
    ]);

    await repo.listPublishedByScholarSlug('ibn-baz');

    expect(collectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          scholarId: 'sch-1',
          deletedAt: null,
          status: Status.published,
        },
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      }),
    );
  });

  it('enforces published and non-deleted visibility for get by id', async () => {
    const createdAt = new Date('2026-01-06T00:00:00.000Z');

    collectionFindFirst.mockResolvedValue({
      id: 'col-2',
      scholarId: 'sch-2',
      slug: 'collection-2',
      title: 'Collection 2',
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

    await repo.findPublishedById('col-2');

    expect(collectionFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'col-2', deletedAt: null, status: Status.published },
      }),
    );
  });

  it('returns null when scholar for slug lookup does not exist', async () => {
    scholarFindFirst.mockResolvedValue(null);

    await expect(
      repo.findPublishedByScholarSlugAndSlug('missing', 'collection-1'),
    ).resolves.toBeNull();

    expect(collectionFindFirst).not.toHaveBeenCalled();
  });
});
