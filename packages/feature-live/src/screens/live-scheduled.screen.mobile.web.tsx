"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "../hooks/use-live-scheduled";

export type LiveScheduledMobileWebScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function ScheduledSessionItem({
  session,
  onPress,
}: {
  session: LiveSessionDto;
  onPress?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(e) => e.key === "Enter" && onPress?.()}
      style={{
        padding: 12,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>{session.title}</div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{session.scholarName}</div>
      {session.scheduledAt && (
        <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>
          {new Date(session.scheduledAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function LiveScheduledMobileWebScreen({
  onNavigateToSession,
}: LiveScheduledMobileWebScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 16 }}>Loading scheduled sessions...</div>;
  }

  if (sessions.length === 0) {
    return <div style={{ padding: 16, color: "#666" }}>No scheduled sessions.</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Scheduled</h2>
      {sessions.map((session) => (
        <ScheduledSessionItem
          key={session.id}
          session={session}
          onPress={() => onNavigateToSession?.(session.id)}
        />
      ))}
    </div>
  );
}
