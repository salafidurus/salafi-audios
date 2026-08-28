import { z } from "zod";

/** Listening-progress and synchronization contracts keyed by stable public listing identity. */
/** Persisted listening position and completion projection for a public listing. */
export const ListingProgressDtoSchema = z.object({
  listingSlug: z.string(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
/** Validated persisted listening-progress response. */
export type ListingProgressDto = z.infer<typeof ListingProgressDtoSchema>;

/** Client intent to update a listing's current listening position. */
export const ProgressUpdateDtoSchema = z.object({
  listingSlug: z.string().min(1, "Listing slug must not be empty"),
  positionSeconds: z.number().min(0, "Position must be non-negative"),
  durationSeconds: z.number().min(0, "Duration must be non-negative"),
});
/** Validated listening-progress update request. */
export type ProgressUpdateDto = z.infer<typeof ProgressUpdateDtoSchema>;
