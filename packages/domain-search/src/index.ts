// API hooks
/** Public Discovery package surface for search, browse, and quick-browse hooks. */
export { useSearchCatalog, useTopicsList } from "./api/search.api";

// Domain hooks
export {
  useSearchProcessing,
  type SearchFilterValue,
  type UseSearchProcessingOptions,
} from "./hooks/use-search-processing";

export { useInfiniteSearch, type UseInfiniteSearchOptions } from "./hooks";

// Utils & types
export { buildSearchResultRows, type SearchResultRow } from "./utils/build-search-result-rows";

// Quick browse
export { useContinueListening, type UseContinueListeningOptions } from "./use-continue-listening";
