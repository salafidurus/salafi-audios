"use client";

import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "../hooks/use-library-saved";

export type LibrarySavedMobileWebScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  const progress =
    item.durationSeconds && item.progressSeconds
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
      : null;

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
      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.lectureTitle}</div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {progress !== null && ` · ${progress}% listened`}
      </div>
    </div>
  );
}

export function LibrarySavedMobileWebScreen({
  onNavigateToLecture,
}: LibrarySavedMobileWebScreenProps) {
  const { items, isFetching } = useLibrarySavedScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading saved lectures...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#666" }}>
        No saved lectures yet. Save lectures to listen to later.
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Saved</h2>
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
