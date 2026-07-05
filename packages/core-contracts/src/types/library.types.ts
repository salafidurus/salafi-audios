import { z } from "zod";
import { LocaleSchema } from "./localization.types";

export const LibraryItemDtoSchema = z.object({
  id: z.string(),
  lectureId: z.string(),
  lectureTitle: z.string(),
  lectureSlug: z.string(),
  scholarId: z.string(),
  scholarSlug: z.string(),
  scholarName: z.string(),
  seriesTitle: z.string().optional(),
  durationSeconds: z.number().optional(),
  savedAt: z.string().optional(),
  completedAt: z.string().optional(),
  progressSeconds: z.number().optional(),
  originalLanguage: LocaleSchema.optional(),
  /** Original-language lecture title, set only when `lectureTitle` is translated. */
  originalLectureTitle: z.string().optional(),
});
export type LibraryItemDto = z.infer<typeof LibraryItemDtoSchema>;

export const LibraryPageDtoSchema = z.object({
  items: z.array(LibraryItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type LibraryPageDto = z.infer<typeof LibraryPageDtoSchema>;

export const SavedSyncDtoSchema = z.object({
  lectureIds: z.array(z.string()),
});
export type SavedSyncDto = z.infer<typeof SavedSyncDtoSchema>;
