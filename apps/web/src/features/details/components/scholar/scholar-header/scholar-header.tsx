/** Documents this module's responsibility and public boundary. */
"use client";

import type { ScholarDetailDto } from "@sd/core-contracts";

import Image from "next/image";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./scholar-header.module.css";

/** Scholar identity, summary statistics, and optional follow action for the header. */
export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    /** Total audio duration available for the scholar, in seconds. */
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

function renderAvatar(scholar: ScholarHeaderProps["scholar"], initial: string) {
  if (scholar.imageUrl) {
    return (
      <Image
        src={scholar.imageUrl}
        alt={scholar.name}
        width={92}
        height={92}
        unoptimized
        className={styles.avatar}
      />
    );
  }
  return (
    <div className={styles.avatarFallback} role="img" aria-label={scholar.name}>
      {initial}
    </div>
  );
}

function renderBio(
  bio: string | null | undefined,
  expanded: boolean,
  setExpanded: (update: (value: boolean) => boolean) => void,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!bio) return null;
  return (
    <span className={cn(styles.bioDisclosure, expanded && styles.bioDisclosureExpanded)}>
      <span className={cn(styles.bio, expanded && styles.bioExpanded)}>{bio}</span>
      <button
        type="button"
        className={styles.bioToggle}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded
          ? t("scholarContent.readLess", "Read less")
          : t("scholarContent.readMore", "Read more")}
      </button>
    </span>
  );
}

function renderFollowButton(
  onFollow: ScholarHeaderProps["onFollow"],
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!onFollow) return null;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={styles.followButton}
      onClick={onFollow}
    >
      {t("scholarContent.follow", "Follow")}
    </Button>
  );
}

/** Renders scholar identity, localized summary information, bio, and follow action. */
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
      <div className={styles.avatarSection}>{renderAvatar(scholar, initial)}</div>

      <div className={styles.infoColumn}>
        {scholarTitle && <span className={styles.scholarTitle}>{scholarTitle}</span>}
        <h1 className={styles.name}>{formatScholarName(scholar.name)}</h1>
        <p className={styles.stats}>{statsParts.join(" \u00B7 ")}</p>
        {renderBio(scholar.bio, bioExpanded, setBioExpanded, t)}
      </div>

      {renderFollowButton(onFollow, t)}
    </div>
  );
}
