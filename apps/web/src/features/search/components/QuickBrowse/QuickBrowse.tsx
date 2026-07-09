"use client";

import Image from "next/image";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { pickContentField } from "@sd/core-i18n";
import type {
  ScholarChipDto,
  ContentSuggestionDto,
  RecentProgressDto,
  ListingFormat,
} from "@sd/core-contracts";
import styles from "./QuickBrowse.module.css";

const SCHOLAR_SKELETON_COUNT = 5;
const SUGGESTION_SKELETON_COUNT = 3;

export type QuickBrowseProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  isLoading?: boolean;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
  onSelectCategory?: (searchKey: string) => void;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuickBrowse({
  scholars,
  suggestions,
  recentProgress,
  isLoading,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: QuickBrowseProps) {
  const isDesktop = useIsDesktop();
  const showOriginal = useShowOriginalContent();

  return (
    <section className={styles.root}>
      {recentProgress && (
        <DesktopOrSection isDesktop={isDesktop} header="Continue Listening">
          <button
            type="button"
            onClick={() => onContinueListening?.(recentProgress.lectureId)}
            className={styles.continueCard}
          >
            <span className={styles.label}>{recentProgress.lectureTitle}</span>
            <span className={styles.caption}>{recentProgress.scholarName}</span>
            <div className={styles.progressRow}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${recentProgress.durationSeconds > 0 ? Math.round((recentProgress.positionSeconds / recentProgress.durationSeconds) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className={styles.caption}>
                {formatDuration(recentProgress.positionSeconds)} /{" "}
                {formatDuration(recentProgress.durationSeconds)}
              </span>
            </div>
          </button>
        </DesktopOrSection>
      )}

      {scholars && scholars.length > 0 && (
        <DesktopOrSection isDesktop={isDesktop} header="Scholars">
          <div className={styles.scrollRow}>
            {scholars.map((scholar) => (
              <button
                key={scholar.id}
                type="button"
                onClick={() => onSelectScholar?.(scholar.slug)}
                className={styles.scholarChip}
              >
                <div className={styles.avatar}>
                  {isDesktop && scholar.imageUrl ? (
                    <Image
                      src={scholar.imageUrl}
                      alt={scholar.name}
                      width={56}
                      height={56}
                      unoptimized
                      className={styles.cover}
                    />
                  ) : (
                    <span className={styles.scholarInitial}>{scholar.name.charAt(0)}</span>
                  )}
                </div>
                <span className={`${styles.scholarName} ${styles.truncate}`}>{scholar.name}</span>
              </button>
            ))}
          </div>
        </DesktopOrSection>
      )}

      {isLoading && (!scholars || scholars.length === 0) && (
        <DesktopOrSection isDesktop={isDesktop} header="Scholars">
          <div className={styles.skeletonRow}>
            {Array.from({ length: SCHOLAR_SKELETON_COUNT }).map((_, index) => (
              <div key={index} className={styles.skeletonChip}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonName} />
              </div>
            ))}
          </div>
        </DesktopOrSection>
      )}

      {suggestions && suggestions.length > 0 && (
        <DesktopOrSection isDesktop={isDesktop} header="Suggestions">
          <div className={styles.scrollRow}>
            {suggestions.map((item) => {
              const title = pickContentField(item.title, item.original?.title, showOriginal);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSuggestion?.(item.id, item.kind)}
                  className={styles.suggestionCard}
                >
                  <span className={styles.label}>{title}</span>
                  <span className={`${styles.caption} ${styles.truncate}`}>{item.scholarName}</span>
                  <div className={styles.metaRow}>
                    <span className={`${styles.kindBadge} ${styles.caption}`}>{item.kind}</span>
                    {item.durationSeconds != null && (
                      <span className={styles.caption}>{formatDuration(item.durationSeconds)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </DesktopOrSection>
      )}

      {isLoading && (!suggestions || suggestions.length === 0) && (
        <DesktopOrSection isDesktop={isDesktop} header="Suggestions">
          <div className={styles.skeletonRow}>
            {Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonLineLg} />
                <div className={styles.skeletonLineSm} />
              </div>
            ))}
          </div>
        </DesktopOrSection>
      )}
    </section>
  );
}

function DesktopOrSection({
  isDesktop,
  header,
  children,
}: {
  isDesktop: boolean;
  header: string;
  children: React.ReactNode;
}) {
  const Tag = isDesktop ? "section" : "div";
  const HeadingTag = isDesktop ? "h2" : "span";

  return (
    <Tag className={styles.section}>
      <HeadingTag className={styles.header}>{header}</HeadingTag>
      {children}
    </Tag>
  );
}
