"use client";

import { useLiveActiveDelta } from "./use-live-active";
import type { LiveSessionPublicDto } from "@sd/core-contracts";

/**
 * Get the first active session if any exist.
 * Useful for showing a "Currently Live" indicator in navigation.
 */
export function useActiveSession(): {
  activeSession: LiveSessionPublicDto | undefined;
  isLoading: boolean;
} {
  const { sessions, isLoading } = useLiveActiveDelta();

  return {
    activeSession: sessions.length > 0 ? sessions[0] : undefined,
    isLoading,
  };
}
