import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type SearchCatalogParams,
  type SearchCatalogResultsDto,
  type TopicDetailDto,
} from "@sd/core-contracts";

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

export function useTopicsList(options?: Parameters<typeof useApiQuery<TopicDetailDto[]>>[2]) {
  return useApiQuery(
    queryKeys.topics.list(),
    () =>
      httpClient<TopicDetailDto[]>({
        url: endpoints.topics.list,
        method: "GET",
      }),
    options,
  );
}
