"use client";

import type React from "react";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

export type LibraryCompletedMobileScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

const libraryItemButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 12,
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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#16a34a", fontSize: 12 }}>✓</span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{lectureTitle}</span>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2, paddingLeft: 18 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 2, paddingLeft: 18 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.completedAt && ` · ${new Date(item.completedAt).toLocaleDateString()}`}
      </div>
    </button>
  );
}

export function LibraryCompletedMobileScreen({
  onNavigateToLecture,
}: LibraryCompletedMobileScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading completed lectures…</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#666" }}>No completed lectures yet. Keep listening!</div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Completed</h2>
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
