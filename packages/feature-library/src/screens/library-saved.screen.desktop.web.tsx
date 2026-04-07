"use client";

import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "../hooks/use-library-saved";

export type LibrarySavedDesktopWebScreenProps = {
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
        padding: 16,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600 }}>{item.lectureTitle}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {progress !== null && ` · ${progress}% listened`}
        {item.savedAt && ` · Saved ${new Date(item.savedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}

export function LibrarySavedDesktopWebScreen({
  onNavigateToLecture,
}: LibrarySavedDesktopWebScreenProps) {
  const { items, isFetching } = useLibrarySavedScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading saved lectures...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "#666" }}>
        No saved lectures yet. Save lectures to listen to later.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Saved</h2>
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
