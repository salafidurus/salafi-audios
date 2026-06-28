"use client";

import type React from "react";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import {
  useLibrarySavedScreen,
  useLibraryProgressScreen,
  useLibraryCompletedScreen,
} from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, marginTop: 6 }}>
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

const libraryItemButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 16,
  cursor: "pointer",
  background: "none",
  border: "none",
  borderBottom: "1px solid #eee",
};

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
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.lectureTitle, item.originalLectureTitle, showOriginal);

  return (
    <button type="button" onClick={onPress} style={libraryItemButtonStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {variant === "completed" && <span style={{ color: "#16a34a", fontSize: 14 }}>✓</span>}
        <span style={{ fontSize: 16, fontWeight: 600 }}>{lectureTitle}</span>
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        {item.durationSeconds
          ? t("lecture.minutes", "{{count}} min", {
              count: Math.round(item.durationSeconds / 60),
            })
          : ""}
        {variant === "progress" &&
          progress !== null &&
          ` · ${t("library.percentListened", "{{percent}}% listened", { percent: progress })}`}
        {variant === "saved" &&
          item.savedAt &&
          ` · ${t("library.savedOn", "Saved {{date}}", {
            date: new Date(item.savedAt).toLocaleDateString(),
          })}`}
        {variant === "completed" &&
          item.completedAt &&
          ` · ${t("library.completedOn", "Completed {{date}}", {
            date: new Date(item.completedAt).toLocaleDateString(),
          })}`}
      </div>
      {variant === "progress" && progress !== null && <ProgressBar percent={progress} />}
    </button>
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
  const { t } = useTranslation();
  if (isFetching && items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#999" }}>
        {t("library.loadingSection", "Loading {{section}}…", { section: title })}
      </div>
    );
  }

  if (items.length === 0) {
    return <div style={{ padding: 16, color: "#666" }}>{emptyMessage}</div>;
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

export type LibrarySavedDesktopScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedDesktopScreen({ onNavigateToLecture }: LibrarySavedDesktopScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const progressData = useLibraryProgressScreen(isAuthenticated);
  const savedData = useLibrarySavedScreen(isAuthenticated);
  const completedData = useLibraryCompletedScreen(isAuthenticated);

  return (
    <ScreenView>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>
          {t("library.title", "My Library")}
        </h2>

        <h3 style={{ fontSize: 18, margin: "24px 0 8px" }}>
          {t("library.inProgress", "In Progress")}
        </h3>
        <SectionList
          title={t("library.inProgress", "In Progress")}
          items={progressData.items}
          isFetching={progressData.isFetching}
          emptyMessage={t("library.emptyProgress", "No lectures in progress.")}
          variant="progress"
          onNavigateToLecture={onNavigateToLecture}
        />

        <h3 style={{ fontSize: 18, margin: "24px 0 8px" }}>{t("library.saved", "Saved")}</h3>
        <SectionList
          title={t("library.saved", "Saved")}
          items={savedData.items}
          isFetching={savedData.isFetching}
          emptyMessage={t(
            "library.emptySaved",
            "No saved lectures yet. Save lectures to listen to later.",
          )}
          variant="saved"
          onNavigateToLecture={onNavigateToLecture}
        />

        <h3 style={{ fontSize: 18, margin: "24px 0 8px" }}>
          {t("library.completed", "Completed")}
        </h3>
        <SectionList
          title={t("library.completed", "Completed")}
          items={completedData.items}
          isFetching={completedData.isFetching}
          emptyMessage={t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
          variant="completed"
          onNavigateToLecture={onNavigateToLecture}
        />
      </div>
    </ScreenView>
  );
}
