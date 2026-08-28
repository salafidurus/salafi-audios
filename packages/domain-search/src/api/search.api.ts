import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type SearchCatalogParams,
  type SearchCatalogResultsDto,
  type TopicDetailDto,
} from "@sd/core-contracts";

/** Query hooks for public catalog search and topic discovery data. */
/** Searches API-authorized public Listings using the supplied discovery criteria. */
export function useSearchCatalog(
  params: SearchCatalogParams,
  options?: Parameters<typeof useApiQuery<SearchCatalogResultsDto>>[2],
) {
  return useApiQuery(
    queryKeys.search.catalog(params),
    () =>
      httpClient<SearchCatalogResultsDto>({
        url: endpoints.search.extended,
        method: "GET",
        params,
      }),
    options,
  );
}

/** Reads the public topic vocabulary used to steer or filter discovery. */
export function useTopicsList(options?: Parameters<typeof useApiQuery<TopicDetailDto[]>>[2]) {
  return useApiQuery(
    queryKeys.topics.all,
    () =>
      httpClient<TopicDetailDto[]>({
        url: endpoints.topics.list,
        method: "GET",
      }),
    options,
  );
}
