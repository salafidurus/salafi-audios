import { useEffect, useRef, type ReactNode } from "react";
import { List } from "../List";
import styles from "./InfiniteScrollList.module.css";

export interface InfiniteScrollListProps<TData> {
  /** Flattened array of all loaded items */
  data: TData[];
  /** Render function for each item */
  renderItem: (item: TData, index: number) => ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Whether more data can be loaded */
  hasMore: boolean;
  /** Callback to load more data */
  onLoadMore: () => void;
  /** Whether currently fetching next page */
  isFetchingNextPage?: boolean;
  /** Message when no items */
  emptyMessage?: string;
}

export function InfiniteScrollList<TData>({
  data,
  renderItem,
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingNextPage,
  emptyMessage = "No items found",
}: InfiniteScrollListProps<TData>): ReactNode {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isFetchingNextPage]);

  if (isLoading && data.length === 0) {
    return <div className={styles.loading}>Loading items…</div>;
  }

  if (data.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  // Render all items in a List with intersection observer for loading more
  return (
    <List>
      {data.map((item, itemIndex) => (
        <div key={String((item as Record<string, unknown>)?.id)}>{renderItem(item, itemIndex)}</div>
      ))}

      {/* Intersection observer target for loading more */}
      <div ref={observerTarget} className={styles.sentinel} />
      {isFetchingNextPage && <div className={styles.loadingMore}>Loading more…</div>}
    </List>
  );
}
