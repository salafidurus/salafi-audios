"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveActiveScreen } from "../hooks/use-live-active";

export type LiveDesktopWebScreenProps = {
  onNavigateToSession?: (id: string) => void;
};

function LiveSessionItem({ session, onPress }: { session: LiveSessionDto; onPress?: () => void }) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#dc2626",
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 16, fontWeight: 600 }}>{session.title}</span>
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
        {session.scholarName}
        {session.viewerCount !== undefined && ` · ${session.viewerCount} watching`}
      </div>
      {session.description && (
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{session.description}</div>
      )}
    </div>
  );
}

export function LiveDesktopWebScreen({ onNavigateToSession }: LiveDesktopWebScreenProps) {
  const { sessions, isFetching } = useLiveActiveScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 32 }}>Loading live sessions...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: 32, color: "#666" }}>
        No live sessions right now. Check the schedule for upcoming sessions.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Live Now</h2>
      {sessions.map((session) => (
        <LiveSessionItem
          key={session.id}
          session={session}
          onPress={() => onNavigateToSession?.(session.id)}
        />
      ))}
    </div>
  );
}
