import { Status } from '@sd/core-db';
import type { Prisma } from '@sd/core-db';

/**
 * The public Catalog identity rule: a route value resolves exactly one
 * Listing, by its public slug, only when that Listing is published and not
 * deleted. Route values are never matched against internal IDs — an
 * ID-shaped value simply matches no slug and resolves as not found.
 */
export function publishedListingSlugWhere(slug: string): Prisma.ListingWhereInput {
  return { slug, deletedAt: null, status: Status.published };
}
