import { useInfiniteQuery } from "@tanstack/react-query";
import {
  httpClient,
  endpoints,
  queryKeys,
  type FeedPageDto,
} from "@sd/core-contracts";

export function useExplore(topicSlugs?: string[], scholarSlugs?: string[]) {
  return useInfiniteQuery<FeedPageDto>({
    queryKey: [...queryKeys.explore.all, "list", { topicSlugs, scholarSlugs }],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      if (topicSlugs?.length) params.topicSlugs = topicSlugs.join(",");
      if (scholarSlugs?.length) params.scholarSlugs = scholarSlugs.join(",");
      return httpClient<FeedPageDto>({
        url: endpoints.explore.list,
        method: "GET",
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

