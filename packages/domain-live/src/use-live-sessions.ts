"use client";

import { useEffect } from "react";
import { useLiveSection } from "./use-live-section";
import { endpoints, queryKeys, getApiBaseUrl } from "@sd/core-contracts";
import type { LiveSessionPublicDto } from "@sd/core-contracts";

export function useLiveSessions() {
  const active = useLiveSection(endpoints.live.active, queryKeys.live.active(), 20_000);
  const upcoming = useLiveSection(endpoints.live.upcoming, queryKeys.live.scheduled(), 180_000);
  const ended = useLiveSection(
    endpoints.live.ended,
    queryKeys.live.ended() as readonly string[],
    480_000,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) {
      return;
    }

    const baseUrl = getApiBaseUrl();
    if (!baseUrl) return;

    // Connect to SSE stream
    const eventSource = new EventSource(`${baseUrl}/live/stream`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "session_update" && payload.session) {
          const session = payload.session as LiveSessionPublicDto;

          const addOrUpdate = (prev: LiveSessionPublicDto[]) => {
            const index = prev.findIndex((s) => s.id === session.id);
            if (index >= 0) {
              const next = [...prev];
              next[index] = session;
              return next;
            }
            return [...prev, session];
          };

          const remove = (prev: LiveSessionPublicDto[]) => {
            return prev.filter((s) => s.id !== session.id);
          };

          if (session.status === "live") {
            active.setSessions(addOrUpdate);
            upcoming.setSessions(remove);
            ended.setSessions(remove);
          } else if (session.status === "scheduled") {
            upcoming.setSessions(addOrUpdate);
            active.setSessions(remove);
            ended.setSessions(remove);
          } else if (session.status === "ended") {
            ended.setSessions(addOrUpdate);
            active.setSessions(remove);
            upcoming.setSessions(remove);
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE livestream message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE livestream connection error. Browser will auto-reconnect.", err);
    };

    return () => {
      eventSource.close();
    };
  }, [active.setSessions, upcoming.setSessions, ended.setSessions]);

  return { active, upcoming, ended };
}
