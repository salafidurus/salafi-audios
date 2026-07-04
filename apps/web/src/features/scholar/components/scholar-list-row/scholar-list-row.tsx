"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { ScholarListItemDto } from "@sd/core-contracts";
import styles from "./scholar-list-row.module.css";

export type ScholarListRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarListRow({ scholar, onPress }: ScholarListRowProps) {
  const initial = scholar.name ? scholar.name.trim().charAt(0).toUpperCase() : "?";

  return (
    <button
      type="button"
      onClick={() => onPress?.(scholar.slug)}
      className={`${styles.row} listRow`}
      style={{ cursor: onPress ? "pointer" : "default" }}
    >
      <div className={styles.avatarSection}>
        {scholar.imageUrl ? (
          <div className={styles.avatarContainer}>
            <Image
              src={scholar.imageUrl}
              alt={scholar.name}
              width={72}
              height={72}
              unoptimized
              className={styles.avatarImage}
            />
          </div>
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {initial}
          </div>
        )}
      </div>

      <div className={styles.centerSection}>
        <div className={styles.name}>{scholar.name}</div>
        <div className={styles.meta}>
          {scholar.mainLanguage && (
            <span className={styles.language}>{scholar.mainLanguage}</span>
          )}
          {scholar.isKibar && (
            <span className={styles.kibarBadge}>Senior Scholar</span>
          )}
        </div>
        <div className={styles.lectureCount}>
          {scholar.lectureCount} lectures
        </div>
      </div>

      <div className={styles.rightSection}>
        <ChevronRight className={styles.chevron} size={20} />
      </div>
    </button>
  );
}
