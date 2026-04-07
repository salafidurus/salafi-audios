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
  type ScholarRefDto,
  type TopicRefDto,
  type AudioAssetDto,
  type LectureRefDto,
  type SeriesContextDto,
  type LectureDetailDto,
  type ScholarViewDto,
  type ScholarDetailDto,
  type ScholarStatsDto,
  type ScholarListItemDto,
  type ScholarContentDto,
  type CollectionSummaryDto,
  type SeriesSummaryDto,
  type LectureSummaryDto,
  type CollectionViewDto,
  type SeriesViewDto,
  type PlatformStatsDto,
  type SearchCatalogParams,
  type SearchCatalogItemDto,
  type SearchCatalogResultsDto,
  type FeedItemDto,
  type FeedPageDto,
  type LibraryItemDto,
  type LibraryPageDto,
  type ProgressSyncItemDto,
  type ProgressSyncDto,
  type SavedSyncDto,
  type UserProfileDto,
  type LiveSessionStatus,
  type LiveSessionPublicDto,
  type LiveSessionDeltaDto,
  type LiveSessionDto,
  type LiveSessionPageDto,
  type LectureProgressDto,
  type ProgressUpdateDto,
  type AdminPermission,
  type AdminPermissionDto,
  type AdminPermissionsListDto,
  type GrantPermissionDto,
  ADMIN_PERMISSIONS,
} from "./types";

// Export route constants
export { routes } from "./routes";

// Export query utilities (client, keys, hooks)
export { createQueryClient, queryKeys } from "./query";
export { useApiQuery, initApiClient } from "./query/hooks";
