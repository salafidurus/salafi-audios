import { Skeleton } from "@/shared/components/ui/skeleton";

import styles from "./feed-skeleton.module.css";

export type FeedSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

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
