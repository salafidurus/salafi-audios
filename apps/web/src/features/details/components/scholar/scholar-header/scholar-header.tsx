"use client";

import type { ScholarDetailDto } from "@sd/core-contracts";

import Image from "next/image";
import { useState } from "react";

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

function languageLabel(
  language: ScholarDetailDto["mainLanguage"],
  t: ReturnType<typeof useTranslation>["t"],
) {
  switch (language) {
    case "ar":
      return t("common.arabic", "Arabic");
    case "en":
      return t("common.english", "English");
    default:
      return language || "";
  }
}

export function ScholarHeader({ scholar, onFollow, layout = "inline" }: ScholarHeaderProps) {
  const { t } = useTranslation();
  const formatScholarName = useFormatScholarName();
  const [bioExpanded, setBioExpanded] = useState(false);
  const initial = scholar.name?.trim().charAt(0).toUpperCase() || "?";
  const scholarTitle = scholar.title
    ? t(`scholar.title.${scholar.title}`, scholar.title)
    : undefined;

  const statsParts = [
    languageLabel(scholar.mainLanguage, t),
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
        {scholarTitle && <span className={styles.scholarTitle}>{scholarTitle}</span>}
        <h1 className={styles.name}>{formatScholarName(scholar.name)}</h1>
        <p className={styles.stats}>{statsParts.join(" \u00B7 ")}</p>
        {scholar.bio && (
          <span className={cn(styles.bioDisclosure, bioExpanded && styles.bioDisclosureExpanded)}>
            <span className={cn(styles.bio, bioExpanded && styles.bioExpanded)}>{scholar.bio}</span>
            <button
              type="button"
              className={styles.bioToggle}
              aria-expanded={bioExpanded}
              onClick={() => setBioExpanded((expanded) => !expanded)}
            >
              {bioExpanded
                ? t("scholarContent.readLess", "Read less")
                : t("scholarContent.readMore", "Read more")}
            </button>
          </span>
        )}
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
