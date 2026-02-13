"use client";

import { useEffect } from "react";
import { useCatalogUi } from "@/features/catalog/hooks/use-catalog-ui";

export function CatalogPreferences() {
  const { density, setDensity } = useCatalogUi();

  useEffect(() => {
    document.documentElement.dataset.catalogDensity = density;
  }, [density]);

  return (
    <section className="catalog-preferences-panel" aria-label="Catalog display preferences">
      <span className="catalog-detail-label">View density</span>
      <div className="catalog-chip-row">
        <button
          type="button"
          className={density === "comfortable" ? "catalog-chip is-active" : "catalog-chip"}
          onClick={() => setDensity("comfortable")}
        >
          Comfortable
        </button>
        <button
          type="button"
          className={density === "compact" ? "catalog-chip is-active" : "catalog-chip"}
          onClick={() => setDensity("compact")}
        >
          Compact
        </button>
      </div>
    </section>
  );
}
