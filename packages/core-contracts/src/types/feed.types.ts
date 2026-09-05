import { z } from "zod";

import { HomePromotionListingDtoSchema, type HomePromotionListingDto } from "./home.types";
import { ScholarListItemDtoSchema, type ScholarListItemDto } from "./scholar.types";

/** Numeric wire version that lets clients select the matching recommendation parser. */
/** Defines the runtime wire-version value for Explore recommendation responses. */
export const ExploreRecommendationSchemaVersion = 1 as const;

/** Discovery-feed item, branch, and pagination contracts returned by the public catalog API. */
/** Defines the runtime contract value for feed content item dto schema. */
export const FeedContentItemDtoSchema = HomePromotionListingDtoSchema;
/** Defines the contract type for feed content item dto. */
export type FeedContentItemDto = HomePromotionListingDto;

/** Semantic title context for the default deterministic listings recommendation. */
export const ExploreDefaultListingsTitleContextDtoSchema = z.object({
  kind: z.literal("listings"),
  id: z.literal("recent"),
  label: z.string().min(1),
});
/** Display-ready title context for an unfiltered recent-listings batch. */
export type ExploreDefaultListingsTitleContextDto = z.infer<
  typeof ExploreDefaultListingsTitleContextDtoSchema
>;

/** Semantic title context for listings recommended through a selected topic. */
export const ExploreTopicListingsTitleContextDtoSchema = z.object({
  kind: z.literal("topic_listings"),
  topicSlug: z.string().min(1),
  label: z.string().min(1),
});
/** Display-ready title context identifying the topic steering the batch. */
export type ExploreTopicListingsTitleContextDto = z.infer<
  typeof ExploreTopicListingsTitleContextDtoSchema
>;

/** Approved title contexts for the listings batch in ticket 898. */
export const ExploreListingsTitleContextDtoSchema = z.discriminatedUnion("kind", [
  ExploreDefaultListingsTitleContextDtoSchema,
  ExploreTopicListingsTitleContextDtoSchema,
]);
/** Closed title-context union supported by the initial recommendation response. */
export type ExploreListingsTitleContextDto = z.infer<typeof ExploreListingsTitleContextDtoSchema>;

/** A semantic, ordered listings recommendation batch. */
export const ExploreListingsBatchDtoSchema = z.object({
  kind: z.literal("listings"),
  id: z.string().min(1),
  title: ExploreListingsTitleContextDtoSchema,
  reason: z.literal("deterministic_recent"),
  items: z.array(FeedContentItemDtoSchema),
});
/** Ordered listings and the semantic context explaining their recommendation module. */
export type ExploreListingsBatchDto = z.infer<typeof ExploreListingsBatchDtoSchema>;

/** Semantic title context for the initial senior-scholar recommendation. */
export const ExploreSeniorScholarsTitleContextDtoSchema = z.object({
  kind: z.literal("scholars"),
  id: z.literal("senior_scholars"),
  label: z.string().min(1),
});
/** Display-ready title context identifying the senior scholars recommendation. */
export type ExploreSeniorScholarsTitleContextDto = z.infer<
  typeof ExploreSeniorScholarsTitleContextDtoSchema
>;

/** Display-ready scholar projection used by the Explore recommendation batch. */
export const ExploreScholarItemDtoSchema = ScholarListItemDtoSchema;
/** Scholar identity, localized name, image, title, and catalog summary for Explore. */
export type ExploreScholarItemDto = ScholarListItemDto;

/** A semantic, ordered senior-scholar recommendation batch. */
export const ExploreScholarsBatchDtoSchema = z.object({
  kind: z.literal("scholars"),
  id: z.string().min(1),
  title: ExploreSeniorScholarsTitleContextDtoSchema,
  reason: z.literal("deterministic_senior_scholars"),
  items: z.array(ExploreScholarItemDtoSchema),
});
/** Ordered senior scholars with recommendation-owned eligibility and ranking. */
export type ExploreScholarsBatchDto = z.infer<typeof ExploreScholarsBatchDtoSchema>;

/** Versioned public response for the Explore recommendation sequence. */
export const FeedPageDtoSchema = z.object({
  schemaVersion: z.literal(ExploreRecommendationSchemaVersion),
  batches: z.array(
    z.discriminatedUnion("kind", [ExploreListingsBatchDtoSchema, ExploreScholarsBatchDtoSchema]),
  ),
  nextCursor: z.string().optional(),
  exhausted: z.boolean(),
});
/** Defines the contract type for feed page dto. */
export type FeedPageDto = z.infer<typeof FeedPageDtoSchema>;
