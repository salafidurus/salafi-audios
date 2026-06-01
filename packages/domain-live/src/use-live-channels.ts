"use client";

import { useQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys } from "@sd/core-contracts";
import type { LivestreamChannelDto } from "@sd/core-contracts";

export function useLiveChannels() {
  return useQuery<LivestreamChannelDto[]>({
    queryKey: queryKeys.live.channels(),
    queryFn: async () => {
      return httpClient<LivestreamChannelDto[]>({
        url: endpoints.live.channels,
        method: "GET",
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLiveChannelBySlug(slug: string) {
  return useQuery<LivestreamChannelDto>({
    queryKey: queryKeys.live.channelBySlug(slug),
    queryFn: async () => {
      return httpClient<LivestreamChannelDto>({
        url: endpoints.live.channelBySlug(slug),
        method: "GET",
      });
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
