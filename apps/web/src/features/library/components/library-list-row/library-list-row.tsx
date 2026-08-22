"use client";

import { routes, type LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { getLibraryItemPercent } from "@sd/domain-content";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./library-list-row.module.css";

export type LibraryListRowProps = {
  item: LibraryItemDto;
  variant: "progress" | "saved" | "completed";
};

export function LibraryListRow({ item, variant }: LibraryListRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const isRtl = useIsRtl();
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  const title = pickContentField(item.listingTitle, item.originalListingTitle, showOriginal);
  const initial = scholarName ? scholarName.trim().charAt(0).toUpperCase() : "?";

  const progress = getLibraryItemPercent(item);
  const statusLabel =
    variant === "progress"
      ? t("library.status.progress", "In progress")
      : variant === "saved"
        ? t("library.status.saved", "Saved")
        : t("library.status.completed", "Completed");
  const seriesProgress =
    item.totalLeafCount && item.totalLeafCount > 0
      ? t("library.seriesProgress", "{{completed}} of {{total}} lessons", {
          completed: item.completedLeafCount ?? 0,
          total: item.totalLeafCount,
        })
      : null;

  const savedAtFormatted = useFormattedDate(item.savedAt || "", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const completedAtFormatted = useFormattedDate(item.completedAt || "", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  let rightLabelText = "";
  if (variant === "progress" && progress !== null) {
    rightLabelText = t("library.percentListened", "{{percent}}% listened", { percent: progress });
  } else if (variant === "saved" && item.savedAt) {
    rightLabelText = t("library.savedOn", "Saved {{date}}", {
      date: savedAtFormatted,
    });
  } else if (variant === "completed" && item.completedAt) {
    rightLabelText = t("library.completedOn", "Completed {{date}}", {
      date: completedAtFormatted,
    });
  } else if (item.durationSeconds) {
    rightLabelText = t("lecture.minutes", "{{count}} min", {
      count: Math.round(item.durationSeconds / 60),
    });
  }

  return (
    <Card size="sm" className={styles.card}>
      <CardContent className={styles.cardContent}>
        <Link
          href={routes.listings.detail(item.listingSlug)}
          className={`${styles.row} listRow`}
          aria-label={`${title} — ${statusLabel}`}
        >
          <div className={styles.avatarSection}>
            <Avatar size="lg" aria-hidden="true">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </div>

          <div className={styles.centerSection}>
            <div className={styles.title}>{title}</div>
            <div className={styles.metadata}>
              <span>
                {scholarName}
                {item.seriesTitle && ` · ${item.seriesTitle}`}
              </span>
              <Badge
                variant={
                  variant === "progress"
                    ? "default"
                    : variant === "completed"
                      ? "secondary"
                      : "outline"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            {seriesProgress && <div className={styles.seriesProgress}>{seriesProgress}</div>}
            {variant === "progress" && progress !== null && (
              <Progress
                value={progress}
                className={styles.progressBar}
                aria-label={t("library.progressLabel", "{{percent}}% listened", {
                  percent: progress,
                })}
                data-testid="progress-bar"
              />
            )}
          </div>

          <div className={styles.rightSection}>
            {rightLabelText && (
              <span className={styles.caption} suppressHydrationWarning>
                {rightLabelText}
              </span>
            )}
            {isRtl ? (
              <ChevronLeft className={styles.chevron} size={20} />
            ) : (
              <ChevronRight className={styles.chevron} size={20} />
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
