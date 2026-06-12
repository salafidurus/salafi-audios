import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminSeriesListItemDto, AdminCollectionListItemDto } from "@sd/core-contracts";

export function useAdminSeries(scholarId: string) {
  return useApiQuery<AdminSeriesListItemDto[]>(["admin", "series", scholarId], () =>
    httpClient<AdminSeriesListItemDto[]>({
      url: endpoints.admin.series.list,
      method: "GET",
      params: { scholarId },
    }),
  );
}

export function useAdminCollections(scholarId: string) {
  return useApiQuery<AdminCollectionListItemDto[]>(["admin", "collections", scholarId], () =>
    httpClient<AdminCollectionListItemDto[]>({
      url: endpoints.admin.collections.list,
      method: "GET",
      params: { scholarId },
    }),
  );
}
