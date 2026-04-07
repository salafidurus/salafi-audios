// Export HTTP client
export { httpClient } from "./http";
export type { HttpClientConfig } from "./http";

// Export endpoint constants
export { endpoints } from "./endpoints";

// Export all shared types
export {
  type TopicSlug,
  type TopicViewDto,
  type TopicDetailDto,
  type TopicLectureViewDto,
  type AudioAssetViewDto,
  type LectureViewDto,
  type ScholarViewDto,
  type ScholarDetailDto,
  type ScholarStatsDto,
  type CollectionViewDto,
  type SeriesViewDto,
  type PlatformStatsDto,
  type SearchCatalogParams,
  type SearchCatalogItemDto,
  type SearchCatalogResultsDto,
} from "./types";

// Export route constants
export { routes } from "./routes";

// Export query utilities (client, keys, hooks)
export { createQueryClient, queryKeys } from "./query";
export { useApiQuery, initApiClient } from "./query/hooks";
