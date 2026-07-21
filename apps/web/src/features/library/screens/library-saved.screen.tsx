"use client";

import { useInfiniteLibrarySaved } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";

export function LibrarySavedScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibrarySaved();

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isAuthenticated) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <AuthRequiredState
          title={t("library.authSavedTitle", "Sign in to view saved lectures")}
          description={t("library.authSavedDesc", "Save lectures to revisit them later")}
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <PageHeader title={t("library.saved", "Saved")} />
      <InfiniteScrollList
        data={allItems}
        isLoading={isLoading}
        hasMore={hasNextPage ?? false}
        onLoadMore={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => <LibraryListRow item={item} variant="saved" />}
        emptyMessage={t(
          "library.emptySaved",
          "No saved lectures yet. Save lectures to keep track of them.",
        )}
      />
    </ScreenView>
  );
}
