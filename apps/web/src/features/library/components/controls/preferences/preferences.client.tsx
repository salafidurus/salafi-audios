"use client";

import { useEffect } from "react";
import { useLibraryUi } from "@/features/library/hooks/use-library-ui";
import styles from "./preferences.module.css";

export function Preferences() {
  const { density, setDensity } = useLibraryUi();

  useEffect(() => {
    document.documentElement.dataset.libraryDensity = density;
  }, [density]);

  return (
    <section className={styles.panel} aria-label="Library display preferences">
      <span className={styles.label}>View density</span>
      <div className={styles.chipRow}>
        <button
          type="button"
          className={`${styles.chip} ${density === "comfortable" ? styles.chipActive : ""}`.trim()}
          onClick={() => setDensity("comfortable")}
        >
          Comfortable
        </button>
        <button
          type="button"
          className={`${styles.chip} ${density === "compact" ? styles.chipActive : ""}`.trim()}
          onClick={() => setDensity("compact")}
        >
          Compact
        </button>
      </div>
    </section>
  );
}
