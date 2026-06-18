"use client";

import type React from "react";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

export type LibraryCompletedDesktopScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

const libraryItemButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 16,
  borderBottom: "1px solid #eee",
  cursor: "pointer",
  background: "none",
  border: "none",
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  const showOriginal = useShowOriginalContent();
  const lectureTitle = pickContentField(item.lectureTitle, item.originalLectureTitle, showOriginal);
  return (
    <button type="button" onClick={onPress} style={libraryItemButtonStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#16a34a", fontSize: 14 }}>✓</span>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{lectureTitle}</span>
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4, paddingLeft: 22 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 4, paddingLeft: 22 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.completedAt && ` · Completed ${new Date(item.completedAt).toLocaleDateString()}`}
      </div>
    </button>
  );
}

export function LibraryCompletedDesktopScreen({
  onNavigateToLecture,
}: LibraryCompletedDesktopScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading completed lectures…</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "#666" }}>No completed lectures yet. Keep listening!</div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Completed</h2>
      {items.map((item) => (
        <LibraryItem
          key={item.id}
          item={item}
          onPress={() => onNavigateToLecture?.(item.lectureId)}
        />
      ))}
    </div>
  );
}
