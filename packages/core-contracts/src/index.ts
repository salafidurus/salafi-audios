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
  type RelatedLectureDto,
  type AdminLectureUpdateDto,
  type AdminLectureActionDto,
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
  type LivestreamChannelDto,
  type CreateLivestreamChannelDto,
  type UpdateLivestreamChannelDto,
  type CreateLiveSessionDto,
  type UpdateLiveSessionDto,
  type StreamResponseDto,
  type AudioProgressDto,
  type AdminPermission,
  type AdminPermissionDto,
  type AdminPermissionsListDto,
  type GrantPermissionDto,
  ADMIN_PERMISSIONS,
} from "./types";

// Export home types
export type {
  ScholarChipDto,
  ContentSuggestionDto,
  RecentProgressDto,
  QuickBrowseDto,
} from "./types";

// Export route constants
export { routes, routeAuth, routeAuthOverrides, getEffectiveAuthMode } from "./routes";
export type { RouteAuthMode } from "./routes";

// Export query utilities (client, keys, hooks)
export { createQueryClient, queryKeys } from "./query";
export { useApiQuery, initApiClient } from "./query/hooks";

export {
  type TranslationStatus,
  type TranslationViewDto,
  type SaveTranslationDto,
  type TranslationTarget,
  type UpdateLocaleDto,
} from "./types/translation.types";

export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  RTL_LOCALES,
  type Locale,
} from "./types/localization.types";
