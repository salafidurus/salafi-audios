"use client";

import Image from "next/image";
import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

const SCHOLAR_SKELETON_COUNT = 5;
const SUGGESTION_SKELETON_COUNT = 3;

import type { ListingFormat } from "@sd/core-contracts";

export type QuickBrowseDesktopProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  isLoading?: boolean;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuickBrowseDesktop({
  scholars,
  suggestions,
  recentProgress,
  isLoading,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: QuickBrowseDesktopProps) {
  const showOriginal = useShowOriginalContent();

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
            onClick={() => onContinueListening?.(recentProgress.lectureId)}
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
          <div className="no-scrollbar flex gap-[var(--space-component-gap-md)] overflow-x-auto pb-[var(--space-scale-xs)]">
            {scholars.map((scholar) => (
              <button
                key={scholar.id}
                type="button"
                onClick={() => onSelectScholar?.(scholar.slug)}
                className="flex shrink-0 flex-col items-center gap-[var(--space-scale-xs)] transition hover:opacity-80"
              >
                <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-[var(--border-default)] bg-[var(--surface-default)]">
                  {scholar.imageUrl ? (
                    <Image
                      src={scholar.imageUrl}
                      alt={scholar.name}
                      width={56}
                      height={56}
                      unoptimized
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

      {/* Scholars skeleton */}
      {isLoading && (!scholars || scholars.length === 0) && (
        <section className="flex flex-col gap-[var(--space-component-gap-md)]">
          <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
            Scholars
          </h2>
          <div className="flex gap-[var(--space-component-gap-md)]">
            {Array.from({ length: SCHOLAR_SKELETON_COUNT }).map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 flex-col items-center gap-[var(--space-scale-xs)]"
              >
                <div className="size-14 animate-pulse rounded-full bg-[var(--surface-hover)]" />
                <div className="h-[10px] w-12 animate-pulse rounded-[var(--radius-component-chip)] bg-[var(--surface-hover)]" />
              </div>
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
          <div className="no-scrollbar flex gap-[var(--space-component-gap-md)] overflow-x-auto pb-[var(--space-scale-xs)]">
            {suggestions.map((item) => {
              const title = pickContentField(item.title, item.original?.title, showOriginal);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSuggestion?.(item.id, item.kind)}
                  className="flex w-48 shrink-0 flex-col gap-[var(--space-scale-xs)] rounded-[var(--radius-component-card)] border border-[var(--border-default)] bg-[var(--surface-default)] p-[var(--space-component-card-padding)] text-left transition hover:border-[var(--accent-primary-subtle-border)] hover:bg-[var(--accent-primary-subtle-surface)]"
                >
                  <span className="text-[var(--content-strong)]" style={labelStyle}>
                    {title}
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
              );
            })}
          </div>
        </section>
      )}

      {/* Suggestions skeleton */}
      {isLoading && (!suggestions || suggestions.length === 0) && (
        <section className="flex flex-col gap-[var(--space-component-gap-md)]">
          <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
            Suggestions
          </h2>
          <div className="flex gap-[var(--space-component-gap-md)]">
            {Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
              <div
                key={index}
                className="flex w-48 shrink-0 animate-pulse flex-col gap-[var(--space-scale-xs)] rounded-[var(--radius-component-card)] bg-[var(--surface-hover)] p-[var(--space-component-card-padding)]"
              >
                <div className="h-[14px] rounded-[var(--radius-component-chip)] bg-[var(--surface-default)]" />
                <div className="h-[10px] w-3/5 rounded-[var(--radius-component-chip)] bg-[var(--surface-default)]" />
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
