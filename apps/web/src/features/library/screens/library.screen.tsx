"use client";

import { useProgressStore, usePlaybackStore } from "@sd/domain-audio";
import {
  useInfiniteLibraryProgress,
  useInfiniteLibrarySaved,
  mergeLiveProgress,
} from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { DownloadAppCard } from "@/features/home/components/download-app-card/download-app-card";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";

import styles from "./library-screens.module.css";

export function LibraryScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data: progressData, isLoading: isLoadingProgress } = useInfiniteLibraryProgress();
  const { data: savedData, isLoading: isLoadingSaved } = useInfiniteLibrarySaved();

  const progressMap = useProgressStore((s) => s.progressMap);
  const currentTrack = usePlaybackStore((s) => s.currentTrack);

  const continuingItems = mergeLiveProgress(
    progressData?.pages.flatMap((page) => page.items) ?? [],
    progressMap,
    currentTrack,
  );

  const savedItems = savedData?.pages.flatMap((page) => page.items) ?? [];

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <h1 className={styles.libraryTitle}>{t("library.title", "Library")}</h1>

      {/* Download app banner */}
      <div className={styles.downloadBanner}>
        <p className={styles.downloadText}>
          {t(
            "library.downloadAppNotice",
            "Take your saved durus with you — download the app for offline listening.",
          )}
        </p>
        <DownloadAppCard compact />
      </div>

      {/* Section 1: Continue listening */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionHeading}>
          {t("library.continueListening", "Continue listening")}
        </h2>
        {isAuthenticated ? (
          <InfiniteScrollList
            data={continuingItems}
            isLoading={isLoadingProgress}
            hasMore={false}
            onLoadMore={() => {}}
            renderItem={(item) => <LibraryListRow item={item} variant="progress" />}
            emptyMessage={t(
              "library.emptyProgress",
              "Nothing in progress. Start a durus and it will show up here.",
            )}
          />
        ) : (
          <div className={styles.emptyCard}>
            <p style={{ margin: 0 }}>
              {t(
                "library.emptyProgress",
                "Nothing in progress. Start a durus and it will show up here.",
              )}
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Saved */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionHeading}>{t("library.saved", "Saved")}</h2>
        {isAuthenticated ? (
          <InfiniteScrollList
            data={savedItems}
            isLoading={isLoadingSaved}
            hasMore={false}
            onLoadMore={() => {}}
            renderItem={(item) => <LibraryListRow item={item} variant="saved" />}
            emptyMessage={t(
              "library.emptySaved",
              "No saved lectures. Bookmark a lecture to easily return to it later.",
            )}
          />
        ) : (
          <div className={styles.emptyCard}>
            <p style={{ margin: 0 }}>
              {t(
                "library.emptySaved",
                "No saved lectures. Bookmark a lecture to easily return to it later.",
              )}
            </p>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className={styles.authRequiredHidden} aria-hidden="true">
          <AuthRequiredState
            title={t("library.authProgressTitle", "Sign in to view your progress")}
            description={t(
              "library.authProgressDesc",
              "Start listening to lectures and track your progress",
            )}
          />
        </div>
      )}

      <ScrollToTopButton />
    </ScreenView>
  );
}
