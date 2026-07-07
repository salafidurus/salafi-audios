"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./library-list-row.module.css";

export type LibraryListRowProps = {
  item: LibraryItemDto;
  variant: "progress" | "saved" | "completed";
};

export function LibraryListRow({ item, variant }: LibraryListRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const title = pickContentField(item.listingTitle, item.originalListingTitle, showOriginal);
  const initial = item.scholarName ? item.scholarName.trim().charAt(0).toUpperCase() : "?";

  const progress =
    item.durationSeconds && item.progressSeconds
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
      : null;

  let rightLabelText = "";
  if (variant === "progress" && progress !== null) {
    rightLabelText = t("library.percentListened", "{{percent}}% listened", { percent: progress });
  } else if (variant === "saved" && item.savedAt) {
    rightLabelText = t("library.savedOn", "Saved {{date}}", {
      date: new Date(item.savedAt).toLocaleDateString(),
    });
  } else if (variant === "completed" && item.completedAt) {
    rightLabelText = t("library.completedOn", "Completed {{date}}", {
      date: new Date(item.completedAt).toLocaleDateString(),
    });
  } else if (item.durationSeconds) {
    rightLabelText = t("lecture.minutes", "{{count}} min", {
      count: Math.round(item.durationSeconds / 60),
    });
  }

  return (
    <Link href={`/listing/${item.listingSlug}`} className={`${styles.row} listRow`}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarFallback} aria-hidden="true">
          {initial}
        </div>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.title}>{title}</div>
        <div className={styles.metadata}>
          {item.scholarName}
          {item.seriesTitle && ` · ${item.seriesTitle}`}
        </div>
        {variant === "progress" && progress !== null && (
          <div className={styles.progressBarContainer} aria-hidden="true">
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className={styles.rightSection}>
        {rightLabelText && (
          <span className={styles.caption} suppressHydrationWarning>
            {rightLabelText}
          </span>
        )}
        <ChevronRight className={styles.chevron} size={20} />
      </div>
    </Link>
  );
}
