"use client";

import type { ScholarDetailDto } from "@sd/core-contracts";

import Image from "next/image";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./scholar-header.module.css";

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
  onFollow?: () => void;
  layout?: "inline" | "sidebar";
};

export function ScholarHeader({ scholar, onFollow, layout = "inline" }: ScholarHeaderProps) {
  const { t } = useTranslation();
  const formatScholarName = useFormatScholarName();
  const initial = scholar.name?.trim().charAt(0).toUpperCase() || "?";

  const statsParts = [
    scholar.mainLanguage?.toUpperCase() || "",
    t("scholarContent.statLecturesFormat", "{{count}} Lectures", { count: scholar.lectureCount }),
  ].filter(Boolean);

  return (
    <div className={cn(styles.root, layout === "sidebar" && styles.sidebar)}>
      <div className={styles.avatarSection}>
        {scholar.imageUrl ? (
          <Image
            src={scholar.imageUrl}
            alt={scholar.name}
            width={92}
            height={92}
            unoptimized
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback} role="img" aria-label={scholar.name}>
            {initial}
          </div>
        )}
      </div>

      <div className={styles.infoColumn}>
        <h1 className={styles.name}>{formatScholarName(scholar)}</h1>
        <p className={styles.stats}>{statsParts.join(" \u00B7 ")}</p>
        {scholar.bio && <p className={styles.bio}>{scholar.bio}</p>}
      </div>

      {onFollow && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={styles.followButton}
          onClick={onFollow}
        >
          {t("scholarContent.follow", "Follow")}
        </Button>
      )}
    </div>
  );
}
