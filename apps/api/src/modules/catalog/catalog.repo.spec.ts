import { Status } from '@sd/db/client';
import { CatalogRepository } from './catalog.repo';

describe('CatalogRepository.listFeaturedHomeItems', () => {
  const seriesFindFirst = jest.fn();
  const seriesFindMany = jest.fn();
  const collectionFindMany = jest.fn();
  const lectureFindMany = jest.fn();
  const lectureCount = jest.fn();
  const lectureAggregate = jest.fn();
  const audioAssetAggregate = jest.fn();

  const prisma = {
    series: {
      findFirst: seriesFindFirst,
      findMany: seriesFindMany,
    },
    collection: {
      findMany: collectionFindMany,
    },
    lecture: {
      findMany: lectureFindMany,
      count: lectureCount,
      aggregate: lectureAggregate,
    },
    audioAsset: {
      aggregate: audioAssetAggregate,
    },
  };

  const repo = new CatalogRepository(prisma as never, {} as never);

  beforeEach(() => {
    jest.clearAllMocks();
    audioAssetAggregate.mockResolvedValue({ _sum: { durationSeconds: null } });
  });

  it('returns curated series items with headline as message and correct lesson counts', async () => {
    seriesFindFirst
      .mockResolvedValueOnce({
        id: 'ser-kt',
        scholarId: 'sch-1',
        collectionId: null,
        slug: 'kitab-ut-tawhid',
        title: 'Kitab ut-Tawhid',
        description: null,
        coverImageUrl: 'https://cdn.test/kt.jpg',
        language: 'ar',
        status: Status.published,
        orderIndex: 1,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: null,
        publishedLectureCount: 42,
        publishedDurationSeconds: 3600,
        scholar: { name: 'Shaykh A', slug: 'shaykh-a' },
      })
      .mockResolvedValueOnce({
        id: 'ser-ar',
        scholarId: 'sch-2',
        collectionId: null,
        slug: 'aqeedah-arraziyayn',
        title: 'Aqeedah ar-Raziyayn',
        description: '...',
        coverImageUrl: null,
        language: 'ar',
        status: Status.published,
        orderIndex: 2,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: null,
        publishedLectureCount: 8,
        publishedDurationSeconds: 1800,
        scholar: { name: 'Shaykh B', slug: 'shaykh-b' },
      })
      .mockResolvedValueOnce({
        id: 'ser-tah',
        scholarId: 'sch-3',
        collectionId: null,
        slug: 'kitab-ut-taharah',
        title: 'Kitab ut-Taharah',
        description: null,
        coverImageUrl: null,
        language: 'ar',
        status: Status.published,
        orderIndex: 3,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: null,
        publishedLectureCount: 4,
        publishedDurationSeconds: 600,
        scholar: { name: 'Shaykh C', slug: 'shaykh-c' },
      });

    const items = await repo.listFeaturedHomeItems(3);

    expect(items).toHaveLength(3);
    expect(items[0]).toEqual(
      expect.objectContaining({
        kind: 'series',
        entityId: 'ser-kt',
        entitySlug: 'kitab-ut-tawhid',
        headline: 'Tawhid First',
        title: 'Kitab ut-Tawhid',
        lessonCount: 42,
        totalDurationSeconds: 3600,
        presentedBy: 'Shaykh A',
        presentedBySlug: 'shaykh-a',
      }),
    );
    expect(items[1]).toEqual(
      expect.objectContaining({
        kind: 'series',
        entityId: 'ser-ar',
        entitySlug: 'aqeedah-arraziyayn',
        headline: 'Learn Iman before Quran',
        title: 'Aqeedah ar-Raziyayn',
        lessonCount: 8,
        totalDurationSeconds: 1800,
        presentedBy: 'Shaykh B',
      }),
    );
    expect(items[2]).toEqual(
      expect.objectContaining({
        kind: 'series',
        entityId: 'ser-tah',
        entitySlug: 'kitab-ut-taharah',
        headline: 'Oh Allah, grant him Fiqh in the religion',
        title: 'Kitab ut-Taharah',
        lessonCount: 4,
        totalDurationSeconds: 600,
        presentedBy: 'Shaykh C',
      }),
    );
  });

  it('falls back to published series/collection/lecture and preserves headline as the message', async () => {
    seriesFindFirst.mockResolvedValue(null);

    seriesFindMany.mockResolvedValue([
      {
        id: 'ser-1',
        scholarId: 'sch-1',
        collectionId: null,
        slug: 'some-series',
        title: 'Some Series',
        description: null,
        coverImageUrl: null,
        language: 'ar',
        status: Status.published,
        orderIndex: 1,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: null,
        publishedLectureCount: null,
        publishedDurationSeconds: null,
        scholar: { name: 'Shaykh A', slug: 'shaykh-a' },
      },
    ]);

    collectionFindMany.mockResolvedValue([
      {
        id: 'col-1',
        scholarId: 'sch-2',
        slug: 'some-collection',
        title: 'Some Collection',
        description: null,
        coverImageUrl: null,
        language: 'ar',
        status: Status.published,
        orderIndex: 1,
        deletedAt: null,
        deleteAfterAt: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: null,
        publishedLectureCount: null,
        publishedDurationSeconds: null,
        scholar: { name: 'Shaykh B', slug: 'shaykh-b' },
      },
    ]);

    lectureFindMany.mockResolvedValue([
      {
        id: 'lec-1',
        slug: 'some-lecture',
        title: 'Some Lecture',
        description: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        publishedAt: new Date('2026-02-01T00:00:00.000Z'),
        durationSeconds: null,
        status: Status.published,
        deletedAt: null,
        scholar: { name: 'Shaykh C', slug: 'shaykh-c' },
        series: { coverImageUrl: 'https://cdn.test/cover.jpg' },
      },
    ]);

    lectureCount.mockResolvedValueOnce(11).mockResolvedValueOnce(99);
    lectureAggregate
      .mockResolvedValueOnce({ _sum: { durationSeconds: 1111 } })
      .mockResolvedValueOnce({ _sum: { durationSeconds: 2222 } });

    const items = await repo.listFeaturedHomeItems(3);

    expect(items).toHaveLength(3);
    expect(items[0]).toEqual(
      expect.objectContaining({
        kind: 'series',
        headline: 'Tawhid First',
        title: 'Some Series',
        lessonCount: 11,
        totalDurationSeconds: 1111,
      }),
    );
    expect(items[1]).toEqual(
      expect.objectContaining({
        kind: 'collection',
        headline: 'Learn Iman before Quran',
        title: 'Some Collection',
        lessonCount: 99,
        totalDurationSeconds: 2222,
      }),
    );
    expect(items[2]).toEqual(
      expect.objectContaining({
        kind: 'lecture',
        headline: 'Oh Allah, grant him Fiqh in the religion',
        title: 'Some Lecture',
        coverImageUrl: 'https://cdn.test/cover.jpg',
        lessonCount: 1,
        totalDurationSeconds: undefined,
      }),
    );
  });
});
