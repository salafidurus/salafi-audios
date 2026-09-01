/** Documents this module's responsibility and public boundary. */
"use client";

import { useMyLibrarySections } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryListSection } from "@/features/my-library/components/my-library-list-section/my-library-list-section";
import { MyLibraryShell } from "@/features/my-library/components/my-library-shell/my-library-shell";

/** Renders the URL-backed Completed view using the shared personal-state projection. */
export function MyLibraryCompletedScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const query = useMyLibrarySections(isAuthenticated, false).completed;

  return (
    <MyLibraryShell activeTab="completed">
      <MyLibraryListSection
        title={t("myLibrary.completed", "Completed")}
        description={t(
          "myLibrary.completedDescription",
          "Review the lessons and series you have finished.",
        )}
        variant="completed"
        authState={
          isAuthLoading ? "loading" : isAuthenticated ? "authenticated" : "unauthenticated"
        }
        query={{
          items: query.items,
          isLoading: query.isFetching,
          isError: !!query.error,
          onRetry: () => void query.refetch?.(),
          hasMore: query.hasMore,
          onLoadMore: () => {},
          isFetchingNextPage: false,
          emptyMessage: t(
            "myLibrary.emptyCompleted",
            "Completed lessons will collect here as you finish your study.",
          ),
        }}
        authCopy={{
          title: t("myLibrary.authCompletedTitle", "Sign in to view completed lessons"),
          description: t(
            "myLibrary.authCompletedDesc",
            "Keep a clear record of the lessons you have finished.",
          ),
          loadingMessage: t("myLibrary.authLoading", "Checking your My Library…"),
        }}
      />
    </MyLibraryShell>
  );
}
