import { z } from "zod";
import { ListingFormatSchema } from "./listing.types";
import {
  ContentOriginalFieldsSchema,
  LocaleSchema,
  ScholarOriginalFieldsSchema,
} from "./localization.types";

export const ScholarChipDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  originalLanguage: LocaleSchema.optional(),
  original: ScholarOriginalFieldsSchema.optional(),
});
export type ScholarChipDto = z.infer<typeof ScholarChipDtoSchema>;

export const ContentSuggestionDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  kind: ListingFormatSchema,
  scholarName: z.string(),
  scholarSlug: z.string(),
  thumbnailUrl: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type ContentSuggestionDto = z.infer<typeof ContentSuggestionDtoSchema>;

export const RecentProgressDtoSchema = z.object({
  lectureId: z.string(),
  lectureTitle: z.string(),
  lectureSlug: z.string(),
  scholarName: z.string(),
  durationSeconds: z.number(),
  positionSeconds: z.number(),
});
export type RecentProgressDto = z.infer<typeof RecentProgressDtoSchema>;

export const QuickBrowseDtoSchema = z.object({
  scholars: z.array(ScholarChipDtoSchema),
  suggestions: z.array(ContentSuggestionDtoSchema),
  recentProgress: RecentProgressDtoSchema.nullable(),
});
export type QuickBrowseDto = z.infer<typeof QuickBrowseDtoSchema>;
