"use client";

import { useProgressStore, usePlaybackStore } from "@sd/domain-audio";
import { useInfiniteLibraryProgress, mergeLiveProgress } from "@sd/domain-content";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryListRow } from "@/features/library/components/library-list-row/library-list-row";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";

export function LibraryScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteLibraryProgress();
  const progressMap = useProgressStore((s) => s.progressMap);
  const currentTrack = usePlaybackStore((s) => s.currentTrack);

  // Live position/completion always wins over the last-fetched server snapshot,
  // so a tick shows up instantly instead of waiting for the batched sync + refetch.
  const allItems = mergeLiveProgress(
    data?.pages.flatMap((page) => page.items) ?? [],
    progressMap,
    currentTrack,
  );

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
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <PageHeader title={t("library.inProgress", "In Progress")} />
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>
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
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
