import { z } from "zod";

import {
  ContentSuggestionDtoSchema,
  HomePromotionListingDtoSchema,
  ScholarChipDtoSchema,
  type HomePromotionListingDto,
} from "./home.types";

/** Discovery-feed item, branch, and pagination contracts returned by the public catalog API. */
/** Defines the runtime contract value for feed content item dto schema. */
export const FeedContentItemDtoSchema = HomePromotionListingDtoSchema;
/** Defines the contract type for feed content item dto. */
export type FeedContentItemDto = HomePromotionListingDto;

/** Defines the runtime contract value for feed scholar row dto schema. */
export const FeedScholarRowDtoSchema = z.object({
  kind: z.literal("scholar_row"),
  scholars: z.array(ScholarChipDtoSchema),
});
/** Defines the contract type for feed scholar row dto. */
export type FeedScholarRowDto = z.infer<typeof FeedScholarRowDtoSchema>;

/** Defines the runtime contract value for feed topic row dto schema. */
export const FeedTopicRowDtoSchema = z.object({
  kind: z.literal("topic_row"),
  topicName: z.string(),
  items: z.array(ContentSuggestionDtoSchema),
});
/** Defines the contract type for feed topic row dto. */
export type FeedTopicRowDto = z.infer<typeof FeedTopicRowDtoSchema>;

/** Defines the runtime contract value for feed item dto schema. */
export const FeedItemDtoSchema = z.union([
  FeedContentItemDtoSchema,
  FeedScholarRowDtoSchema,
  FeedTopicRowDtoSchema,
]);
/** Defines the contract type for feed item dto. */
export type FeedItemDto = z.infer<typeof FeedItemDtoSchema>;

/** Defines the runtime contract value for feed page dto schema. */
export const FeedPageDtoSchema = z.object({
  items: z.array(FeedItemDtoSchema),
  nextCursor: z.string().optional(),
  exhausted: z.boolean(),
});
/** Defines the contract type for feed page dto. */
export type FeedPageDto = z.infer<typeof FeedPageDtoSchema>;
