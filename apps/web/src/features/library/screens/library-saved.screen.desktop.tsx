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

const pageTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--typo-display-md-font-family), serif",
  fontSize: "var(--typo-display-md-font-size)",
  fontWeight: "var(--typo-display-md-font-weight)",
  lineHeight: "var(--typo-display-md-line-height)",
  marginBottom: 16,
};

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: "var(--typo-label-md-font-family), sans-serif",
  fontSize: "var(--typo-label-md-font-size)",
  fontWeight: "var(--typo-label-md-font-weight)",
  lineHeight: "var(--typo-label-md-line-height)",
  letterSpacing: "0.08em",
  margin: "24px 0 8px",
};

const libraryItemButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
  background: "none",
  border: "none",
};

const itemTitleStyle: React.CSSProperties = {
  fontFamily: "var(--typo-title-md-font-family), serif",
  fontSize: "var(--typo-title-md-font-size)",
  fontWeight: "var(--typo-title-md-font-weight)",
  lineHeight: "var(--typo-title-md-line-height)",
  color: "var(--content-default)",
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div style={{ height: 4, background: "var(--border-subtle)", borderRadius: 2, marginTop: 6 }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(percent, 100)}%`,
          background: "var(--action-primary)",
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
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.lectureTitle, item.originalLectureTitle, showOriginal);

  return (
    <button type="button" onClick={onPress} style={libraryItemButtonStyle} className="listRow">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {variant === "completed" && <span style={{ color: "#16a34a", fontSize: 14 }}>✓</span>}
        <span style={itemTitleStyle}>{lectureTitle}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--content-muted)", marginTop: 4 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "var(--content-subtle)", marginTop: 4 }}>
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
      <div style={{ padding: "16px 24px", color: "var(--content-subtle)" }}>
        {t("library.loadingSection", "Loading {{section}}…", { section: title })}
      </div>
    );
  }

  if (items.length === 0) {
    return <div style={{ padding: "16px 24px", color: "var(--content-muted)" }}>{emptyMessage}</div>;
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
        <h2 style={pageTitleStyle}>
          {t("library.title", "My Library")}
        </h2>

        <h3 style={sectionHeaderStyle}>
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

        <h3 style={sectionHeaderStyle}>{t("library.saved", "Saved")}</h3>
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

        <h3 style={sectionHeaderStyle}>
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
