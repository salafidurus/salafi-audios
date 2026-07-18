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
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.scholars.content(slug)}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<
        ScholarContentUnifiedDto & { nextCursor?: string; hasMore?: boolean }
      >({
        url,
        method: "GET",
      });

      return {
        items: response.items,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore ?? false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && !!slug,
  });
}
