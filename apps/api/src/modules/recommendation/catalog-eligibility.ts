import { Prisma, Status } from '@sd/core-db';

/**
 * Returns the Catalog Listing predicates shared by public recommendation
 * domains. Callers must add their own format, title, topic, ordering, and
 * continuation rules; this policy only describes publication visibility and
 * the active top-level Scholar relationship.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding TSDoc documents the shared policy boundary.
export function publishedTopLevelCatalogListingWhere(): Prisma.ListingWhereInput {
  return {
    status: Status.published,
    deletedAt: null,
    parentId: null,
    scholar: { isActive: true },
  };
}
