import { z } from "zod";

import { CountryCodeSchema } from "./country.types";
import {
  ContentOriginalFieldsSchema,
  LocaleSchema,
  ScholarOriginalFieldsSchema,
} from "./localization.types";
import { TranslationViewDtoSchema } from "./translation.types";

/** Scholar identity, profile, catalog-summary, and statistics contracts. */
/** Allowed honorifics used when presenting a scholar's name. */
/** Defines the runtime contract value for scholar title schema. */
export const ScholarTitleSchema = z.enum(["allamah", "sheikh", "ustadh", "akh"]);
/** Scholar honorific union inferred from {@link ScholarTitleSchema}. */
export type ScholarTitle = z.infer<typeof ScholarTitleSchema>;

/** Scholar-associated catalog item shown in content listings. */
export const ScholarContentItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  type: z.enum(["collection", "series", "single"]),
  recencyAt: z.string(),
  coverImageUrl: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  lectureCount: z.number().optional(),
  durationSeconds: z.number().optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
/** Validated scholar content-list item. */
export type ScholarContentItemDto = z.infer<typeof ScholarContentItemDtoSchema>;

/** Unified collection of catalog items associated with a scholar. */
export const ScholarContentUnifiedDtoSchema = z.object({
  items: z.array(ScholarContentItemDtoSchema),
});
/** Validated unified scholar-content response. */
export type ScholarContentUnifiedDto = z.infer<typeof ScholarContentUnifiedDtoSchema>;

/** Compact public scholar projection for catalog cards and lists. */
export const ScholarViewDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  title: ScholarTitleSchema.optional(),
});
/** Validated compact public scholar response. */
export type ScholarViewDto = z.infer<typeof ScholarViewDtoSchema>;

/** Full public scholar profile, including localization and social metadata. */
export const ScholarDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  country: CountryCodeSchema.optional(),
  mainLanguage: LocaleSchema.optional(),
  /** Language the original (untranslated) name/bio are written in. */
  originalLanguage: LocaleSchema.optional(),
  /** Original-language fields, set only when `name`/`bio` are translated. */
  original: ScholarOriginalFieldsSchema.optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  title: ScholarTitleSchema.optional(),
  socialTwitter: z.string().optional(),
  socialTelegram: z.string().optional(),
  socialYoutube: z.string().optional(),
  socialWebsite: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
/** Validated full scholar-detail response. */
export type ScholarDetailDto = z.infer<typeof ScholarDetailDtoSchema>;

/** Content-count and duration aggregates for a scholar detail view. */
export const ScholarDetailStatsSchema = z.object({
  lectureCount: z.number(),
  seriesCount: z.number(),
  collectionCount: z.number(),
  totalDurationSeconds: z.number(),
  totalContentDurationSeconds: z.number(),
});
/** Validated scholar detail statistics. */
export type ScholarDetailStats = z.infer<typeof ScholarDetailStatsSchema>;

/** Broader scholar statistics used by administrative and discovery surfaces. */
export const ScholarStatsDtoSchema = z.object({
  seriesCount: z.number(),
  lecturesCount: z.number(),
  followerCount: z.number(),
  collectionsCount: z.number(),
  seriesListingCount: z.number(),
  singlesCount: z.number(),
});
/** Validated scholar statistics response. */
export type ScholarStatsDto = z.infer<typeof ScholarStatsDtoSchema>;

/** Compact scholar row used in paginated public lists. */
export const ScholarListItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
  mainLanguage: LocaleSchema.optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ScholarOriginalFieldsSchema.optional(),
  title: ScholarTitleSchema.optional(),
  lectureCount: z.number(),
});
/** Validated scholar-list item response. */
export type ScholarListItemDto = z.infer<typeof ScholarListItemDtoSchema>;

/** Compact collection summary associated with a scholar. */
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
/** Validated collection summary response. */
export type CollectionSummaryDto = z.infer<typeof CollectionSummaryDtoSchema>;

/** Compact series summary associated with a scholar. */
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
/** Validated series summary response. */
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
/** Validated standalone-listing summary response. */
export type SingleSummaryDto = z.infer<typeof SingleSummaryDtoSchema>;

/** Topic-grouped content associated with a scholar. */
export const ScholarTopicsDtoSchema = z.object({
  topics: z.array(
    z.object({
      topicId: z.string(),
      topicName: z.string(),
      items: z.array(ScholarContentItemDtoSchema),
    }),
  ),
});
/** Validated scholar-topic response. */
export type ScholarTopicsDto = z.infer<typeof ScholarTopicsDtoSchema>;

