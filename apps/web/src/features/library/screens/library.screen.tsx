"use client";

import { useInfiniteLibraryProgress } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";

export function LibraryScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibraryProgress();

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isAuthenticated) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <AuthRequiredState
          title={t("library.authProgressTitle", "Sign in to view your progress")}
          description={t(
            "library.authProgressDesc",
            "Start listening to lectures and track your progress",
          )}
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <PageHeader title={t("library.inProgress", "In Progress")} />
      <InfiniteScrollList
        data={allItems}
        isLoading={isLoading}
        hasMore={hasNextPage ?? false}
        onLoadMore={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => <LibraryListRow item={item} variant="progress" />}
        emptyMessage={t(
          "library.emptyProgress",
          "No lectures started yet. Browse the catalog to begin listening.",
        )}
      />
    </ScreenView>
  );
}
