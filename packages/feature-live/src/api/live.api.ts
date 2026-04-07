import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LiveSessionPageDto,
} from "@sd/core-contracts";

export function useLiveActive() {
  return useApiQuery(queryKeys.live.active(), () =>
    httpClient<LiveSessionPageDto>({
      url: endpoints.live.active,
      method: "GET",
    }),
  );
}

export function useLiveScheduled() {
  return useApiQuery(queryKeys.live.scheduled(), () =>
    httpClient<LiveSessionPageDto>({
      url: endpoints.live.upcoming,
      method: "GET",
    }),
  );
}

export function useLiveEnded(cursor?: string) {
  return useApiQuery(queryKeys.live.ended(cursor), () =>
    httpClient<LiveSessionPageDto>({
      url: endpoints.live.ended,
      method: "GET",
      params: cursor ? { cursor } : undefined,
    }),
  );
}
