"use client";

import type { LiveSessionDto } from "@sd/core-contracts";
import { useLiveActiveScreen } from "../hooks/use-live-active";

export type LiveMobileWebScreenProps = {
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
        padding: 12,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#dc2626",
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 15, fontWeight: 600 }}>{session.title}</span>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {session.scholarName}
        {session.viewerCount !== undefined && ` · ${session.viewerCount} watching`}
      </div>
    </div>
  );
}

export function LiveMobileWebScreen({ onNavigateToSession }: LiveMobileWebScreenProps) {
  const { sessions, isFetching } = useLiveActiveScreen();

  if (isFetching && sessions.length === 0) {
    return <div style={{ padding: 16 }}>Loading live sessions...</div>;
  }

  if (sessions.length === 0) {
    return <div style={{ padding: 16, color: "#666" }}>No live sessions right now.</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Live Now</h2>
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
