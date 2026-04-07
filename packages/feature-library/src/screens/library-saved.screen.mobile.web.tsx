"use client";

import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "../hooks/use-library-saved";
import { useLibraryProgressScreen } from "../hooks/use-library-progress";
import { useLibraryCompletedScreen } from "../hooks/use-library-completed";

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div style={{ height: 3, background: "#e5e7eb", borderRadius: 2, marginTop: 4 }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(percent, 100)}%`,
          background: "#2563eb",
          borderRadius: 2,
        }}
      />
    </div>
  );
}

function LibraryItem({
  item,
  onPress,
  variant,
}: {
  item: LibraryItemDto;
  onPress?: () => void;
  variant: "progress" | "saved" | "completed";
}) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {variant === "completed" && <span style={{ color: "#16a34a", fontSize: 12 }}>✓</span>}
        <span style={{ fontSize: 15, fontWeight: 600 }}>{item.lectureTitle}</span>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {variant === "progress" && progress !== null && ` · ${progress}% listened`}
        {variant === "saved" &&
          item.savedAt &&
          ` · Saved ${new Date(item.savedAt).toLocaleDateString()}`}
        {variant === "completed" &&
          item.completedAt &&
          ` · ${new Date(item.completedAt).toLocaleDateString()}`}
      </div>
      {variant === "progress" && progress !== null && <ProgressBar percent={progress} />}
    </div>
  );
}

function SectionList({
  title,
  items,
  isFetching,
  emptyMessage,
  variant,
  onNavigateToLecture,
}: {
  title: string;
  items: LibraryItemDto[];
  isFetching: boolean;
  emptyMessage: string;
  variant: "progress" | "saved" | "completed";
  onNavigateToLecture?: (id: string) => void;
}) {
  if (isFetching && items.length === 0) {
    return <div style={{ padding: 8, color: "#999" }}>Loading {title.toLowerCase()}...</div>;
  }

  if (items.length === 0) {
    return <div style={{ padding: 8, color: "#666" }}>{emptyMessage}</div>;
  }

  return (
    <div>
      {items.map((item) => (
        <LibraryItem
          key={item.id}
          item={item}
          variant={variant}
          onPress={() => onNavigateToLecture?.(item.lectureId)}
        />
      ))}
    </div>
  );
}

export type LibrarySavedMobileWebScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedMobileWebScreen({
  onNavigateToLecture,
}: LibrarySavedMobileWebScreenProps) {
  const progressData = useLibraryProgressScreen();
  const savedData = useLibrarySavedScreen();
  const completedData = useLibraryCompletedScreen();

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>My Library</h2>

      <h3 style={{ fontSize: 15, margin: "16px 0 6px" }}>In Progress</h3>
      <SectionList
        title="In Progress"
        items={progressData.items}
        isFetching={progressData.isFetching}
        emptyMessage="No lectures in progress."
        variant="progress"
        onNavigateToLecture={onNavigateToLecture}
      />

      <h3 style={{ fontSize: 15, margin: "16px 0 6px" }}>Saved</h3>
      <SectionList
        title="Saved"
        items={savedData.items}
        isFetching={savedData.isFetching}
        emptyMessage="No saved lectures yet. Save lectures to listen to later."
        variant="saved"
        onNavigateToLecture={onNavigateToLecture}
      />

      <h3 style={{ fontSize: 15, margin: "16px 0 6px" }}>Completed</h3>
      <SectionList
        title="Completed"
        items={completedData.items}
        isFetching={completedData.isFetching}
        emptyMessage="No completed lectures yet. Keep listening!"
        variant="completed"
        onNavigateToLecture={onNavigateToLecture}
      />
    </div>
  );
}
