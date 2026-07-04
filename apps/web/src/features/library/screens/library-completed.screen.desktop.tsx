"use client";

import type React from "react";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type LibraryCompletedDesktopScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

const pageTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--typo-display-md-font-family), serif",
  fontSize: "var(--typo-display-md-font-size)",
  fontWeight: "var(--typo-display-md-font-weight)",
  lineHeight: "var(--typo-display-md-line-height)",
  marginBottom: 16,
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

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.lectureTitle, item.originalLectureTitle, showOriginal);
  return (
    <button type="button" onClick={onPress} style={libraryItemButtonStyle} className="listRow">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--state-success)", fontSize: 14 }}>✓</span>
        <span style={itemTitleStyle}>{lectureTitle}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--content-muted)", marginTop: 4, paddingLeft: 22 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "var(--content-subtle)", marginTop: 4, paddingLeft: 22 }}>
        {item.durationSeconds
          ? t("lecture.minutes", "{{count}} min", { count: Math.round(item.durationSeconds / 60) })
          : ""}
        {item.completedAt &&
          ` · ${t("library.completedOn", "Completed {{date}}", {
            date: new Date(item.completedAt).toLocaleDateString(),
          })}`}
      </div>
    </button>
  );
}

export function LibraryCompletedDesktopScreen({
  onNavigateToLecture,
}: LibraryCompletedDesktopScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);

  if (isFetching && items.length === 0) {
    return (
      <ScreenView>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px", color: "var(--content-subtle)" }}>
          {t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.completed", "Completed"),
          })}
        </div>
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px", color: "var(--content-muted)" }}>
          {t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
        </div>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={pageTitleStyle}>
          {t("library.completed", "Completed")}
        </h2>
        {items.map((item) => (
          <LibraryItem
            key={item.id}
            item={item}
            onPress={() => onNavigateToLecture?.(item.lectureId)}
          />
        ))}
      </div>
    </ScreenView>
  );
}
