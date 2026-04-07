"use client";

import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibraryCompletedScreen } from "../hooks/use-library-completed";

export type LibraryCompletedDesktopWebScreenProps = {
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
        padding: 16,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#16a34a", fontSize: 14 }}>✓</span>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{item.lectureTitle}</span>
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4, paddingLeft: 22 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 4, paddingLeft: 22 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.completedAt && ` · Completed ${new Date(item.completedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}

export function LibraryCompletedDesktopWebScreen({
  onNavigateToLecture,
}: LibraryCompletedDesktopWebScreenProps) {
  const { items, isFetching } = useLibraryCompletedScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading completed lectures...</div>;
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
