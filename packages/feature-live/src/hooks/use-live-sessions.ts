import { useLiveSection } from "./use-live-section";
import { endpoints, queryKeys } from "@sd/core-contracts";

export function useLiveSessions() {
  const active = useLiveSection(endpoints.live.active, queryKeys.live.active(), 20_000);
  const upcoming = useLiveSection(endpoints.live.upcoming, queryKeys.live.scheduled(), 180_000);
  const ended = useLiveSection(
    endpoints.live.ended,
    queryKeys.live.ended() as readonly string[],
    480_000,
  );

  return { active, upcoming, ended };
}
