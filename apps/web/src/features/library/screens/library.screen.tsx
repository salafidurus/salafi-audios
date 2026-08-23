"use client";

import { useProgressStore, usePlaybackStore } from "@sd/domain-audio";
import { mergeLiveProgress, useInfiniteLibraryProgress } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryListSection } from "@/features/library/components/library-list-section/library-list-section";
import { LibraryShell } from "@/features/library/components/library-shell/library-shell";

export function LibraryScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useInfiniteLibraryProgress({
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
    <LibraryShell activeTab="started">
      <LibraryListSection
        title={t("library.continueListening", "Continue listening")}
        description={t(
          "library.progressDescription",
          "Resume your current study without losing your place.",
        )}
        variant="progress"
        authState={isAuthLoading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated"}
        query={{
          items,
          isLoading,
          isError,
          onRetry: () => void refetch(),
          hasMore: false,
          onLoadMore: () => {},
          emptyMessage: t(
            "library.emptyProgress",
            "Nothing in progress yet. Start a lesson and your place will appear here.",
          ),
        }}
        authCopy={{
          title: t("library.authProgressTitle", "Sign in to continue your study"),
          description: t(
            "library.authProgressDesc",
            "Sign in to keep your listening progress available across your devices.",
          ),
          loadingMessage: t("library.authLoading", "Checking your library…"),
        }}
      />
    </LibraryShell>
  );
}
