import {
  endpoints,
  queryKeys,
  useApiQuery,
  type CatalogSearchParams,
  type CatalogSearchResultsDto,
} from "@sd/contracts";
import { apiRequest } from "@/core/api/client";

export function useSearchCatalog(
  params: CatalogSearchParams,
  options?: Parameters<typeof useApiQuery<CatalogSearchResultsDto>>[2],
) {
  return useApiQuery(
    queryKeys.search.catalog(params),
    () =>
      apiRequest<CatalogSearchResultsDto>({
        url: endpoints.catalog.search,
        method: "GET",
        params,
      }),
    options,
  );
}
