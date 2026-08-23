"use client";

import { useInfiniteLibraryCompleted } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryListSection } from "@/features/library/components/library-list-section/library-list-section";
import { LibraryShell } from "@/features/library/components/library-shell/library-shell";

export function LibraryCompletedScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibraryCompleted({ enabled: isAuthenticated });
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <LibraryShell activeTab="completed">
      <LibraryListSection
        title={t("library.completed", "Completed")}
        description={t(
          "library.completedDescription",
          "Review the lessons and series you have finished.",
        )}
        variant="completed"
        authState={isAuthLoading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated"}
        query={{
          items,
          isLoading,
          isError,
          onRetry: () => void refetch(),
          hasMore: hasNextPage ?? false,
          onLoadMore: () => void fetchNextPage(),
          isFetchingNextPage,
          emptyMessage: t(
            "library.emptyCompleted",
            "Completed lessons will collect here as you finish your study.",
          ),
        }}
        authCopy={{
          title: t("library.authCompletedTitle", "Sign in to view completed lessons"),
          description: t(
            "library.authCompletedDesc",
            "Keep a clear record of the lessons you have finished.",
          ),
          loadingMessage: t("library.authLoading", "Checking your library…"),
        }}
      />
    </LibraryShell>
  );
}
