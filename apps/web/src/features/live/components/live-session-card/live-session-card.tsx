"use client";

import type { LiveSessionPublicDto } from "@sd/core-contracts";
import styles from "./live-session-card.module.css";

export type LiveSessionCardWebProps = {
  session: LiveSessionPublicDto;
};

export function LiveSessionCardWeb({ session }: LiveSessionCardWebProps) {
  const telegramUrl = session.telegramSlug ? `https://t.me/${session.telegramSlug}` : undefined;

  const cardClassName =
    session.status === "ended" ? `${styles.card} ${styles.cardEnded}` : styles.card;

  return (
    <a
      className={cardClassName}
      href={telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (!telegramUrl) e.preventDefault();
      }}
    >
      <div className={styles.headerRow}>
        {session.status === "live" && (
          <span className={styles.liveBadge}>
            <span className={styles.pulseDot} />
            LIVE
          </span>
        )}
        <span className={styles.title}>{session.title ?? session.channelDisplayName}</span>
      </div>

      <div className={styles.meta}>
        {session.scholarName && <span>{session.scholarName}</span>}
        {session.scholarName && session.channelDisplayName && <span> · </span>}
        <span>{session.channelDisplayName}</span>
      </div>

      {session.status === "scheduled" && session.scheduledAt && (
        <div className={styles.scheduledTime}>
          Scheduled: {new Date(session.scheduledAt).toLocaleString()}
        </div>
      )}

      {session.status === "ended" && session.endedAt && (
        <div className={styles.endedTime}>Ended: {new Date(session.endedAt).toLocaleString()}</div>
      )}
    </a>
  );
}
