import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { LivestreamChannelDto, LiveSessionDeltaDto } from "@sd/core-contracts";

export function useAdminChannels() {
  return useApiQuery<LivestreamChannelDto[]>(["admin", "live", "channels"], () =>
    httpClient<LivestreamChannelDto[]>({ url: endpoints.admin.live.listChannels, method: "GET" }),
  );
}

export function useAdminSessions() {
  return useApiQuery<LiveSessionDeltaDto>(["admin", "live", "sessions"], () =>
    httpClient<LiveSessionDeltaDto>({ url: endpoints.admin.live.listSessions, method: "GET" }),
  );
}
