import { Skeleton } from "@/shared/components/ui/skeleton";

import styles from "./feed-skeleton.module.css";

/** Explore-feed loading presentation and its placeholder-card contract. */
/**
 * Controls the number of temporary Explore-feed cards shown while catalog data
 * is pending. The value is presentation-only and defaults to six cards when
 * omitted; it does not affect the eventual result set.
 */
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
