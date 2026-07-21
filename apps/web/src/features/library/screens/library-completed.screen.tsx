"use client";

import { useInfiniteLibraryCompleted } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export function LibraryCompletedScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibraryCompleted();

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isAuthenticated) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <AuthRequiredState
          title={t("library.authCompletedTitle", "Sign in to view completed history")}
          description={t("library.authCompletedDesc", "Track lectures you've finished")}
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <PageHeader title={t("library.completed", "Completed")} />
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>
        <InfiniteScrollList
          data={allItems}
          isLoading={isLoading}
          hasMore={hasNextPage ?? false}
          onLoadMore={() => fetchNextPage()}
          isFetchingNextPage={isFetchingNextPage}
          renderItem={(item) => <LibraryListRow item={item} variant="completed" />}
          emptyMessage={t(
            "library.emptyCompleted",
            "No completed lectures yet. Finish lectures to track your learning.",
          )}
        />
      </section>
      <ScrollToTopButton />
    </ScreenView>
  );
}
