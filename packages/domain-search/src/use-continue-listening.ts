import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type RecentProgressDto,
} from "@sd/core-contracts";
import { HttpError } from "@sd/core-contracts/http";

export type UseContinueListeningOptions = {
  enabled?: boolean;
};

export function useContinueListening(options?: UseContinueListeningOptions) {
  const query = useApiQuery<RecentProgressDto | null>(
    queryKeys.library.recentProgress(),
    async () => {
      try {
        return await httpClient<RecentProgressDto | null>({
          url: endpoints.library.recentProgress,
          method: "GET",
        });
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    { enabled: options?.enabled !== false },
  );

  return { ...query, recentProgress: query.data ?? null };
}
