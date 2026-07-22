"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
import { formatScholarName } from "@/shared/utils/format-scholar-name";
import styles from "./scholar-list-row.module.css";

export type ScholarListRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarListRow({ scholar, onPress }: ScholarListRowProps) {
  const isRtl = useIsRtl();
  const initial = scholar.name?.trim().charAt(0).toUpperCase() || "?";

  const content = (
    <>
      <div className={styles.avatarSection}>
        {scholar.imageUrl ? (
          <div className={styles.avatarContainer}>
            <Image
              src={scholar.imageUrl}
              alt=""
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
        <div className={styles.name}>{formatScholarName(scholar)}</div>
        <div className={styles.meta}>
          {scholar.mainLanguage && <span className={styles.language}>{scholar.mainLanguage}</span>}
          {scholar.isKibar && <span className={styles.kibarBadge}>Senior Scholar</span>}
        </div>
        <div className={styles.lectureCount}>{scholar.lectureCount} lectures</div>
      </div>

      <div className={styles.rightSection}>
        {onPress &&
          (isRtl ? (
            <ChevronLeft className={styles.chevron} size={20} />
          ) : (
            <ChevronRight className={styles.chevron} size={20} />
          ))}
      </div>
    </>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={() => onPress(scholar.slug)}
        className={`${styles.row} ${styles.interactive} listRow`}
      >
        {content}
      </button>
    );
  }

  return <div className={`${styles.row} listRow`}>{content}</div>;
}
