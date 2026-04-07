"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveEndedScreen } from "../hooks/use-live-ended";

export type LiveEndedDesktopWebScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function EndedSessionItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
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
      {session.endedAt && (
        <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
          Ended: {new Date(session.endedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export function LiveEndedDesktopWebScreen({ onNavigateToSession }: LiveEndedDesktopWebScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 32 }}>Loading ended sessions...</div>;
  }

  if (sessions.length === 0) {
    return <div style={{ padding: 32, color: "#666" }}>No past sessions available.</div>;
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
