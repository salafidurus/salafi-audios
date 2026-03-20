import { httpClient, type PlatformStatsDto } from "@sd/contracts";

export async function getPlatformStats(): Promise<PlatformStatsDto> {
  const response = await httpClient<PlatformStatsDto>({
    url: "/analytics/stats",
    method: "GET",
  });

  return response;
}
