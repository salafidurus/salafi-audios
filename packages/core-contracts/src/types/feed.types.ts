import { z } from "zod";
import { ScholarChipDtoSchema, ContentSuggestionDtoSchema } from "./home.types";
import { ListingFormatSchema } from "./listing.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";

export const FeedContentItemDtoSchema = z.object({
  kind: ListingFormatSchema,
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  thumbnailUrl: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  publishedAt: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type FeedContentItemDto = z.infer<typeof FeedContentItemDtoSchema>;

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
});
export type FeedPageDto = z.infer<typeof FeedPageDtoSchema>;
