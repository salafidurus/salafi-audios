import { analyticsControllerStats, type PlatformStatsDto } from "@sd/api-client";

export async function getPlatformStats(): Promise<PlatformStatsDto> {
  return analyticsControllerStats();
}
