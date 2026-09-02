/** Documents this module's responsibility and public boundary. */
"use client";

import type { ScholarChipDto } from "@sd/core-contracts";

import Image from "next/image";

import { useTranslation } from "@/core/i18n/use-translation";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./feed-scholar-row.module.css";

export type FeedScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function FeedScholarRow({ scholars, onScholarPress }: FeedScholarRowProps) {
  const { t } = useTranslation();
  const formatScholarName = useFormatScholarName();
  return (
    <div className={styles.container}>
      <div className={styles.title}>{t("explore.popularScholars", "Popular Scholars")}</div>
      <div className={styles.scroll}>
        {scholars.map((scholar) => (
          <button
            key={scholar.id}
            type="button"
            className={styles.scholarButton}
            onClick={() => onScholarPress?.(scholar.slug)}
          >
            <span className={styles.avatarRing}>
              <span className={styles.avatar}>
                {scholar.imageUrl && (
                  <Image
                    src={scholar.imageUrl}
                    alt={scholar.name}
                    width={48}
                    height={48}
                    style={{ objectFit: "cover" }}
                  />
                )}
              </span>
            </span>
            <span className={styles.name}>{formatScholarName(scholar)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
