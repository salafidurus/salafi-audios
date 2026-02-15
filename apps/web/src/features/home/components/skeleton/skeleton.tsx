import tabStyles from "@/features/home/components/recommendations/tabs/tabs.module.css";
import styles from "./skeleton.module.css";

export function HeroSkeleton() {
  return <div className={styles.hero} aria-hidden="true" />;
}

export function TabsSkeleton() {
  return (
    <section className={styles.tabsShell} aria-hidden="true">
      <div className={tabStyles.tabs}>
        <button type="button" className={`${tabStyles.tab} ${tabStyles.tabActive}`.trim()}>
          Recommended
        </button>
        <button type="button" className={tabStyles.tab}>
          Following
        </button>
        <button type="button" className={tabStyles.tab}>
          Latest
        </button>
        <button type="button" className={tabStyles.tab}>
          Popular
        </button>
      </div>

      <div className={styles.row}>
        <p className={styles.rowHeading}>Lessons by Senior Scholars</p>
        <div className={styles.rowCards}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`featured-${index}`} className={styles.card} />
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <p className={styles.rowHeading}>Recommended topics</p>
        <div className={styles.rowCards}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`topics-${index}`} className={styles.card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSkeleton() {
  return <div className={styles.stats} aria-hidden="true" />;
}
