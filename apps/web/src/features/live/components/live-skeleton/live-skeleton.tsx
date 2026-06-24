import styles from "./live-skeleton.module.css";

export type LiveSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

export function LiveSkeleton({ count = 2 }: LiveSkeletonProps) {
  return (
    <div className={styles.list} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`live-skeleton-${i}`} className={styles.card}>
          <div className={`${styles.line} ${styles.lineTitle}`} />
          <div className={`${styles.line} ${styles.lineMeta}`} />
        </div>
      ))}
    </div>
  );
}
