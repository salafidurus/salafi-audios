"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveEndedScreen } from "../hooks/use-live-ended";

export type LiveEndedMobileWebScreenProps = {
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
        padding: 12,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>{session.title}</div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{session.scholarName}</div>
      {session.endedAt && (
        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
          {new Date(session.endedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export function LiveEndedMobileWebScreen({ onNavigateToSession }: LiveEndedMobileWebScreenProps) {
  const { sessions, isFetching } = useLiveEndedScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 16 }}>Loading past sessions...</div>;
  }

  if (sessions.length === 0) {
    return <div style={{ padding: 16, color: "#666" }}>No past sessions.</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Past Sessions</h2>
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
