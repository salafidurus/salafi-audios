import styles from "./scholar-grid-skeleton.module.css";

/** Provides an accessible loading placeholder for the scholar grid. */
/** Controls the number of placeholder scholar cards shown during loading. */
export type ScholarGridSkeletonProps = {
  /** Number of skeleton cards to render; defaults to eight. */
  count?: number;
};

/** Renders non-interactive scholar-card placeholders while results load. */
export function ScholarGridSkeleton({ count = 8 }: ScholarGridSkeletonProps) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`scholar-skeleton-${i}`} className={styles.card}>
          <div className={styles.avatar} />
          <div className={`${styles.line} ${styles.lineName}`} />
          <div className={`${styles.line} ${styles.lineCount}`} />
        </div>
      ))}
    </div>
  );
}
