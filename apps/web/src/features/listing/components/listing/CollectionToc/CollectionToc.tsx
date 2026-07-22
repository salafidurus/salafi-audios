"use client";

import React from "react";
import { Minimize2, Maximize2 } from "lucide-react";
import type { ListingModuleDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./CollectionToc.module.css";

export type CollectionTocProps = {
  modules: ListingModuleDto[];
  onSelect: (moduleId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function CollectionToc({
  modules,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
}: CollectionTocProps) {
  if (modules.length === 0) return null;

  return (
    <nav
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ""}`}
      aria-label="Table of Contents"
    >
      <div className={styles.headerRow}>
        {!isCollapsed && (
          <div className={styles.title}>
            <AppText variant="titleMd" color="primary">
              Table of Contents
            </AppText>
          </div>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={styles.toggleButton}
            aria-label={isCollapsed ? "Expand Table of Contents" : "Minimize Table of Contents"}
            title={isCollapsed ? "Expand Table of Contents" : "Minimize Table of Contents"}
          >
            {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className={styles.moduleList}>
          {modules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelect(mod.id)}
              className={styles.moduleButton}
            >
              <span className={styles.moduleText}>{mod.title}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
