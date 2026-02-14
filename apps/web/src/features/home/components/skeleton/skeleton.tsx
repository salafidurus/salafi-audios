import { Footer } from "@/features/navigation/components/footer/footer";
import styles from "./skeleton.module.css";

export function Skeleton() {
  return (
    <div className="pageRoot">
      <div className={styles.header} aria-hidden="true">
        <div className={styles.headerInner}>
          <div className={styles.brand} />
          <div className={styles.search} />
          <div className={styles.actions} />
        </div>
      </div>
      <main className="shell">
        <div className={styles.hero} />
        <div className={styles.tabs} />

        <div className={styles.row}>
          <div className={styles.rowTitle} />
          <div className={styles.rowCards}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.card} />
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowTitle} />
          <div className={styles.rowCards}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={styles.card} />
            ))}
          </div>
        </div>

        <div className={styles.stats} />
      </main>
      <Footer />
    </div>
  );
}
