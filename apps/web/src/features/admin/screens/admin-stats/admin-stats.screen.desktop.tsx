"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export function AdminStatsDesktopScreen() {
  return (
    <ScreenView>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Admin Stats</h1>
        <p style={{ color: "#666" }}>Platform statistics and analytics will appear here.</p>
      </div>
    </ScreenView>
  );
}
