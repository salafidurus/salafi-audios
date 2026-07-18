import { useInfiniteQuery } from "@tanstack/react-query";
import {
  httpClient,
  endpoints,
  queryKeys,
  type ScholarContentUnifiedDto,
} from "@sd/core-contracts";

export interface UseInfiniteScholarContentOptions {
  slug: string;
  enabled?: boolean;
}

export function useInfiniteScholarContent({
  slug,
  enabled = true,
}: UseInfiniteScholarContentOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.scholars.content_infinite(slug),
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const url = endpoints.scholars.content(slug);
      const response = await httpClient<ScholarContentUnifiedDto>({
        url,
        method: "GET",
      });

      return {
        items: response.items,
        nextCursor: undefined,
        hasMore: false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
    enabled: enabled && !!slug,
  });
}
