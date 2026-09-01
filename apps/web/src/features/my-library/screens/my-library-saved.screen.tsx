/** Documents this module's responsibility and public boundary. */
"use client";

import { useMyLibrarySections } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryListSection } from "@/features/my-library/components/my-library-list-section/my-library-list-section";
import { MyLibraryShell } from "@/features/my-library/components/my-library-shell/my-library-shell";

/** Renders the URL-backed Saved view using the shared personal-state projection. */
export function MyLibrarySavedScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const query = useMyLibrarySections(isAuthenticated, false).saved;

  return (
    <MyLibraryShell activeTab="saved">
      <MyLibraryListSection
        title={t("myLibrary.saved", "Saved")}
        description={t(
          "myLibrary.savedDescription",
          "Keep lessons here when you want to return to them later.",
        )}
        variant="saved"
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
            "myLibrary.emptySaved",
            "Your saved lessons will appear here when you bookmark them.",
          ),
        }}
        authCopy={{
          title: t("myLibrary.authSavedTitle", "Sign in to view your saved lessons"),
          description: t(
            "myLibrary.authSavedDesc",
            "Save lessons to build a personal list you can return to anytime.",
          ),
          loadingMessage: t("myLibrary.authLoading", "Checking your My Library…"),
        }}
      />
    </MyLibraryShell>
  );
}
