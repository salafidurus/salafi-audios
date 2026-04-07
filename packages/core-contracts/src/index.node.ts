export { httpClient } from "./http";
export type { HttpClientConfig } from "./http";

export { endpoints } from "./endpoints";

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
  type FeedContentItemDto,
  type FeedScholarRowDto,
  type FeedTopicRowDto,
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

export type {
  ScholarChipDto,
  ContentSuggestionDto,
  RecentProgressDto,
  QuickBrowseDto,
} from "./types";

export { routes, routeAuth } from "./routes";
export type { RouteAuthMode } from "./routes";
