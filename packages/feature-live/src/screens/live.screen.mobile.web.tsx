"use client";

import { ScreenViewWeb, AppText } from "@sd/shared";
import type { LiveSessionPublicDto } from "@sd/core-contracts";
import { useLiveSessions } from "../hooks/use-live-sessions";
import { LiveSessionCardWeb } from "../components/live-session-card/live-session-card.web";
import styles from "./live.screen.module.css";

export type LiveMobileWebScreenProps = Record<string, never>;

function Section({
  title,
  sessions,
  isLoading,
  emptyMessage,
}: {
  title: string;
  sessions: LiveSessionPublicDto[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  return (
    <div className={styles.section}>
      <AppText variant="titleMd">{title}</AppText>
      {isLoading && sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: "var(--content-subtle, #666)" }}>
          Loading…
        </AppText>
      ) : sessions.length === 0 ? (
        <AppText variant="bodyMd" style={{ color: "var(--content-subtle, #666)" }}>
          {emptyMessage}
        </AppText>
      ) : (
        <div className={styles.cardList}>
          {sessions.map((s) => (
            <LiveSessionCardWeb key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LiveMobileWebScreen(_props: LiveMobileWebScreenProps) {
  const { active, upcoming, ended } = useLiveSessions();

  return (
    <ScreenViewWeb>
      <div className={styles.page}>
        <div className={styles.container}>
          <AppText variant="titleLg">Live Sessions</AppText>

          <Section
            title="🔴 Live Now"
            sessions={active.sessions}
            isLoading={active.isLoading}
            emptyMessage="No live sessions right now."
          />
          <Section
            title="Upcoming"
            sessions={upcoming.sessions}
            isLoading={upcoming.isLoading}
            emptyMessage="No upcoming sessions scheduled."
          />
          <Section
            title="Recently Ended"
            sessions={ended.sessions}
            isLoading={ended.isLoading}
            emptyMessage="No recent sessions."
          />
        </div>
      </div>
    </ScreenViewWeb>
  );
}
