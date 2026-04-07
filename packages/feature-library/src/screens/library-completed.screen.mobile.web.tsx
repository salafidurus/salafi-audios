"use client";

import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibraryCompletedScreen } from "../hooks/use-library-completed";

export type LibraryCompletedMobileWebScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
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
        <span style={{ color: "#16a34a", fontSize: 12 }}>✓</span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{item.lectureTitle}</span>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2, paddingLeft: 18 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 2, paddingLeft: 18 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.completedAt && ` · ${new Date(item.completedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}

export function LibraryCompletedMobileWebScreen({
  onNavigateToLecture,
}: LibraryCompletedMobileWebScreenProps) {
  const { items, isFetching } = useLibraryCompletedScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading completed lectures...</div>;
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
