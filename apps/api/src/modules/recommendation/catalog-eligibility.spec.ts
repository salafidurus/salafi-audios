import { describe, expect, it } from 'bun:test';
import { Status } from '@sd/core-db';
import { publishedTopLevelCatalogListingWhere } from './catalog-eligibility';

describe('publishedTopLevelCatalogListingWhere', () => {
  it('contains only the invariants shared by Explore and Scholars', () => {
    expect(publishedTopLevelCatalogListingWhere()).toEqual({
      status: Status.published,
      deletedAt: null,
      parentId: null,
      scholar: { isActive: true },
    });
  });

  it('does not decide domain-specific format, title, or topic policy', () => {
    const where = publishedTopLevelCatalogListingWhere();

    expect(where).not.toHaveProperty('format');
    expect(where).not.toHaveProperty('scholar.title');
    expect(where).not.toHaveProperty('topics');
  });
});
