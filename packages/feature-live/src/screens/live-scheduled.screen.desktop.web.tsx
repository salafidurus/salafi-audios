"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "../hooks/use-live-scheduled";

export type LiveScheduledDesktopWebScreenProps = {
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
        padding: 16,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600 }}>{session.title}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{session.scholarName}</div>
      {session.scheduledAt && (
        <div style={{ fontSize: 12, color: "#2563eb", marginTop: 4 }}>
          Scheduled: {new Date(session.scheduledAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function LiveScheduledDesktopWebScreen({
  onNavigateToSession,
}: LiveScheduledDesktopWebScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 32 }}>Loading scheduled sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: 32, color: "#666" }}>No scheduled sessions. Check back later.</div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Scheduled</h2>
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
