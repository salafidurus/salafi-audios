"use client";

import { useInfiniteLibraryCompleted } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";

export function LibraryCompletedScreen() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibraryCompleted();

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isAuthenticated) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <AuthRequiredState
          title="Sign in to view completed history"
          description="Track lectures you've finished"
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <PageHeader title="Completed" />
      <InfiniteScrollList
        data={allItems}
        isLoading={isLoading}
        hasMore={hasNextPage ?? false}
        onLoadMore={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => <LibraryListRow item={item} variant="completed" />}
        emptyMessage="No completed lectures yet. Finish lectures to track your learning."
      />
    </ScreenView>
  );
}
