import { z } from "zod";

import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";
import { ScholarTitleSchema } from "./scholar.types";

/** Search and quick-browse request and response contracts for public catalog discovery. */
/** Defines the runtime contract value for search catalog params schema. */
export const SearchCatalogParamsSchema = z.object({
  q: z.string().optional(),
  limit: z.number().optional(),
  language: z.string().optional(),
  topicSlug: z.string().optional(),
  topicSlugs: z.array(z.string()).optional(),
  scholarSlug: z.string().optional(),
  format: z.string().optional(),
});
/** Defines the contract type for search catalog params. */
export type SearchCatalogParams = z.infer<typeof SearchCatalogParamsSchema>;

/** Defines the runtime contract value for search catalog item dto schema. */
export const SearchCatalogItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  scholarTitle: ScholarTitleSchema.optional(),
  coverImageUrl: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  lectureCount: z.number(),
  durationSeconds: z.number().optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
/** Defines the contract type for search catalog item dto. */
export type SearchCatalogItemDto = z.infer<typeof SearchCatalogItemDtoSchema>;

/** Defines the runtime contract value for search catalog results dto schema. */
export const SearchCatalogResultsDtoSchema = z.object({
  collections: z.array(SearchCatalogItemDtoSchema),
  series: z.array(SearchCatalogItemDtoSchema),
  singles: z.array(SearchCatalogItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean().optional(),
});
/** Defines the contract type for search catalog results dto. */
export type SearchCatalogResultsDto = z.infer<typeof SearchCatalogResultsDtoSchema>;

/** Defines the runtime contract value for search query dto schema. */
export const SearchQueryDtoSchema = z.object({
  q: z.string().optional(),
  language: z.string().optional(),
  topicSlug: z.string().optional(),
  topicSlugs: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return Array.isArray(val) ? val : [val];
    }, z.array(z.string()))
    .optional(),
  scholarSlug: z.string().optional(),
  format: z.string().optional(),
  cursor: z.string().optional(),
  limit: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().int().min(1).max(30))
    .optional(),
});
/** Defines the contract type for search query dto. */
export type SearchQueryDto = z.infer<typeof SearchQueryDtoSchema>;
