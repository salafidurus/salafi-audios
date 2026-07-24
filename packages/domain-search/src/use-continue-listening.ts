import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type RecentProgressDto,
} from "@sd/core-contracts";

export function useContinueListening() {
  const query = useApiQuery<RecentProgressDto | null>(queryKeys.library.recentProgress(), () =>
    httpClient<RecentProgressDto | null>({
      url: endpoints.library.recentProgress,
      method: "GET",
    }),
  );

  return { ...query, recentProgress: query.data ?? null };
}
