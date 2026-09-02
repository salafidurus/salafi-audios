import { z } from "zod";

import { LocaleSchema } from "./localization.types";
import { ScholarTitleSchema } from "./scholar.types";

/** Personal saved, completed, and progress-backed library response contracts. */
/** A personal library row combining catalog identity with saved and progress state. */
/** Defines the runtime contract value for my library item dto schema. */
export const MyLibraryItemDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingTitle: z.string(),
  listingSlug: z.string(),
  scholarId: z.string(),
  scholarSlug: z.string(),
  scholarName: z.string(),
  scholarTitle: ScholarTitleSchema.optional(),
  seriesTitle: z.string().optional(),
  coverImageUrl: z.string().optional(),
  scholarImageUrl: z.string().optional(),
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
/** Validated personal library item response. */
export type MyLibraryItemDto = z.infer<typeof MyLibraryItemDtoSchema>;

/** Cursor-paginated personal library response. */
export const MyLibraryPageDtoSchema = z.object({
  items: z.array(MyLibraryItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
/** Validated cursor-paginated personal library response. */
export type MyLibraryPageDto = z.infer<typeof MyLibraryPageDtoSchema>;

/** One saved-state change used to reconcile a client's local library. */
export const SavedSyncItemDtoSchema = z.object({
  listingId: z.string(),
  saved: z.boolean(),
  updatedAt: z.string(),
});
/** Validated saved-state synchronization item. */
export type SavedSyncItemDto = z.infer<typeof SavedSyncItemDtoSchema>;

/** Batch of saved-state changes returned by synchronization. */
export const SavedSyncDtoSchema = z.object({
  items: z.array(SavedSyncItemDtoSchema),
});
/** Validated saved-state synchronization response. */
export type SavedSyncDto = z.infer<typeof SavedSyncDtoSchema>;

/** One row of `GET /me/my-library/saved/delta` — includes tombstones (`deletedAt` set) so a
 * client can reconcile removals, not just additions, since the given cursor. */
export const SavedDeltaItemDtoSchema = z.object({
  listingId: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
  savedAt: z.string().optional(),
});
/** Validated saved-state delta item, including optional removal tombstones. */
export type SavedDeltaItemDto = z.infer<typeof SavedDeltaItemDtoSchema>;
