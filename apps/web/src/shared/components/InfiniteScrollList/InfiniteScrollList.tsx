import { BookOpen, CircleAlert } from "lucide-react";
import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { z } from "zod";

import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableHeader } from "@/shared/components/ui/table";

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
  /** Optional table layout for tabular data. */
  layout?: "list" | "table";
  /** Header row rendered when using the table layout. */
  tableHeader?: ReactNode;
}

const ItemWithIdSchema = z.object({
  id: z.union([z.string(), z.number()]),
});

function itemKey<TData>(item: TData, index: number): string {
  const parsed = ItemWithIdSchema.safeParse(item);
  return parsed.success ? String(parsed.data.id) : String(index);
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className={styles.error}>
      <CircleAlert aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}

function LoadingState() {
  return (
    <div className={styles.skeletonContainer} role="status" aria-label="Loading content">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={`list-skeleton-${i}`} className={styles.skeletonRow} />
      ))}
    </div>
  );
}

function EmptyState({
  message,
  hasMore,
  isFetchingNextPage,
  observerTarget,
}: {
  message: string;
  hasMore: boolean;
  isFetchingNextPage?: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <Empty className={styles.empty}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen aria-hidden="true" />
          </EmptyMedia>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
      {hasMore && (
        <div
          ref={observerTarget}
          className={styles.sentinel}
          data-testid="infinite-scroll-sentinel"
        />
      )}
      {hasMore && isFetchingNextPage && <div className={styles.loadingMore}>Loading more…</div>}
    </>
  );
}

function ListItems<TData>({
  data,
  renderItem,
}: Pick<InfiniteScrollListProps<TData>, "data" | "renderItem">) {
  return (
    <>
      {data.map((item, index) => (
        <Fragment key={itemKey(item, index)}>{renderItem(item, index)}</Fragment>
      ))}
    </>
  );
}

function LoadedState<TData>({
  data,
  renderItem,
  layout,
  tableHeader,
  observerTarget,
  isFetchingNextPage,
}: Pick<InfiniteScrollListProps<TData>, "data" | "renderItem" | "layout" | "tableHeader"> & {
  observerTarget: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
}) {
  const loadingMore = isFetchingNextPage ? (
    <div className={styles.loadingMore}>Loading more…</div>
  ) : null;
  const sentinel = (
    <div ref={observerTarget} className={styles.sentinel} data-testid="infinite-scroll-sentinel" />
  );

  if (layout === "table") {
    return (
      <>
        <Table>
          {tableHeader && <TableHeader>{tableHeader}</TableHeader>}
          <TableBody>
            <ListItems data={data} renderItem={renderItem} />
          </TableBody>
        </Table>
        {sentinel}
        {loadingMore}
      </>
    );
  }

  return (
    <List>
      <ListItems data={data} renderItem={renderItem} />
      {sentinel}
      {loadingMore}
    </List>
  );
}

function renderEmptyState<TData>({
  data,
  isError,
  errorMessage,
  onRetry,
  isLoading,
  emptyMessage,
  hasMore,
  isFetchingNextPage,
  observerTarget,
}: {
  data: TData[];
  isError?: boolean;
  errorMessage: string;
  onRetry?: () => void;
  isLoading?: boolean;
  emptyMessage: string;
  hasMore: boolean;
  isFetchingNextPage?: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
}): ReactNode | null {
  if (isError && data.length === 0) return <ErrorState message={errorMessage} onRetry={onRetry} />;
  if (isLoading && data.length === 0) return <LoadingState />;
  if (data.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        hasMore={hasMore}
        isFetchingNextPage={isFetchingNextPage}
        observerTarget={observerTarget}
      />
    );
  }
  return null;
}

function useInfiniteScrollObserver(
  hasMore: boolean,
  onLoadMore: () => void,
  isFetchingNextPage: boolean,
) {
  const observerTarget = useRef<HTMLDivElement>(null);

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

  return observerTarget;
}

function normalizeListFlags(
  isLoading: boolean | undefined,
  isError: boolean | undefined,
  isFetchingNextPage: boolean | undefined,
) {
  return {
    isLoading: isLoading ?? false,
    isError: isError ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
  };
}

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
  layout = "list",
  tableHeader,
}: InfiniteScrollListProps<TData>): ReactNode {
  const flags = normalizeListFlags(isLoading, isError, isFetchingNextPage);
  const observerTarget = useInfiniteScrollObserver(hasMore, onLoadMore, flags.isFetchingNextPage);

  const emptyState = renderEmptyState({
    data,
    isError: flags.isError,
    errorMessage,
    onRetry,
    isLoading: flags.isLoading,
    emptyMessage,
    hasMore,
    isFetchingNextPage: flags.isFetchingNextPage,
    observerTarget,
  });
  if (emptyState) return emptyState;

  return (
    <LoadedState
      data={data}
      renderItem={renderItem}
      layout={layout}
      tableHeader={tableHeader}
      observerTarget={observerTarget}
      isFetchingNextPage={flags.isFetchingNextPage}
    />
  );
}
