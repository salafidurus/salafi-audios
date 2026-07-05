import styles from "./QuickBrowse.mobile.module.css";
import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

const SCHOLAR_SKELETON_COUNT = 5;
const SUGGESTION_SKELETON_COUNT = 3;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

import type { ListingFormat } from "@sd/core-contracts";

export type QuickBrowseMobileProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  isLoading?: boolean;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function QuickBrowseMobile({
  scholars,
  suggestions,
  recentProgress,
  isLoading,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: QuickBrowseMobileProps) {
  const showOriginal = useShowOriginalContent();

  return (
    <div className={styles.root}>
      {/* Continue Listening */}
      {recentProgress && (
        <div className={styles.section}>
          <span className={styles.header}>Continue Listening</span>
          <button
            type="button"
            onClick={() => onContinueListening?.(recentProgress.lectureId)}
            className={styles.continueCard}
          >
            <span className={styles.continueTitle}>{recentProgress.lectureTitle}</span>
            <span className={styles.continueScholar}>{recentProgress.scholarName}</span>
            <div className={styles.progressRow}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${recentProgress.durationSeconds > 0 ? Math.round((recentProgress.positionSeconds / recentProgress.durationSeconds) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className={styles.progressTime}>
                {formatDuration(recentProgress.positionSeconds)} /{" "}
                {formatDuration(recentProgress.durationSeconds)}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Scholars */}
      {scholars && scholars.length > 0 && (
        <div className={styles.section}>
          <span className={styles.header}>Scholars</span>
          <div className={styles.scholarScroll}>
            <div className={styles.scholarRow}>
              {scholars.map((scholar) => (
                <button
                  key={scholar.id}
                  type="button"
                  onClick={() => onSelectScholar?.(scholar.slug)}
                  className={styles.scholarChip}
                >
                  <div className={styles.scholarAvatar}>
                    <span className={styles.scholarInitial}>{scholar.name.charAt(0)}</span>
                  </div>
                  <span className={styles.scholarName}>{scholar.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scholars skeleton */}
      {isLoading && (!scholars || scholars.length === 0) && (
        <div className={styles.section}>
          <span className={styles.header}>Scholars</span>
          <div className={styles.scholarScroll}>
            <div className={styles.scholarRow}>
              {Array.from({ length: SCHOLAR_SKELETON_COUNT }).map((_, index) => (
                <div key={index} className={styles.scholarChip}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonName} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className={styles.section}>
          <span className={styles.header}>Suggestions</span>
          <div className={styles.suggestionsScroll}>
            <div className={styles.suggestionsRow}>
              {suggestions.map((item) => {
                const title = pickContentField(item.title, item.original?.title, showOriginal);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSuggestion?.(item.id, item.kind)}
                    className={styles.suggestionCard}
                  >
                    <span className={styles.suggestionTitle}>{title}</span>
                    <span className={styles.suggestionScholar}>{item.scholarName}</span>
                    <div className={styles.suggestionMeta}>
                      <div className={styles.kindBadge}>
                        <span className={styles.kindText}>{item.kind}</span>
                      </div>
                      {item.durationSeconds != null && (
                        <span className={styles.durationText}>
                          {formatDuration(item.durationSeconds)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions skeleton */}
      {isLoading && (!suggestions || suggestions.length === 0) && (
        <div className={styles.section}>
          <span className={styles.header}>Suggestions</span>
          <div className={styles.suggestionsScroll}>
            <div className={styles.suggestionsRow}>
              {Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
                <div key={index} className={styles.skeletonCard}>
                  <div className={styles.skeletonLineLg} />
                  <div className={styles.skeletonLineSm} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
