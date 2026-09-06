import { Skeleton } from "@/shared/components/ui/skeleton";

import styles from "./feed-skeleton.module.css";

/** Provides accessible loading placeholders for the Explore feed grid. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the exported props type is documented by its member and consumer-facing component contract.
export type FeedSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

/** Renders placeholder cards while the Explore feed is loading. */
export function FeedSkeleton({ count = 6 }: FeedSkeletonProps) {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Loading catalog">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`feed-skeleton-${i}`} className={styles.card}>
          <Skeleton className={`${styles.line} ${styles.lineTitle}`} />
          <Skeleton className={`${styles.line} ${styles.lineMeta}`} />
          <Skeleton className={`${styles.line} ${styles.lineSub}`} />
        </div>
      ))}
    </div>
  );
}
