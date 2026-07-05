"use client";

import { useLiveSection } from "./use-live-section";
import { endpoints, queryKeys } from "@sd/core-contracts";

/**
 * Hook for active live sessions using delta fetching.
 * Different from the old API hook with the same name.
 */
export function useLiveActiveDelta() {
  return useLiveSection(endpoints.live.active, queryKeys.live.active(), 20_000);
}
