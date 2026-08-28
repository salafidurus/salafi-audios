import { z } from "zod";

import {
  ContentSuggestionDtoSchema,
  HomePromotionListingDtoSchema,
  ScholarChipDtoSchema,
  type HomePromotionListingDto,
} from "./home.types";

/** Discovery-feed item, branch, and pagination contracts returned by the public catalog API. */
export const FeedContentItemDtoSchema = HomePromotionListingDtoSchema;
export type FeedContentItemDto = HomePromotionListingDto;

export const FeedScholarRowDtoSchema = z.object({
  kind: z.literal("scholar_row"),
  scholars: z.array(ScholarChipDtoSchema),
});
export type FeedScholarRowDto = z.infer<typeof FeedScholarRowDtoSchema>;

export const FeedTopicRowDtoSchema = z.object({
  kind: z.literal("topic_row"),
  topicName: z.string(),
  items: z.array(ContentSuggestionDtoSchema),
});
export type FeedTopicRowDto = z.infer<typeof FeedTopicRowDtoSchema>;

export const FeedItemDtoSchema = z.union([
  FeedContentItemDtoSchema,
  FeedScholarRowDtoSchema,
  FeedTopicRowDtoSchema,
]);
export type FeedItemDto = z.infer<typeof FeedItemDtoSchema>;

export const FeedPageDtoSchema = z.object({
  items: z.array(FeedItemDtoSchema),
  nextCursor: z.string().optional(),
  exhausted: z.boolean(),
});
export type FeedPageDto = z.infer<typeof FeedPageDtoSchema>;
