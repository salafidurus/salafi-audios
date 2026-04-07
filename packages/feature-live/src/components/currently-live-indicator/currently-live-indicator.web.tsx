"use client";

import { useActiveSession } from "../../hooks/use-active-session";
import styles from "./currently-live-indicator.module.css";

export type CurrentlyLiveIndicatorWebProps = {
  /** Show compact version (just the dot and "LIVE") */
  compact?: boolean;
};

export function CurrentlyLiveIndicatorWeb({ compact = false }: CurrentlyLiveIndicatorWebProps) {
  const { activeSession, isLoading } = useActiveSession();

  if (isLoading || !activeSession) {
    return null;
  }

  const telegramUrl = activeSession.telegramSlug
    ? `https://t.me/${activeSession.telegramSlug}`
    : undefined;

  const containerClassName = compact ? styles.containerCompact : styles.container;

  return (
    <a
      className={containerClassName}
      href={telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!telegramUrl) e.preventDefault();
      }}
    >
      <span className={styles.liveBadge}>
        <span className={styles.pulseDot} />
        LIVE
      </span>
      {!compact && (
        <span className={styles.title}>
          {activeSession.title ?? activeSession.channelDisplayName}
        </span>
      )}
    </a>
  );
}
