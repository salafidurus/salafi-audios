/** Public Content Catalog package surface for Listings, scholars, topics, and My Library. */
// Infinite scroll hooks
export {
  useInfiniteScholarsList,
  useInfiniteMyLibrarySaved,
  useInfiniteMyLibraryCompleted,
  useInfiniteMyLibraryProgress,
  useInfiniteAdminScholars,
  useInfiniteAdminListings,
  useAdminListingSeriesByScholar,
  useAdminTopicsList,
  type UseInfiniteScholarsListOptions,
  type UseInfiniteMyLibrarySavedOptions,
  type UseInfiniteMyLibraryCompletedOptions,
  type UseInfiniteMyLibraryProgressOptions,
  type UseInfiniteAdminScholarsOptions,
  type UseInfiniteAdminListingsOptions,
} from "./hooks";

export { useExploreRecentScreen, useHomeRecent } from "./use-explore-recent";
export { mergeExplorePages } from "./merge-explore-pages";
export { useHomePromotions } from "./home.api";
export { useMyLibrarySavedScreen } from "./use-my-library-saved";
export { useMyLibraryCompletedScreen } from "./use-my-library-completed";
export { useMyLibraryProgressScreen } from "./use-my-library-progress";
export {
  useMyLibrarySections,
  type MyLibrarySection,
  type MyLibrarySectionResult,
  type MyLibrarySectionsResult,
  type UseMyLibrarySectionsOptions,
} from "./use-my-library-sections";
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
export { getMyLibraryItemPercent } from "./utils/my-library-item-progress";
export { mergeLiveProgress } from "./utils/merge-live-progress";
export { useEnrichedLocalLibraryItems } from "./my-library.catalog";
