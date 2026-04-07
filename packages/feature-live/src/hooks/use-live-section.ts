import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@sd/core-contracts";
import type { LiveSessionPublicDto, LiveSessionDeltaDto } from "@sd/core-contracts";

function mergeDelta(
  current: LiveSessionPublicDto[],
  delta: LiveSessionDeltaDto,
): LiveSessionPublicDto[] {
  const deltaMap = new Map(delta.sessions.map((s) => [s.id, s]));
  const deletedSet = new Set(delta.deletedIds);

  const merged = current.filter((s) => !deletedSet.has(s.id)).map((s) => deltaMap.get(s.id) ?? s);

  const existingIds = new Set(current.map((s) => s.id));
  const added = delta.sessions.filter((s) => !existingIds.has(s.id));

  return [...merged, ...added];
}

export function useLiveSection(
  endpoint: string,
  queryKey: readonly string[],
  refetchIntervalMs: number,
) {
  const fetchedAtRef = useRef<string | undefined>(undefined);

  const query = useQuery<LiveSessionDeltaDto>({
    queryKey: [...queryKey, fetchedAtRef.current],
    queryFn: async () => {
      const res = await httpClient<LiveSessionDeltaDto>({
        url: endpoint,
        method: "GET",
        params: fetchedAtRef.current ? { since: fetchedAtRef.current } : undefined,
      });
      return res;
    },
    refetchInterval: refetchIntervalMs,
    staleTime: 0,
  });

  const [sessions, setSessions] = useState<LiveSessionPublicDto[]>([]);

  useEffect(() => {
    if (!query.data) return;
    fetchedAtRef.current = query.data.fetchedAt;
    setSessions((prev) => mergeDelta(prev, query.data!));
  }, [query.data]);

  return { sessions, isLoading: query.isLoading };
}
