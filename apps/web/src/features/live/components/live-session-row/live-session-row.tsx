"use client";

import React from "react";
import type { LiveSessionPublicDto, LiveSessionDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import { Headphones } from "lucide-react";
import { formatScheduledTime } from "@/features/live/utils/format-scheduled-time";
import styles from "./live-session-row.module.css";

export type LiveSessionRowProps = {
  session: LiveSessionPublicDto | LiveSessionDto;
  onPress?: () => void;
};

export function LiveSessionRow({ session, onPress }: LiveSessionRowProps) {
  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";
  const isEnded = session.status === "ended";
  const telegramSlug = "telegramSlug" in session ? session.telegramSlug : undefined;
  const telegramUrl = telegramSlug ? `https://t.me/${telegramSlug}` : undefined;
  const recordingLectureId = session.recordingLectureId;

  const title =
    session.title ||
    ("channelDisplayName" in session ? session.channelDisplayName : undefined) ||
    "Live Session";
  const scholarName = session.scholarName;
  const channelDisplayName =
    "channelDisplayName" in session ? session.channelDisplayName : undefined;

  const content = (
    <div className={styles.rowContent}>
      <div className={styles.header}>
        {isLive && (
          <span className={styles.liveBadge} data-testid="live-badge">
            <span className={styles.pulseDot} />
            LIVE
          </span>
        )}
        {isScheduled && session.scheduledAt && (
          <span
            className={styles.scheduledBadge}
            data-testid="scheduled-badge"
            suppressHydrationWarning
          >
            {formatScheduledTime(session.scheduledAt)}
          </span>
        )}
        {isEnded && recordingLectureId && (
          <span className={styles.recordingBadge} data-testid="recording-badge">
            <Headphones size={14} className={styles.recordingIcon} />
            Recording Available
          </span>
        )}
        <AppText variant="titleMd">{title}</AppText>
      </div>
      <div className={styles.meta}>
        <AppText variant="bodyMd" style={{ color: "var(--content-subtle)" }}>
          {scholarName}
          {scholarName && channelDisplayName && " · "}
          {channelDisplayName}
        </AppText>
      </div>
    </div>
  );

  if (isLive && telegramUrl) {
    return (
      <a
        className={`${styles.row} listRow`}
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  if (onPress) {
    return (
      <button type="button" className={`${styles.row} listRow`} onClick={onPress}>
        {content}
      </button>
    );
  }

  return <div className={`${styles.row} listRow`}>{content}</div>;
}

export { formatScheduledTime };
