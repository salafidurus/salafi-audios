"use client";

import type React from "react";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveScheduledScreen } from "@sd/domain-live";

export type LiveScheduledMobileScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

const scheduledSessionButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid var(--border-subtle)",
  cursor: "pointer",
  background: "none",
  border: "none",
};

function ScheduledSessionItem({
  session,
  onPress,
}: {
  session: LiveSessionDto;
  onPress?: () => void;
}) {
  return (
    <button type="button" onClick={onPress} style={scheduledSessionButtonStyle}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{session.title}</div>
      <div style={{ fontSize: 12, color: "var(--content-muted)", marginTop: 2 }}>
        {session.scholarName}
      </div>
      {session.scheduledAt && (
        <div style={{ fontSize: 12, color: "var(--content-primary)", marginTop: 2 }}>
          {new Date(session.scheduledAt).toLocaleString()}
        </div>
      )}
    </button>
  );
}

export function LiveScheduledMobileScreen({ onNavigateToSession }: LiveScheduledMobileScreenProps) {
  const { sessions, isFetching } = useLiveScheduledScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 16 }}>Loading scheduled sessions…</div>;
  }

  if (sessions.length === 0) {
    return <div style={{ padding: 16, color: "var(--content-muted)" }}>No scheduled sessions.</div>;
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
