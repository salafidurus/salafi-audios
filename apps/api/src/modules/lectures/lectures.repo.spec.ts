import { Status } from '@sd/db/client';
import { ConfigService } from '@/shared/config/config.service';
import { LecturesRepository } from './lectures.repo';

describe('LecturesRepository', () => {
  const scholarFindFirst = jest.fn();
  const seriesFindFirst = jest.fn();
  const lectureFindMany = jest.fn();
  const lectureFindFirst = jest.fn();

  const prisma = {
    scholar: { findFirst: scholarFindFirst },
    series: { findFirst: seriesFindFirst },
    lecture: {
      findMany: lectureFindMany,
      findFirst: lectureFindFirst,
    },
  };

  const config = {
    ASSET_CDN_BASE_URL: 'https://cdn.example.com',
  } as ConfigService;

  const repo = new LecturesRepository(prisma as never, config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty list when scholar does not exist', async () => {
    scholarFindFirst.mockResolvedValue(null);

    await expect(repo.listPublishedByScholarSlug('missing')).resolves.toEqual(
      [],
    );

    expect(lectureFindMany).not.toHaveBeenCalled();
  });

  it('filters to published hierarchy and maps primary audio asset URL', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    scholarFindFirst.mockResolvedValue({ id: 'sch-1' });
    lectureFindMany.mockResolvedValue([
      {
        id: 'lec-1',
        scholarId: 'sch-1',
        seriesId: 'ser-1',
        slug: 'lecture-1',
        title: 'Lecture 1',
        description: 'Desc',
        language: 'ar',
        status: Status.published,
        publishedAt: createdAt,
        orderIndex: 7,
        durationSeconds: 360,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt,
        updatedAt: null,
        audioAssets: [
          {
            id: 'aa-1',
            lectureId: 'lec-1',
            url: 'audio/lec-1.mp3',
            format: 'mp3',
            bitrateKbps: 128,
            sizeBytes: BigInt(1024),
            durationSeconds: 360,
            source: 'r2',
            isPrimary: true,
            createdAt,
          },
        ],
      },
    ]);

    const result = await repo.listPublishedByScholarSlug('ibn-baz');

    expect(lectureFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scholarId: 'sch-1',
          status: Status.published,
          deletedAt: null,
          OR: [
            { seriesId: null },
            {
              series: {
                is: {
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
                },
              },
            },
          ],
        }),
        orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      }),
    );

    expect(result[0]?.primaryAudioAsset?.url).toBe(
      'https://cdn.example.com/audio/lec-1.mp3',
    );
  });

  it('enforces active scholar and published ancestor checks for get by id', async () => {
    const createdAt = new Date('2026-01-02T00:00:00.000Z');

    lectureFindFirst.mockResolvedValue({
      id: 'lec-2',
      scholarId: 'sch-2',
      seriesId: null,
      slug: 'lecture-2',
      title: 'Lecture 2',
      description: null,
      language: null,
      status: Status.published,
      publishedAt: null,
      orderIndex: null,
      durationSeconds: null,
      deletedAt: null,
      deleteAfterAt: null,
      createdAt,
      updatedAt: null,
      audioAssets: [],
    });

    await repo.findPublishedById('lec-2');

    expect(lectureFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'lec-2',
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          OR: [
            { seriesId: null },
            {
              series: {
                is: {
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
                },
              },
            },
          ],
        }),
      }),
    );
  });

  it('uses deterministic ordering for lectures inside a series', async () => {
    scholarFindFirst.mockResolvedValue({ id: 'sch-3' });
    seriesFindFirst.mockResolvedValue({ id: 'ser-3' });
    lectureFindMany.mockResolvedValue([]);

    await repo.listPublishedByScholarAndSeriesSlug('ibn-uthaymin', 'aqidah');

    expect(lectureFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { orderIndex: 'asc' },
          { publishedAt: 'desc' },
          { title: 'asc' },
        ],
      }),
    );
  });
});
