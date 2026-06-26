// Export HTTP client
export { httpClient, getApiBaseUrl } from "./http";
export type { HttpClientConfig } from "./http";

// Export endpoint constants
export { endpoints } from "./endpoints";

// Export all shared types
export {
  type StatusValue,
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
  type CreateLectureDto,
  type AdminLectureListItemDto,
  type AdminLectureListDto,
  type AdminLectureDetailDto,
  type BulkActionDto,
  type BulkActionResultDto,
  type ScholarViewDto,
  type ScholarDetailDto,
  type ScholarStatsDto,
  type ScholarListItemDto,
  type ScholarContentItemDto,
  type ScholarContentUnifiedDto,
  type CollectionSummaryDto,
  type SeriesSummaryDto,
  type SingleSummaryDto,
  type ListingFormat,
  type CollectionViewDto,
  type SeriesViewDto,
  type PresignedUrlPurpose,
  type PresignedUrlRequestDto,
  type PresignedUrlResponseDto,
  type AdminSeriesListItemDto,
  type AdminSeriesDetailDto,
  type CreateSeriesDto,
  type UpdateSeriesDto,
  type AdminCollectionListItemDto,
  type AdminCollectionDetailDto,
  type CreateCollectionDto,
  type UpdateCollectionDto,
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
  type UpdateProfileDto,
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
export { routes, routeDefinitions, resolveRouteAccess } from "./routes";
export type { RouteAccess, RouteDefinition } from "./routes";

// Export shared navigation metadata
export {
  SECTION_TABS,
  DEFAULT_TABS,
  SECTION_LABELS,
  SECTION_ROUTES,
  type Section,
  type TabConfig,
} from "./navigation";

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
  type ContentOriginalFields,
  type ScholarOriginalFields,
} from "./types/localization.types";
