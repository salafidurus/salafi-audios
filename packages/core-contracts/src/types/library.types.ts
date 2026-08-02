import { z } from "zod";

import { LocaleSchema } from "./localization.types";

export const LibraryItemDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingTitle: z.string(),
  listingSlug: z.string(),
  scholarId: z.string(),
  scholarSlug: z.string(),
  scholarName: z.string(),
  seriesTitle: z.string().optional(),
  durationSeconds: z.number().optional(),
  savedAt: z.string().optional(),
  completedAt: z.string().optional(),
  progressSeconds: z.number().optional(),
  /** Lesson-count rollup for a series/collection entry (e.g. "3 of 5 lessons"). Absent for a standalone lecture. */
  completedLeafCount: z.number().optional(),
  totalLeafCount: z.number().optional(),
  originalLanguage: LocaleSchema.optional(),
  /** Original-language listing title, set only when `listingTitle` is translated. */
  originalListingTitle: z.string().optional(),
});
export type LibraryItemDto = z.infer<typeof LibraryItemDtoSchema>;

export const LibraryPageDtoSchema = z.object({
  items: z.array(LibraryItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type LibraryPageDto = z.infer<typeof LibraryPageDtoSchema>;

export const SavedSyncItemDtoSchema = z.object({
  listingId: z.string(),
  saved: z.boolean(),
  updatedAt: z.string(),
});
export type SavedSyncItemDto = z.infer<typeof SavedSyncItemDtoSchema>;

export const SavedSyncDtoSchema = z.object({
  items: z.array(SavedSyncItemDtoSchema),
});
export type SavedSyncDto = z.infer<typeof SavedSyncDtoSchema>;

/** One row of `GET /me/library/saved/delta` — includes tombstones (`deletedAt` set) so a
 * client can reconcile removals, not just additions, since the given cursor. */
export const SavedDeltaItemDtoSchema = z.object({
  listingId: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
  savedAt: z.string().optional(),
});
export type SavedDeltaItemDto = z.infer<typeof SavedDeltaItemDtoSchema>;
