import type { Metadata } from "next";

import { endpoints, type ListingDetailDto } from "@sd/core-contracts";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

import { getApiBaseUrl } from "@/core/config/env";
import { ListingDetailScreen } from "@/features/details/screens/listing-detail/listing-detail.screen";

/** Documents this module's responsibility and public boundary. */
const ListingDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  coverImageUrl: z.string().optional(),
  publishedLectureCount: z.number().optional(),
  publishedDurationSeconds: z.number().optional(),
  rootListing: z
    .object({
      slug: z.string(),
    })
    .nullable()
    .optional(),
});

const fetchListingDetail = cache(async (slug: string): Promise<ListingDetailDto | null> => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}${endpoints.listings.detail(slug)}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    // SAFETY: ListingDetailSchema validates the network payload before it is treated as the DTO shape.
    return ListingDetailSchema.parse(await res.json()) as ListingDetailDto;
  } catch {
    return null;
  }
});

/** Resolves listing metadata through the canonical versioned application API. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    /** Public listing slug used by the API detail endpoint. */
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await fetchListingDetail(slug);
  return {
    title: listing?.title ?? `Content ${slug}`,
    description: listing?.description ?? "View content details.",
  };
}

/** Renders listing content and redirects child listings to their root context. */
export default async function ListingPage({
  params,
}: {
  params: Promise<{
    /** Public listing slug used to load the detail surface. */
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const listing = await fetchListingDetail(slug);

  // Slugs are flat and don't encode nesting, so a Lesson/Module's own slug
  // resolves to itself — redirect to the top-level page it belongs under,
  // anchored to this item so the parent page can scroll to and highlight it.
  // Done server-side so there's no client flash of the wrong content.
  if (listing?.rootListing) {
    redirect(`/listings/${listing.rootListing.slug}#${listing.id}`);
  }

  return <ListingDetailScreen slug={slug} />;
}
