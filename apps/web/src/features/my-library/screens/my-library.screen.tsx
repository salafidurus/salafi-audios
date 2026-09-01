/** Documents this module's responsibility and public boundary. */
"use client";

import { useMyLibrarySections } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryListSection } from "@/features/my-library/components/my-library-list-section/my-library-list-section";
import { MyLibraryShell } from "@/features/my-library/components/my-library-shell/my-library-shell";

/** Renders the route-backed Started view with auth-aware shared library data. */
export function MyLibraryScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const query = useMyLibrarySections(isAuthenticated, false).started;

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
          items: query.items,
          isLoading: query.isFetching,
          isError: !!query.error,
          onRetry: () => void query.refetch?.(),
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
