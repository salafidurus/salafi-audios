import { beforeEach, describe, expect, it, vi } from 'bun:test';

import { TopicsRepository } from './topics.repo';

describe('TopicsRepository public identity projections', () => {
  let repo: TopicsRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      topic: { findUnique: vi.fn() },
      listing: { findMany: vi.fn() },
    };
    repo = new TopicsRepository(prisma);
  });

  it('returns scholarSlug for topic content without changing internal lookup IDs', async () => {
    prisma.topic.findUnique.mockResolvedValue({ id: 'topic-id' });
    prisma.listing.findMany.mockResolvedValue([
      {
        id: 'listing-id',
        scholarId: 'scholar-id',
        parentId: null,
        slug: 'lesson-slug',
        title: 'Lesson',
        description: null,
        language: 'en',
        status: 'published',
        publishedAt: new Date('2026-08-26T00:00:00.000Z'),
        durationSeconds: 120,
        translations: [],
        scholar: { slug: 'scholar-slug' },
      },
    ]);

    await expect(repo.listPublishedLecturesByTopicSlug('aqidah')).resolves.toMatchObject([
      {
        id: 'listing-id',
        scholarId: 'scholar-id',
        scholarSlug: 'scholar-slug',
        slug: 'lesson-slug',
      },
    ]);

    expect(prisma.topic.findUnique).toHaveBeenCalledWith({
      where: { slug: 'aqidah' },
      select: { id: true },
    });
  });
});
