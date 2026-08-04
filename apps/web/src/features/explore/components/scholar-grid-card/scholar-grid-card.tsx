"use client";

import type { ScholarListItemDto } from "@sd/core-contracts";

import Image from "next/image";

import { useTranslation } from "@/core/i18n/use-translation";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./scholar-grid-card.module.css";

export type ScholarGridCardProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarGridCard({ scholar, onPress }: ScholarGridCardProps) {
  const { t } = useTranslation();
  const formatScholarName = useFormatScholarName();
  const formattedName = formatScholarName(scholar);

  return (
    <button type="button" className={styles.card} onClick={() => onPress?.(scholar.slug)}>
      <span className={styles.avatarRing}>
        <span className={styles.avatar}>
          {scholar.imageUrl ? (
            <Image
              src={scholar.imageUrl}
              alt={formattedName}
              width={56}
              height={56}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span className={styles.initials}>{formattedName.charAt(0).toUpperCase()}</span>
          )}
        </span>
      </span>
      <span className={styles.name}>{formattedName}</span>
      <span className={styles.meta}>
        {scholar.mainLanguage?.toUpperCase() || ""}
        {scholar.mainLanguage && scholar.lectureCount > 0 ? " \u00B7 " : ""}
        {scholar.lectureCount > 0
          ? t("scholarContent.statLecturesFormat", "{{count}} Lectures", {
              count: scholar.lectureCount,
            })
          : ""}
      </span>
    </button>
  );
}
