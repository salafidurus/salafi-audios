// Infinite scroll hooks
export {
  useInfiniteScholarsList,
  useInfiniteLibrarySaved,
  useInfiniteLibraryCompleted,
  useInfiniteLibraryProgress,
  useInfiniteAdminScholars,
  useInfiniteAdminListings,
  useAdminListingSeriesByScholar,
  useAdminTopicsList,
  type UseInfiniteScholarsListOptions,
  type UseInfiniteLibrarySavedOptions,
  type UseInfiniteLibraryCompletedOptions,
  type UseInfiniteLibraryProgressOptions,
  type UseInfiniteAdminScholarsOptions,
  type UseInfiniteAdminListingsOptions,
} from "./hooks";

export { useExploreRecentScreen } from "./use-explore-recent";
export { useHomePromotions, type HomePromotionsDto } from "./use-home-promotions";
export { useLibrarySavedScreen } from "./use-library-saved";
export { useLibraryCompletedScreen } from "./use-library-completed";
export { useLibraryProgressScreen } from "./use-library-progress";
export {
  useSavedStore,
  useIsSaved,
  isSaved,
  getSavedIds,
  type SavedEntry,
} from "./saved/saved.store";
export {
  initSavedSync,
  markSaved,
  markUnsaved,
  flushPendingSaved,
  drainPendingSaved,
  hydrateSavedFromServer,
  onSavedFlushed,
} from "./saved/saved.sync";
export { useListingDetail, useListingContents, useLastPlayedLesson } from "./listing.api";
export {
  useScholarsList,
  useScholarDetail,
  useScholarContent,
  useScholarTopics,
} from "./scholar.api";
export {
  useContentTranslations,
  useSaveTranslation,
  usePublishTranslation,
  useUnpublishTranslation,
} from "./translations.api";
export {
  formatScholarName,
  useFormatScholarName,
  useFormattedScholarName,
  type ScholarWithNameAndTitle,
} from "./utils/format-scholar-name";
export { getLibraryItemPercent } from "./utils/library-item-progress";
export { mergeLiveProgress } from "./utils/merge-live-progress";
