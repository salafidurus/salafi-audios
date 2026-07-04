"use client";

import React from "react";
import type { LiveSessionPublicDto, LiveSessionDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import { Headphones } from "lucide-react";
import styles from "./live-session-row.module.css";

export type LiveSessionRowProps = {
  session: LiveSessionPublicDto | LiveSessionDto;
  onPress?: () => void;
};

export function formatScheduledTime(dateStr: string) {
  const date = new Date(dateStr);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const timePart = date.toLocaleTimeString("en-US", timeOptions);
  const datePart = date.toLocaleDateString("en-US", dateOptions);
  return `${timePart} · ${datePart}`;
}

export function LiveSessionRow({ session, onPress }: LiveSessionRowProps) {
  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";
  const isEnded = session.status === "ended";
  const telegramUrl = session.telegramSlug ? `https://t.me/${session.telegramSlug}` : undefined;
  const recordingLectureId = (session as any).recordingLectureId;

  const title = session.title || ("channelDisplayName" in session ? session.channelDisplayName : undefined) || "Live Session";
  const scholarName = session.scholarName;
  const channelDisplayName = "channelDisplayName" in session ? session.channelDisplayName : undefined;

  const renderContent = () => (
    <div className={styles.rowContent}>
      <div className={styles.header}>
        {isLive && (
          <span className={styles.liveBadge} data-testid="live-badge">
            <span className={styles.pulseDot} />
            LIVE
          </span>
        )}
        {isScheduled && session.scheduledAt && (
          <span className={styles.scheduledBadge} data-testid="scheduled-badge">
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

  const containerProps = {
    className: `${styles.row} listRow`,
  };

  if (isLive && telegramUrl) {
    return (
      <a {...containerProps} href={telegramUrl} target="_blank" rel="noopener noreferrer">
        {renderContent()}
      </a>
    );
  }

  if (onPress) {
    return (
      <button type="button" {...containerProps} onClick={onPress}>
        {renderContent()}
      </button>
    );
  }

  return (
    <div {...containerProps}>
      {renderContent()}
    </div>
  );
}
