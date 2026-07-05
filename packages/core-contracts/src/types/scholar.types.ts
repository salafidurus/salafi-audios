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

export const CreateScholarDtoSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
  slug: z.string().min(1, "Slug must not be empty"),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  isKibar: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export type CreateScholarDto = z.infer<typeof CreateScholarDtoSchema>;

export const UpdateScholarDtoSchema = CreateScholarDtoSchema.partial();
export type UpdateScholarDto = z.infer<typeof UpdateScholarDtoSchema>;

export const SaveScholarTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, "Name must not be empty"),
  bio: z.string().nullable().optional(),
});
export type SaveScholarTranslationDto = z.infer<typeof SaveScholarTranslationDtoSchema>;

export const UpdateScholarTranslationDtoSchema = z.object({
  name: z.string().optional(),
  bio: z.string().nullable().optional(),
});
export type UpdateScholarTranslationDto = z.infer<typeof UpdateScholarTranslationDtoSchema>;

export const CreateCollectionDtoSchema = z.object({
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CreateCollectionDto = z.infer<typeof CreateCollectionDtoSchema>;

export const UpdateCollectionDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type UpdateCollectionDto = z.infer<typeof UpdateCollectionDtoSchema>;

export const SaveCollectionTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().nullable().optional(),
});
export type SaveCollectionTranslationDto = z.infer<typeof SaveCollectionTranslationDtoSchema>;

export const UpdateCollectionTranslationDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
});
export type UpdateCollectionTranslationDto = z.infer<typeof UpdateCollectionTranslationDtoSchema>;

export const SaveSeriesTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().nullable().optional(),
});
export type SaveSeriesTranslationDto = z.infer<typeof SaveSeriesTranslationDtoSchema>;

export const UpdateSeriesTranslationDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
});
export type UpdateSeriesTranslationDto = z.infer<typeof UpdateSeriesTranslationDtoSchema>;

export const CreateSeriesDtoSchema = z.object({
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CreateSeriesDto = z.infer<typeof CreateSeriesDtoSchema>;

export const UpdateSeriesDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type UpdateSeriesDto = z.infer<typeof UpdateSeriesDtoSchema>;
