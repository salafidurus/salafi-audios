import type { Stats } from "@/features/home/types/home.types";
import styles from "./stats-band.module.css";

type StatsBandProps = {
  stats: Stats;
};

const formatter = new Intl.NumberFormat("en-US", { notation: "compact" });

export function StatsBand({ stats }: StatsBandProps) {
  return (
    <section className={styles.band} aria-label="Platform statistics">
      <div className={styles.inner}>
        <div className={styles.stat}>
          <p className={styles.value}>{formatter.format(stats.totalScholars)}</p>
          <p className={styles.label}>Scholars on the platform</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.value}>{formatter.format(stats.totalLectures)}</p>
          <p className={styles.label}>Lectures published</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.value}>{formatter.format(stats.lecturesPublishedLast30Days)}</p>
          <p className={styles.label}>Lectures in the last 30 days</p>
        </div>
      </div>
    </section>
  );
}
