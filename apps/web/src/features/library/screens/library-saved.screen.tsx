"use client";

import { useInfiniteLibrarySaved } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";

export function LibrarySavedScreen() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibrarySaved();

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isAuthenticated) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <AuthRequiredState
          title="Sign in to view saved lectures"
          description="Save lectures to revisit them later"
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <PageHeader title="Saved" />
      <InfiniteScrollList
        data={allItems}
        isLoading={isLoading}
        hasMore={hasNextPage ?? false}
        onLoadMore={() => fetchNextPage()}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => <LibraryListRow item={item} variant="saved" />}
        emptyMessage="No saved lectures yet. Save lectures to keep track of them."
      />
    </ScreenView>
  );
}
