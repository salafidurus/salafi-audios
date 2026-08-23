"use client";

import { useInfiniteLibrarySaved } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryListSection } from "@/features/library/components/library-list-section/library-list-section";
import { LibraryShell } from "@/features/library/components/library-shell/library-shell";

export function LibrarySavedScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibrarySaved({ enabled: isAuthenticated });
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <LibraryShell activeTab="saved">
      <LibraryListSection
        title={t("library.saved", "Saved")}
        description={t(
          "library.savedDescription",
          "Keep lessons here when you want to return to them later.",
        )}
        variant="saved"
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
            "library.emptySaved",
            "Your saved lessons will appear here when you bookmark them.",
          ),
        }}
        authCopy={{
          title: t("library.authSavedTitle", "Sign in to view your saved lessons"),
          description: t(
            "library.authSavedDesc",
            "Save lessons to build a personal list you can return to anytime.",
          ),
          loadingMessage: t("library.authLoading", "Checking your library…"),
        }}
      />
    </LibraryShell>
  );
}