/** Administrative request for creating a scholar and its initial profile metadata. */
export const CreateScholarDtoSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
  slug: z.string().min(1, "Slug must not be empty"),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
  isActive: z.boolean().optional(),
  country: CountryCodeSchema.default("SA"),
  mainLanguage: LocaleSchema.default("ar"),
  title: ScholarTitleSchema.optional(),
  orderIndex: z.number().optional(),
  socialTwitter: z.url().optional().or(z.literal("")),
  socialTelegram: z.url().optional().or(z.literal("")),
  socialYoutube: z.url().optional().or(z.literal("")),
  socialWebsite: z.url().optional().or(z.literal("")),
});
/** Validated scholar-creation request. */
export type CreateScholarDto = z.infer<typeof CreateScholarDtoSchema>;

/** Administrative request for partially updating scholar profile metadata. */
export const UpdateScholarDtoSchema = z.object({
  name: z.string().min(1, "Name must not be empty").optional(),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
  isActive: z.boolean().optional(),
  country: CountryCodeSchema.optional(),
  mainLanguage: LocaleSchema.optional(),
  title: ScholarTitleSchema.optional(),
  orderIndex: z.number().optional(),
  socialTwitter: z.url().optional().or(z.literal("")),
  socialTelegram: z.url().optional().or(z.literal("")),
  socialYoutube: z.url().optional().or(z.literal("")),
  socialWebsite: z.url().optional().or(z.literal("")),
});
/** Validated scholar-update request. */
export type UpdateScholarDto = z.infer<typeof UpdateScholarDtoSchema>;

/** Administrative request for creating a scholar translation. */
export const SaveScholarTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, "Name must not be empty"),
  bio: z.string().nullable().optional(),
});
/** Validated scholar-translation creation request. */
export type SaveScholarTranslationDto = z.infer<typeof SaveScholarTranslationDtoSchema>;

/** Administrative request for updating an existing scholar translation. */
export const UpdateScholarTranslationDtoSchema = z.object({
  name: z.string().optional(),
  bio: z.string().nullable().optional(),
});
/** Validated scholar-translation update request. */
export type UpdateScholarTranslationDto = z.infer<typeof UpdateScholarTranslationDtoSchema>;

/** Scholar editing payload combining the base record with available translations. */
export const ScholarFormDataDtoSchema = z.object({
  scholar: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    bio: z.string().optional(),
    imageUrl: z.string().optional(),
    country: CountryCodeSchema.optional(),
    mainLanguage: LocaleSchema.optional(),
    isActive: z.boolean(),
    title: ScholarTitleSchema.optional(),
    orderIndex: z.number().default(999),
    socialTwitter: z.string().optional(),
    socialTelegram: z.string().optional(),
    socialYoutube: z.string().optional(),
    socialWebsite: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
  translations: z.array(TranslationViewDtoSchema),
});
/** Validated scholar form-data response. */
export type ScholarFormDataDto = z.infer<typeof ScholarFormDataDtoSchema>;

/** Defines the runtime contract value for admin scholar translation schema. */
const AdminScholarTranslationSchema = z.object({
  locale: LocaleSchema,
  name: z.string(),
  status: z.enum(["draft", "published"]),
});

/** Administrative scholar row with editorial and translation metadata. */
export const AdminScholarListItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  bio: z.string().optional(),
  country: CountryCodeSchema.optional(),
  mainLanguage: LocaleSchema.optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  title: ScholarTitleSchema.optional(),
  orderIndex: z.number().default(999),
  socialTwitter: z.string().optional(),
  socialTelegram: z.string().optional(),
  socialYoutube: z.string().optional(),
  socialWebsite: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  translations: z.array(AdminScholarTranslationSchema),
});
/** Validated administrative scholar-list item. */
export type AdminScholarListItemDto = z.infer<typeof AdminScholarListItemDtoSchema>;

/** Cursor-paginated administrative scholar list. */
export const AdminScholarListDtoSchema = z.object({
  items: z.array(AdminScholarListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
/** Validated administrative scholar-list response. */
export type AdminScholarListDto = z.infer<typeof AdminScholarListDtoSchema>;

/** Cursor-paginated public scholar list. */
export const ScholarListDtoSchema = z.object({
  scholars: z.array(ScholarListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
/** Validated public scholar-list response. */
export type ScholarListDto = z.infer<typeof ScholarListDtoSchema>;
