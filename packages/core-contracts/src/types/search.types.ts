import { z } from "zod";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";

export const SearchCatalogParamsSchema = z.object({
  q: z.string(),
  limit: z.number().optional(),
  language: z.string().optional(),
  topicSlug: z.string().optional(),
  topicSlugs: z.array(z.string()).optional(),
  scholarSlug: z.string().optional(),
});
export type SearchCatalogParams = z.infer<typeof SearchCatalogParamsSchema>;

export const SearchCatalogItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  coverImageUrl: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  lectureCount: z.number(),
  durationSeconds: z.number().optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
});
export type SearchCatalogItemDto = z.infer<typeof SearchCatalogItemDtoSchema>;

export const SearchCatalogResultsDtoSchema = z.object({
  collections: z.array(SearchCatalogItemDtoSchema),
  series: z.array(SearchCatalogItemDtoSchema),
  singles: z.array(SearchCatalogItemDtoSchema),
});
export type SearchCatalogResultsDto = z.infer<typeof SearchCatalogResultsDtoSchema>;
