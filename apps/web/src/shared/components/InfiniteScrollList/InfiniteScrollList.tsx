import { useEffect, useRef, Fragment, type ReactNode } from "react";
import { z } from "zod";

import { List } from "../List";
import styles from "./InfiniteScrollList.module.css";

export interface InfiniteScrollListProps<TData> {
  /** Flattened array of all loaded items */
  data: TData[];
  /** Render function for each item */
  renderItem: (item: TData, index: number) => ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Whether an error occurred */
  isError?: boolean;
  /** Callback to retry loading on error */
  onRetry?: () => void;
  /** Whether more data can be loaded */
  hasMore: boolean;
  /** Callback to load more data */
  onLoadMore: () => void;
  /** Whether currently fetching next page */
  isFetchingNextPage?: boolean;
  /** Message when no items */
  emptyMessage?: string;
  /** Message when an error occurs */
  errorMessage?: string;
}

const ItemWithIdSchema = z.object({
  id: z.union([z.string(), z.number()]),
});

// react-doctor-disable-next-line react-doctor/no-many-boolean-props
export function InfiniteScrollList<TData>({
  data,
  renderItem,
  isLoading,
  isError,
  onRetry,
  hasMore,
  onLoadMore,
  isFetchingNextPage,
  emptyMessage = "No items found",
  errorMessage = "Failed to load content. Please try again.",
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

  if (isError && data.length === 0) {
    return (
      <div className={styles.error} role="alert">
        <span>{errorMessage}</span>
        {onRetry && (
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (isLoading && data.length === 0) {
    return (
      <div className={styles.skeletonContainer} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`list-skeleton-${i}`}
            className={`${styles.skeletonLine} ${styles.skeletonRow}`}
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  // Render all items in a List with intersection observer for loading more
  return (
    <List>
      {data.map((item, itemIndex) => (
        <Fragment
          key={(() => {
            const parsed = ItemWithIdSchema.safeParse(item);
            return parsed.success ? String(parsed.data.id) : String(itemIndex);
          })()}
        >
          {renderItem(item, itemIndex)}
        </Fragment>
      ))}

      {/* Intersection observer target for loading more */}
      <div ref={observerTarget} className={styles.sentinel} />
      {isFetchingNextPage && <div className={styles.loadingMore}>Loading more…</div>}
    </List>
  );
}
