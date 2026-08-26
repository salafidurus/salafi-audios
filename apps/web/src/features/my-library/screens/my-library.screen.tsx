"use client";

import { useProgressStore, usePlaybackStore } from "@sd/domain-audio";
import { mergeLiveProgress, useInfiniteMyLibraryProgress } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryListSection } from "@/features/my-library/components/my-library-list-section/my-library-list-section";
import { MyLibraryShell } from "@/features/my-library/components/my-library-shell/my-library-shell";

export function MyLibraryScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useInfiniteMyLibraryProgress({
    enabled: isAuthenticated,
  });
  const progressMap = useProgressStore((state) => state.progressMap);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);

  const items = mergeLiveProgress(
    data?.pages.flatMap((page) => page.items) ?? [],
    progressMap,
    currentTrack,
  );

  return (
    <MyLibraryShell activeTab="started">
      <MyLibraryListSection
        title={t("myLibrary.continueListening", "Continue listening")}
        description={t(
          "myLibrary.progressDescription",
          "Resume your current study without losing your place.",
        )}
        variant="progress"
        authState={
          isAuthLoading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated"
        }
        query={{
          items,
          isLoading,
          isError,
          onRetry: () => void refetch(),
          hasMore: false,
          onLoadMore: () => {},
          emptyMessage: t(
            "myLibrary.emptyProgress",
            "Nothing in progress yet. Start a lesson and your place will appear here.",
          ),
        }}
        authCopy={{
          title: t("myLibrary.authProgressTitle", "Sign in to continue your study"),
          description: t(
            "myLibrary.authProgressDesc",
            "Sign in to keep your listening progress available across your devices.",
          ),
          loadingMessage: t("myLibrary.authLoading", "Checking your My Library…"),
        }}
      />
    </MyLibraryShell>
  );
}
