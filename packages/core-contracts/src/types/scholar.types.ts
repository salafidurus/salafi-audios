import { z } from "zod";
import {
  ContentOriginalFieldsSchema,
  LocaleSchema,
  ScholarOriginalFieldsSchema,
} from "./localization.types";

export const ScholarContentItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  type: z.enum(["collection", "series", "single"]),
  recencyAt: z.string(),
  coverImageUrl: z.string().optional(),
  lectureCount: z.number().optional(),
  durationSeconds: z.number().optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type ScholarContentItemDto = z.infer<typeof ScholarContentItemDtoSchema>;

export const ScholarContentUnifiedDtoSchema = z.object({
  items: z.array(ScholarContentItemDtoSchema),
});
export type ScholarContentUnifiedDto = z.infer<typeof ScholarContentUnifiedDtoSchema>;

export const ScholarViewDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  isKibar: z.boolean(),
});
export type ScholarViewDto = z.infer<typeof ScholarViewDtoSchema>;

export const ScholarDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  country: z.string().optional(),
  mainLanguage: LocaleSchema.optional(),
  /** Language the original (untranslated) name/bio are written in. */
  originalLanguage: LocaleSchema.optional(),
  /** Original-language fields, set only when `name`/`bio` are translated. */
  original: ScholarOriginalFieldsSchema.optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  isKibar: z.boolean(),
  socialTwitter: z.string().optional(),
  socialTelegram: z.string().optional(),
  socialYoutube: z.string().optional(),
  socialWebsite: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type ScholarDetailDto = z.infer<typeof ScholarDetailDtoSchema>;

export const ScholarStatsDtoSchema = z.object({
  seriesCount: z.number(),
  lecturesCount: z.number(),
  followerCount: z.number(),
  collectionsCount: z.number(),
  seriesListingCount: z.number(),
  singlesCount: z.number(),
});
export type ScholarStatsDto = z.infer<typeof ScholarStatsDtoSchema>;

export const ScholarListItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
  mainLanguage: LocaleSchema.optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ScholarOriginalFieldsSchema.optional(),
  isKibar: z.boolean(),
  lectureCount: z.number(),
});
export type ScholarListItemDto = z.infer<typeof ScholarListItemDtoSchema>;

export const CollectionSummaryDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  coverImageUrl: z.string().optional(),
  lectureCount: z.number(),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type CollectionSummaryDto = z.infer<typeof CollectionSummaryDtoSchema>;

export const SeriesSummaryDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  coverImageUrl: z.string().optional(),
  lectureCount: z.number(),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type SeriesSummaryDto = z.infer<typeof SeriesSummaryDtoSchema>;

/** Summary of a Single (a standalone Lecture), as shown in a scholar's Catalog. */
export const SingleSummaryDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  durationSeconds: z.number().optional(),
  publishedAt: z.string().optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type SingleSummaryDto = z.infer<typeof SingleSummaryDtoSchema>;

export const ScholarTopicsDtoSchema = z.object({
  topics: z.array(
    z.object({
      topicId: z.string(),
      topicName: z.string(),
      items: z.array(ScholarContentItemDtoSchema),
    }),
  ),
});
export type ScholarTopicsDto = z.infer<typeof ScholarTopicsDtoSchema>;
