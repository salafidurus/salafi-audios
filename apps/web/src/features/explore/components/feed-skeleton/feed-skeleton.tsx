import styles from "./feed-skeleton.module.css";

export type FeedSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

export function FeedSkeleton({ count = 6 }: FeedSkeletonProps) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`feed-skeleton-${i}`} className={styles.card}>
          <div className={`${styles.line} ${styles.lineTitle}`} />
          <div className={`${styles.line} ${styles.lineMeta}`} />
          <div className={`${styles.line} ${styles.lineSub}`} />
        </div>
      ))}
    </div>
  );
}
