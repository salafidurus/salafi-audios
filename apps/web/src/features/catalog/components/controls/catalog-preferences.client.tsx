"use client";

import { useEffect } from "react";
import { useCatalogUi } from "@/features/catalog/hooks/use-catalog-ui";
import styles from "./catalog-preferences.client.module.css";

export function CatalogPreferences() {
  const { density, setDensity } = useCatalogUi();

  useEffect(() => {
    document.documentElement.dataset.catalogDensity = density;
  }, [density]);

  return (
    <section
      className={styles["catalog-preferences-panel"]}
      aria-label="Catalog display preferences"
    >
      <span className={styles["catalog-detail-label"]}>View density</span>
      <div className={styles["catalog-chip-row"]}>
        <button
          type="button"
          className={`${styles["catalog-chip"]} ${
            density === "comfortable" ? styles["catalog-chip-active"] : ""
          }`.trim()}
          onClick={() => setDensity("comfortable")}
        >
          Comfortable
        </button>
        <button
          type="button"
          className={`${styles["catalog-chip"]} ${
            density === "compact" ? styles["catalog-chip-active"] : ""
          }`.trim()}
          onClick={() => setDensity("compact")}
        >
          Compact
        </button>
      </div>
    </section>
  );
}
