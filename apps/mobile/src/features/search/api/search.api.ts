import {
  endpoints,
  queryKeys,
  useApiQuery,
  type SearchCatalogParams,
  type SearchCatalogResultsDto,
  type TopicDetailDto,
} from "@sd/contracts";
import { apiRequest } from "@/core/api/client";

export function useSearchCatalog(
  params: SearchCatalogParams,
  options?: Parameters<typeof useApiQuery<SearchCatalogResultsDto>>[2],
) {
  return useApiQuery(
    queryKeys.search.catalog(params),
    () =>
      apiRequest<SearchCatalogResultsDto>({
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
      apiRequest<TopicDetailDto[]>({
        url: endpoints.topics.list,
        method: "GET",
      }),
    options,
  );
}
