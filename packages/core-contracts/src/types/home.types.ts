import { z } from "zod";

import { ListingFormatSchema, RootListingDtoSchema, SeriesContextDtoSchema } from "./listing.types";
import {
  ContentOriginalFieldsSchema,
  LocaleSchema,
  ScholarOriginalFieldsSchema,
} from "./localization.types";
import { ScholarTitleSchema } from "./scholar.types";

/** Home-surface promotion, suggestion, and recent-progress response contracts. */
/** Defines the runtime contract value for scholar chip dto schema. */
export const ScholarChipDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  originalLanguage: LocaleSchema.optional(),
  original: ScholarOriginalFieldsSchema.optional(),
  lectureCount: z.number().optional(),
  seriesCount: z.number().optional(),
  topicSlugs: z.array(z.string()).optional(),
});
/** Defines the contract type for scholar chip dto. */
export type ScholarChipDto = z.infer<typeof ScholarChipDtoSchema>;

/** Defines the runtime contract value for content suggestion dto schema. */
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
/** Defines the contract type for content suggestion dto. */
export type ContentSuggestionDto = z.infer<typeof ContentSuggestionDtoSchema>;

/** Defines the runtime contract value for home promotion listing dto schema. */
export const HomePromotionListingDtoSchema = z.object({
  kind: ListingFormatSchema,
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  scholarTitle: ScholarTitleSchema.optional(),
  scholarImageUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  publishedLectureCount: z.number().optional(),
  publishedAt: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
/** Defines the contract type for home promotion listing dto. */
export type HomePromotionListingDto = z.infer<typeof HomePromotionListingDtoSchema>;

/** Defines the runtime contract value for home promotion hero dto schema. */
export const HomePromotionHeroDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  headline: z.string(),
  listing: HomePromotionListingDtoSchema,
});
/** Defines the contract type for home promotion hero dto. */
export type HomePromotionHeroDto = z.infer<typeof HomePromotionHeroDtoSchema>;

/** Defines the runtime contract value for home promotion pick dto schema. */
export const HomePromotionPickDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listing: HomePromotionListingDtoSchema,
});
/** Defines the contract type for home promotion pick dto. */
export type HomePromotionPickDto = z.infer<typeof HomePromotionPickDtoSchema>;

/** Defines the runtime contract value for home promotions dto schema. */
export const HomePromotionsDtoSchema = z.object({
  hero: HomePromotionHeroDtoSchema.nullable(),
  editorsPicks: z.array(HomePromotionPickDtoSchema),
});
/** Defines the contract type for home promotions dto. */
export type HomePromotionsDto = z.infer<typeof HomePromotionsDtoSchema>;

/** Defines the runtime contract value for recent progress dto schema. */
export const RecentProgressDtoSchema = z.object({
  lectureTitle: z.string(),
  lectureSlug: z.string(),
  listingSlug: z.string(),
  format: ListingFormatSchema,
  orderIndex: z.number().optional(),
  publishedLectureCount: z.number().optional(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  scholarTitle: ScholarTitleSchema.optional(),
  durationSeconds: z.number(),
  positionSeconds: z.number(),
  artworkUrl: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  seriesContext: SeriesContextDtoSchema.nullable().optional(),
  rootListing: RootListingDtoSchema.nullable().optional(),
  rootFormat: ListingFormatSchema.optional(),
});
/** Defines the contract type for recent progress dto. */
export type RecentProgressDto = z.infer<typeof RecentProgressDtoSchema>;

/** Defines the runtime contract value for quick browse dto schema. */
export const QuickBrowseDtoSchema = z.object({
  scholars: z.array(ScholarChipDtoSchema),
  suggestions: z.array(ContentSuggestionDtoSchema),
  recentProgress: RecentProgressDtoSchema.nullable(),
});
/** Defines the contract type for quick browse dto. */
export type QuickBrowseDto = z.infer<typeof QuickBrowseDtoSchema>;
