import styles from "./QuickBrowse.mobile.module.css";
import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from "@sd/core-contracts";
import { BrowseCardMobile } from "../BrowseCard/BrowseCard.mobile";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type QuickBrowseMobileProps = {
  scholars?: ScholarChipDto[];
  suggestions?: ContentSuggestionDto[];
  recentProgress?: RecentProgressDto | null;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function QuickBrowseMobile({
  scholars,
  suggestions,
  recentProgress,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
  onSelectCategory,
}: QuickBrowseMobileProps) {
  const showFallback =
    (!scholars || scholars.length === 0) && (!suggestions || suggestions.length === 0);

  return (
    <div className={styles.root}>
      {/* Continue Listening */}
      {recentProgress && (
        <div className={styles.section}>
          <span className={styles.header}>Continue Listening</span>
          <button
            type="button"
            onClick={() => onContinueListening?.(recentProgress.lectureSlug)}
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

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className={styles.section}>
          <span className={styles.header}>Suggestions</span>
          <div className={styles.suggestionsScroll}>
            <div className={styles.suggestionsRow}>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSuggestion?.(item.slug)}
                  className={styles.suggestionCard}
                >
                  <span className={styles.suggestionTitle}>{item.title}</span>
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fallback: Browse All */}
      {showFallback && (
        <div>
          <span className={styles.header}>Browse all</span>
          <div className={styles.grid}>
            {(["Senior Scholars", "Hadith", "Fiqh", "Tafsir", "Arabic", "Farah"] as const).map(
              (name) => (
                <div key={name} className={styles.cardWrapper}>
                  <BrowseCardMobile name={name} onPress={() => onSelectCategory?.(name)} />
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
