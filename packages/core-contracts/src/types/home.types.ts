import { z } from "zod";

import { ListingFormatSchema, RootListingDtoSchema, SeriesContextDtoSchema } from "./listing.types";
import {
  ContentOriginalFieldsSchema,
  LocaleSchema,
  ScholarOriginalFieldsSchema,
} from "./localization.types";
import { ScholarTitleSchema } from "./scholar.types";

/** Home-surface promotion, suggestion, and recent-progress response contracts. */
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

export const HomePromotionListingDtoSchema = z.object({
  kind: ListingFormatSchema,
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  scholarTitle: ScholarTitleSchema.optional(),
  scholarImageUrl: z.string().optional(),
  thumbnailUrl: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  publishedLectureCount: z.number().optional(),
  publishedAt: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type HomePromotionListingDto = z.infer<typeof HomePromotionListingDtoSchema>;

export const HomePromotionHeroDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  headline: z.string(),
  listing: HomePromotionListingDtoSchema,
});
export type HomePromotionHeroDto = z.infer<typeof HomePromotionHeroDtoSchema>;

export const HomePromotionPickDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listing: HomePromotionListingDtoSchema,
});
export type HomePromotionPickDto = z.infer<typeof HomePromotionPickDtoSchema>;

export const HomePromotionsDtoSchema = z.object({
  hero: HomePromotionHeroDtoSchema.nullable(),
  editorsPicks: z.array(HomePromotionPickDtoSchema),
});
export type HomePromotionsDto = z.infer<typeof HomePromotionsDtoSchema>;

export const RecentProgressDtoSchema = z.object({
  lectureTitle: z.string(),
  lectureSlug: z.string(),
  listingSlug: z.string(),
  format: ListingFormatSchema,
  orderIndex: z.number().optional(),
  publishedLectureCount: z.number().optional(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  durationSeconds: z.number(),
  positionSeconds: z.number(),
  artworkUrl: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  seriesContext: SeriesContextDtoSchema.nullable().optional(),
  rootListing: RootListingDtoSchema.nullable().optional(),
  rootFormat: ListingFormatSchema.optional(),
});
export type RecentProgressDto = z.infer<typeof RecentProgressDtoSchema>;

export const QuickBrowseDtoSchema = z.object({
  scholars: z.array(ScholarChipDtoSchema),
  suggestions: z.array(ContentSuggestionDtoSchema),
  recentProgress: RecentProgressDtoSchema.nullable(),
});
export type QuickBrowseDto = z.infer<typeof QuickBrowseDtoSchema>;
