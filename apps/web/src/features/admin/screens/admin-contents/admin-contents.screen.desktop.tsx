"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export function AdminContentsDesktopScreen() {
  return (
    <ScreenView>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Admin Contents</h1>
        <p style={{ color: "#666" }}>
          Content management for series, collections, and metadata will appear here.
        </p>
      </div>
    </ScreenView>
  );
}
