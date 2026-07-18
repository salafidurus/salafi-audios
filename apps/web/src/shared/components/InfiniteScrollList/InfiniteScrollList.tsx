import { useEffect, useRef, type ReactNode } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { List } from "../List";
import styles from "./InfiniteScrollList.module.css";

export interface InfiniteScrollListProps<TData, TError = unknown> {
  /** Query key for the infinite query */
  queryKey: unknown[];
  /** Function to fetch a page of data */
  queryFn: (params: { pageParam?: string }) => Promise<{
    items: TData[];
    nextCursor?: string;
    hasMore: boolean;
  }>;
  /** Render function for each item */
  renderItem: (item: TData, index: number) => ReactNode;
  /** Loading state to show */
  isLoading?: boolean;
  /** Error to show */
  error?: TError | null;
  /** Message when no items */
  emptyMessage?: string;
}

export function InfiniteScrollList<TData, TError = unknown>({
  queryKey,
  queryFn,
  renderItem,
  isLoading,
  error: _error,
  emptyMessage = "No items found",
}: InfiniteScrollListProps<TData, TError>): ReactNode {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Flatten all pages into a single array
  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (status === "error") {
    return <div className={styles.error}>Failed to load items</div>;
  }

  if (status === "pending" || isLoading) {
    return <div className={styles.loading}>Loading items…</div>;
  }

  if (allItems.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  // Render all items in a List with intersection observer for loading more
  return (
    <List>
      {allItems.map((item, itemIndex) => (
        <div key={String((item as Record<string, unknown>)?.id)}>{renderItem(item, itemIndex)}</div>
      ))}

      {/* Intersection observer target for loading more */}
      <div ref={observerTarget} className={styles.sentinel} />
      {isFetchingNextPage && <div className={styles.loadingMore}>Loading more…</div>}
    </List>
  );
}
