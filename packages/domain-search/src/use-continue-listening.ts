import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type RecentProgressDto,
} from "@sd/core-contracts";
import { HttpError } from "@sd/core-contracts/http";

/** Exposes the authenticated user's unfinished listening projection for Home. */
/** Controls whether the Continue Listening projection is requested. */
export type UseContinueListeningOptions = {
  enabled?: boolean;
};

/** Reads Continue Listening while treating an unauthenticated response as empty. */
export function useContinueListening(options?: UseContinueListeningOptions) {
  const query = useApiQuery<RecentProgressDto | null>(
    queryKeys.myLibrary.recentProgress(),
    async () => {
      try {
        return await httpClient<RecentProgressDto | null>({
          url: endpoints.myLibrary.recentProgress,
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
