"use client";

import type React from "react";
import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveEndedScreen } from "@sd/domain-live";

export type LiveEndedDesktopScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

const endedSessionButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 16,
  borderBottom: "1px solid var(--border-subtle)",
  cursor: "pointer",
  background: "none",
  border: "none",
};

function EndedSessionItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
  return (
    <button type="button" onClick={onPress} style={endedSessionButtonStyle}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{session.title}</div>
      <div style={{ fontSize: 13, color: "var(--content-muted)", marginTop: 4 }}>
        {session.scholarName}
      </div>
      {session.endedAt && (
        <div style={{ fontSize: 12, color: "var(--content-subtle)", marginTop: 4 }}>
          Ended: {new Date(session.endedAt).toLocaleDateString()}
        </div>
      )}
    </button>
  );
}

export function LiveEndedDesktopScreen({ onNavigateToSession }: LiveEndedDesktopScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 32 }}>Loading ended sessions…</div>;
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: 32, color: "var(--content-muted)" }}>No past sessions available.</div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Past Sessions</h2>
      {sessions.map((session) => (
        <EndedSessionItem
          key={session.id}
          session={session}
          onPress={() => onNavigateToSession?.(session.id)}
        />
      ))}
    </div>
  );
}
