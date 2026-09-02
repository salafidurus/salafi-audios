import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { ListingRepository } from './listing.repo';

const baseListingSelect = {
  id: 'lesson-1',
  slug: 'lesson-1',
  title: 'Lesson One',
  description: null,
  format: 'single',
  language: 'en',
  durationSeconds: 600,
  publishedAt: new Date('2026-01-01T00:00:00Z'),
  parentId: null as string | null,
  translations: [],
  scholar: {
    id: 'sch-1',
    slug: 'scholar-1',
    name: 'Scholar One',
    mainLanguage: 'en',
    imageUrl: null,
    translations: [],
  },
  topics: [],
  audioAssets: [],
};

describe('ListingRepository — findDetailBySlug rootListing resolution', () => {
  let repo: ListingRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = { listing: { findFirst: vi.fn<any>() } };
    repo = new ListingRepository(prisma);
  });

  it('returns a null rootListing for an already top-level listing', async () => {
    prisma.listing.findFirst.mockResolvedValueOnce({ ...baseListingSelect, parentId: null });

    const result = await repo.findDetailBySlug('lesson-1');

    expect(result?.rootListing).toBeNull();
    expect(result?.seriesContext).toBeNull();
    expect(prisma.listing.findFirst).toHaveBeenCalledTimes(1);
  });

  it('returns the direct parent as rootListing for a series -> lesson (2-level) listing', async () => {
    prisma.listing.findFirst
      .mockResolvedValueOnce({ ...baseListingSelect, parentId: 'series-1' })
      .mockResolvedValueOnce({
        id: 'series-1',
        slug: 'series-one',
        title: 'Series One',
        language: 'en',
        parentId: null,
        translations: [],
      });

    const result = await repo.findDetailBySlug('lesson-1');

    expect(result?.rootListing).toEqual({
      id: 'series-1',
      slug: 'series-one',
      title: 'Series One',
    });
    expect(result?.seriesContext).toEqual({
      seriesId: 'series-1',
      seriesTitle: 'Series One',
      seriesSlug: 'series-one',
    });
    expect(prisma.listing.findFirst).toHaveBeenCalledTimes(2);
  });

  it('returns the grandparent as rootListing for a collection -> module -> lesson (3-level) listing', async () => {
    prisma.listing.findFirst
      .mockResolvedValueOnce({ ...baseListingSelect, parentId: 'module-1' })
      .mockResolvedValueOnce({
        id: 'module-1',
        slug: 'module-one',
        title: 'Module One',
        language: 'en',
        parentId: 'collection-1',
        translations: [],
      })
      .mockResolvedValueOnce({
        id: 'collection-1',
        slug: 'collection-one',
        title: 'Collection One',
        language: 'en',
        parentId: null,
        translations: [],
      });

    const result = await repo.findDetailBySlug('lesson-1');

    expect(result?.rootListing).toEqual({
      id: 'collection-1',
      slug: 'collection-one',
      title: 'Collection One',
    });
    // seriesContext still points at the immediate parent (Module), not the root —
    // it's used for breadcrumb display, not the redirect target.
    expect(result?.seriesContext).toEqual({
      seriesId: 'module-1',
      seriesTitle: 'Module One',
      seriesSlug: 'module-one',
    });
    expect(prisma.listing.findFirst).toHaveBeenCalledTimes(3);
  });

  it('returns a null rootListing when the parent cannot be found (deleted/unpublished)', async () => {
    prisma.listing.findFirst
      .mockResolvedValueOnce({ ...baseListingSelect, parentId: 'series-1' })
      .mockResolvedValueOnce(null);

    const result = await repo.findDetailBySlug('lesson-1');

    expect(result?.rootListing).toBeNull();
    expect(result?.seriesContext).toBeNull();
  });
});
