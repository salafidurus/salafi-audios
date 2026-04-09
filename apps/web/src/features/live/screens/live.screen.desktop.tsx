"use client";

import { ScreenView } from "../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../shared/components/AppText/AppText";
import type { LiveSessionPublicDto } from "@sd/core-contracts";
import { useLiveSessions } from "@sd/domain-live";
import { LiveSessionCard } from "../components/live-session-card/live-session-card";
import styles from "./live.screen.module.css";

export type LiveDesktopScreenProps = Record<string, never>;

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
            <LiveSessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LiveDesktopScreen() {
  const { active, upcoming, ended } = useLiveSessions();

  return (
    <ScreenView>
      <div className={styles.page}>
        <div className={styles.container}>
          <AppText variant="displayMd">Live Sessions</AppText>

          <div className={styles.twoColumn}>
            <div className={styles.columnMain}>
              <Section
                title="🔴 Live Now"
                sessions={active.sessions}
                isLoading={active.isLoading}
                emptyMessage="No live sessions right now."
              />
            </div>

            <div className={styles.columnSide}>
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
        </div>
      </div>
    </ScreenView>
  );
}
