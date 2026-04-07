"use client";

import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from "@sd/core-contracts";
import { BrowseCardDesktopWeb } from "../BrowseCard/BrowseCard.desktop.web";

export type QuickBrowseDesktopWebProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
  onSelectCategory?: (searchKey: string) => void;
};

const headerStyle = {
  fontFamily: "var(--typo-title-md-font-family)",
  fontSize: "var(--typo-title-md-font-size)",
  lineHeight: "var(--typo-title-md-line-height)",
  letterSpacing: "var(--typo-title-md-letter-spacing)",
  fontWeight: "var(--typo-title-md-font-weight)",
} as const;

const captionStyle = {
  fontFamily: "var(--typo-caption-font-family)",
  fontSize: "var(--typo-caption-font-size)",
  lineHeight: "var(--typo-caption-line-height)",
  letterSpacing: "var(--typo-caption-letter-spacing)",
  fontWeight: "var(--typo-caption-font-weight)",
} as const;

const labelStyle = {
  fontFamily: "var(--typo-label-md-font-family)",
  fontSize: "var(--typo-label-md-font-size)",
  lineHeight: "var(--typo-label-md-line-height)",
  letterSpacing: "var(--typo-label-md-letter-spacing)",
  fontWeight: "var(--typo-label-md-font-weight)",
} as const;

const bodySmStyle = {
  fontFamily: "var(--typo-body-sm-font-family)",
  fontSize: "var(--typo-body-sm-font-size)",
  lineHeight: "var(--typo-body-sm-line-height)",
  letterSpacing: "var(--typo-body-sm-letter-spacing)",
  fontWeight: "var(--typo-body-sm-font-weight)",
} as const;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuickBrowseDesktopWeb({
  scholars,
  suggestions,
  recentProgress,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
  onSelectCategory,
}: QuickBrowseDesktopWebProps) {
  return (
    <section className="flex w-full max-w-[56rem] flex-col gap-[var(--space-scale-4xl)]">
      {/* Continue Listening */}
      {recentProgress && (
        <section className="flex flex-col gap-[var(--space-component-gap-md)]">
          <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
            Continue Listening
          </h2>
          <button
            type="button"
            onClick={() => onContinueListening?.(recentProgress.lectureSlug)}
            className="flex w-full flex-col gap-[var(--space-scale-sm)] rounded-[var(--radius-component-card)] border border-[var(--border-default)] bg-[var(--surface-default)] p-[var(--space-component-card-padding)] text-left transition hover:border-[var(--accent-primary-subtle-border)] hover:bg-[var(--accent-primary-subtle-surface)]"
          >
            <span className="text-[var(--content-strong)]" style={labelStyle}>
              {recentProgress.lectureTitle}
            </span>
            <span className="text-[var(--content-muted)]" style={captionStyle}>
              {recentProgress.scholarName}
            </span>
            <div className="flex w-full items-center gap-[var(--space-scale-sm)]">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)]"
                  style={{
                    width: `${recentProgress.durationSeconds > 0 ? Math.round((recentProgress.positionSeconds / recentProgress.durationSeconds) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="text-[var(--content-muted)]" style={captionStyle}>
                {formatDuration(recentProgress.positionSeconds)} /{" "}
                {formatDuration(recentProgress.durationSeconds)}
              </span>
            </div>
          </button>
        </section>
      )}

      {/* Scholars */}
      {scholars && scholars.length > 0 && (
        <section className="flex flex-col gap-[var(--space-component-gap-md)]">
          <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
            Scholars
          </h2>
          <div className="flex gap-[var(--space-component-gap-md)] overflow-x-auto pb-[var(--space-scale-xs)]">
            {scholars.map((scholar) => (
              <button
                key={scholar.id}
                type="button"
                onClick={() => onSelectScholar?.(scholar.slug)}
                className="flex shrink-0 flex-col items-center gap-[var(--space-scale-xs)] transition hover:opacity-80"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[var(--border-default)] bg-[var(--surface-default)]">
                  {scholar.imageUrl ? (
                    <img
                      src={scholar.imageUrl}
                      alt={scholar.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[var(--content-muted)]" style={labelStyle}>
                      {scholar.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span
                  className="max-w-[5rem] truncate text-center text-[var(--content-default)]"
                  style={captionStyle}
                >
                  {scholar.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <section className="flex flex-col gap-[var(--space-component-gap-md)]">
          <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
            Suggestions
          </h2>
          <div className="flex gap-[var(--space-component-gap-md)] overflow-x-auto pb-[var(--space-scale-xs)]">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSuggestion?.(item.slug)}
                className="flex w-48 shrink-0 flex-col gap-[var(--space-scale-xs)] rounded-[var(--radius-component-card)] border border-[var(--border-default)] bg-[var(--surface-default)] p-[var(--space-component-card-padding)] text-left transition hover:border-[var(--accent-primary-subtle-border)] hover:bg-[var(--accent-primary-subtle-surface)]"
              >
                <span className="text-[var(--content-strong)]" style={labelStyle}>
                  {item.title}
                </span>
                <span className="text-[var(--content-muted)]" style={captionStyle}>
                  {item.scholarName}
                </span>
                <div className="flex items-center gap-[var(--space-scale-xs)]">
                  <span
                    className="rounded-[var(--radius-component-chip)] bg-[var(--surface-hover)] px-[var(--space-scale-xs)] py-px text-[var(--content-muted)]"
                    style={captionStyle}
                  >
                    {item.kind}
                  </span>
                  {item.durationSeconds != null && (
                    <span className="text-[var(--content-muted)]" style={captionStyle}>
                      {formatDuration(item.durationSeconds)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Fallback: Browse All categories when no data loaded */}
      {(!scholars || scholars.length === 0) && (!suggestions || suggestions.length === 0) && (
        <section className="flex flex-col gap-[var(--space-component-gap-md)]">
          <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
            Browse all
          </h2>
          <div className="grid grid-cols-2 gap-[var(--space-component-gap-md)] lg:grid-cols-3">
            {(["Senior Scholars", "Hadith", "Fiqh", "Tafsir", "Arabic", "Farah"] as const).map(
              (name) => (
                <BrowseCardDesktopWeb
                  key={name}
                  name={name}
                  onPress={() => onSelectCategory?.(name)}
                />
              ),
            )}
          </div>
        </section>
      )}
    </section>
  );
}
